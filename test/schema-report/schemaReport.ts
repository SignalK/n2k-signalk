// Runs canboat's sample logs through the mapper, looks up each path it writes
// in @signalk/path-metadata, other than notifications, and validates what it
// writes against the Signal K schema. Failures in baseline.json are known; anything
// else fails, and so does a baseline entry that no longer fails, so the
// baseline can only shrink.
//
//   npx ts-node test/schema-report/schemaReport.ts <canboat samples dir> [--update]
//
// --update rewrites baseline.json with the current failures, keeping the
// issue and note of each entry that still fails.

import fs from 'fs'
import path from 'path'
import { FromPgn } from '@canboat/canboatjs'
import { getMetadata } from '@signalk/path-metadata'
import { N2kMapper } from '../../dist/n2kMapper'

const schema = require('@signalk/signalk-schema')

interface Failure {
  pgn: number
  path: string
  message: string
  issue?: number
  note?: string
}

interface Found {
  failure: Failure
  files: Set<string>
  example: unknown
}

const BASELINE = path.join(__dirname, 'baseline.json')
const SELF = schema.fakeMmsiId
const TIMESTAMP = '2026-01-01T00:00:00.000Z'
// Readings repeat; validate each PGN's distinct outputs up to this many.
const MAX_PER_PGN = 300
const NOT_TEXT = /\.(ebl|pcap|csv|awk|dle|trc|DS_Store)$/

const NOT_DEFINED = 'Not in @signalk/path-metadata'
const NON_FINITE = 'Not a finite number (sent as null)'

const keyOf = (f: Failure) => `${f.pgn}\t${f.path}\t${f.message}`

// The paths and the value types, so a new reading of the same kind is skipped.
function shape(delta: any): string {
  return JSON.stringify(
    delta.updates.map((update: any) =>
      (update.values ?? []).map((pv: any) => [
        pv.path,
        JSON.stringify(pv.value, (_, v) => (typeof v === 'number' ? 0 : v))
      ])
    )
  )
}

function merge(into: any, from: any) {
  for (const [key, value] of Object.entries(from)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      into[key] ??= {}
      merge(into[key], value)
    } else {
      into[key] = value
    }
  }
}

// Validate the delta's context alone, as the tests do for the vessel: the
// sources, and the timestamps the server sets, aren't the mapper's to get right.
function validate(delta: any): { path: string; message: string }[] {
  const d = JSON.parse(JSON.stringify(delta))
  d.context ??= 'vessels.' + SELF
  // deltaToFull puts a value with an empty path under a "" key; the server
  // merges it into the context itself.
  const top: any[] = []
  for (const update of d.updates) {
    update.timestamp = TIMESTAMP
    top.push(...update.values.filter((pv: any) => pv.path === ''))
    // null is how the specification says a reading isn't available ("Missing
    // or Invalid Data" in data_model.md), on any path; the full-model
    // schemas, which the specification no longer maintains, don't allow it.
    update.values = update.values.filter(
      (pv: any) => pv.path !== '' && pv.value !== null
    )
  }
  const [kind, ...rest] = d.context.split('.')
  const id = rest.join('.')
  const node = schema.deltaToFull(d)[kind]?.[id] ?? {}
  for (const pv of top) merge(node, pv.value)
  if (kind === 'vessels' && !node.mmsi && !node.url && !node.uuid) {
    node.mmsi = '230099999'
  }
  // Under a valid key: test logs have made-up MMSIs, such as 999999999.
  const result = schema.validateFull({
    [kind]: { [kind === 'vessels' ? SELF : id]: node },
    self: SELF,
    version: '1.0.0'
  })
  if (result.valid) return []
  return result.errors
    .map((e: any) => ({
      path: e.dataPath
        .replace(/^\/(vessels|atons|sar|aircraft|shore)\/[^/]+/, '/$1/*')
        .replace(/\/[0-9]+(?=\/|$)/g, '/N'),
      message: e.message
    }))
    .filter(
      // The root, and the vessel's anyOf of identities, fail along with any
      // error below them.
      (e: { path: string; message: string }) =>
        e.path !== '' &&
        !(
          e.path === '/vessels/*' &&
          /^Missing required property: (url|uuid)$/.test(e.message)
        )
    )
}

// The paths in a delta whose value is, or holds, NaN or an infinity. JSON
// sends those as null, which validate leaves out as a reading that isn't
// available, so a broken calculation would pass unseen.
function nonFinite(delta: any): string[] {
  const found: string[] = []
  const walk = (value: any, path: string) => {
    if (typeof value === 'number' && !Number.isFinite(value)) found.push(path)
    else if (value && typeof value === 'object')
      for (const [k, v] of Object.entries(value))
        walk(v, path === '' ? k : `${path}.${k}`)
  }
  for (const update of delta.updates)
    for (const pv of update.values ?? []) walk(pv.value, pv.path)
  return found
}

// The paths a delta writes, including the keys of a value with an empty path.
// Notifications are left out: their paths are open-ended.
function paths(delta: any): string[] {
  return delta.updates
    .flatMap((update: any) => update.values ?? [])
    .flatMap((pv: any) =>
      pv.path === ''
        ? keys(pv.value, '')
        : pv.path.startsWith('notifications.')
          ? []
          : [pv.path]
    )
}

// A value with an empty path goes into the context itself: each of its keys
// is a path, and so is each key of an object below it, such as
// communication.callsignVhf.
function keys(value: any, under: string): string[] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return []
  return Object.entries(value).flatMap(([key, v]) => [
    under + key,
    ...keys(v, under + key + '.')
  ])
}

// An instance (1, 1c2, zone3, userDefined129) ends in N, so the baseline
// doesn't depend on which instances the samples happen to hold.
const pattern = (p: string) =>
  p
    .split('.')
    .map((s) => (/^[0-9]/.test(s) ? 'N' : s.replace(/[0-9]+$/, 'N')))
    .join('.')

function run(dir: string): { found: Map<string, Found>; stats: string } {
  const found = new Map<string, Found>()
  const seen = new Set<string>()
  const looked = new Set<string>()
  const perPgn = new Map<number, number>()
  let frames = 0
  let validated = 0

  const add = (failure: Failure, file: string, example: unknown) => {
    const key = keyOf(failure)
    const f = found.get(key) ?? { failure, files: new Set(), example }
    f.files.add(file)
    found.set(key, f)
  }

  for (const file of fs.readdirSync(dir).sort()) {
    const p = path.join(dir, file)
    if (NOT_TEXT.test(file) || !fs.statSync(p).isFile()) continue
    const parser = new FromPgn({ useCamel: true })
    parser.on('warning', () => {})
    parser.on('error', () => {})
    const mapper = new N2kMapper()
    for (const line of fs.readFileSync(p, 'latin1').split(/\r?\n/)) {
      let n2k: any
      try {
        n2k = line && parser.parseString(line)
      } catch {
        continue
      }
      if (!n2k) continue
      frames++
      let delta: any
      try {
        delta = mapper.toDelta(n2k)
      } catch (e: any) {
        add({ pgn: n2k.pgn, path: '', message: `throws: ${e.message}` }, file, {
          n2k
        })
        continue
      }
      if (!delta?.updates?.length) continue
      for (const p of nonFinite(delta)) {
        const key = `${n2k.pgn} ${p} non-finite`
        if (looked.has(key)) continue
        looked.add(key)
        add({ pgn: n2k.pgn, path: pattern(p), message: NON_FINITE }, file, {
          n2k,
          path: p
        })
      }
      // Every path, before the readings are thinned out below.
      for (const p of paths(delta)) {
        const key = `${n2k.pgn} ${p}`
        if (looked.has(key)) continue
        looked.add(key)
        if (!getMetadata('vessels.self.' + p)) {
          add({ pgn: n2k.pgn, path: pattern(p), message: NOT_DEFINED }, file, {
            n2k,
            path: p
          })
        }
      }
      const key = `${n2k.pgn} ${shape(delta)}`
      if (seen.has(key)) continue
      seen.add(key)
      const count = perPgn.get(n2k.pgn) ?? 0
      if (count >= MAX_PER_PGN) continue
      perPgn.set(n2k.pgn, count + 1)
      validated++
      for (const e of validate(delta)) {
        add({ pgn: n2k.pgn, ...e }, file, {
          n2k,
          values: delta.updates.flatMap((u: any) => u.values)
        })
      }
    }
  }
  return {
    found,
    stats: `${frames} frames, ${validated} distinct deltas validated`
  }
}

function main() {
  const args = process.argv.slice(2)
  const dir = args.find((a) => !a.startsWith('--'))
  if (!dir) {
    console.error('usage: schemaReport.ts <canboat samples dir> [--update]')
    process.exit(2)
  }
  // The mapper logs each value it leaves out; the report is what matters here.
  const { error, warn } = console
  console.error = console.warn = () => {}
  const { found, stats } = run(dir)
  Object.assign(console, { error, warn })
  const baseline: Failure[] = JSON.parse(fs.readFileSync(BASELINE, 'utf8'))
  const known = new Map(baseline.map((f) => [keyOf(f), f]))

  if (args.includes('--update')) {
    const next = [...found.values()]
      .map(({ failure }) => ({ ...failure, ...known.get(keyOf(failure)) }))
      .sort(
        (a, b) =>
          a.pgn - b.pgn ||
          a.path.localeCompare(b.path) ||
          a.message.localeCompare(b.message)
      )
    fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n')
    console.log(`${stats}; baseline has ${next.length} entries`)
    return
  }

  const added = [...found.values()].filter(
    ({ failure }) => !known.has(keyOf(failure))
  )
  const fixed = baseline.filter((f) => !found.has(keyOf(f)))
  console.log(`${stats}; ${found.size} known failures`)
  for (const { failure, files, example } of added) {
    console.log(
      `\nNEW ${failure.pgn} ${failure.path}: ${failure.message}` +
        `\n  in ${[...files].slice(0, 3).join(', ')}` +
        `\n  ${JSON.stringify(example)}`
    )
  }
  for (const f of fixed) {
    console.log(
      `\nFIXED ${f.pgn} ${f.path}: ${f.message}; remove it from baseline.json`
    )
  }
  if (added.length || fixed.length) process.exit(1)
}

main()
