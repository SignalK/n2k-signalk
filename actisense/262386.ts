// ts-pgns has no type for 262386 (Actisense NGT-1 system status); these
// mappings read the field names canboatjs decodes it with.
type Frame = { fields: Record<string, unknown> }

function makePath(n2k: Frame) {
  return `network.n2k.ngt-1.${n2k.fields.serialId}`
}

// Decoded field name, and the path under network.n2k.ngt-1.<serial ID>
const FIELDS: [string, string][] = [
  ['modelId', 'modelId'],
  ['errorId', 'errorId'],
  ['indiChannelCount', 'indiChannelCount'],
  ['uniChannelCount', 'uniChannelCount'],
  ...[1, 2].flatMap((ch): [string, string][] => [
    [`ch${ch}RxBandwidth`, `ch${ch}.rxBandwidth`],
    [`ch${ch}RxLoad`, `ch${ch}.rxLoad`],
    [`ch${ch}RxFiltered`, `ch${ch}.rxFiltered`],
    [`ch${ch}RxDropped`, `ch${ch}.rxDropped`],
    [`ch${ch}TxBandwidth`, `ch${ch}.txBandwidth`],
    [`ch${ch}TxLoad`, `ch${ch}.txLoad`],
    [`ch${ch}Bandwidth`, `ch${ch}.bandwidth`],
    [`ch${ch}Deleted`, `ch${ch}.deleted`],
    [`ch${ch}Bufferloading`, `ch${ch}.bufferLoading`],
    [`ch${ch}Pointerloading`, `ch${ch}.pointerLoading`]
  ])
]

module.exports = FIELDS.map(([source, leaf]) => ({
  source,
  node: (n2k: Frame) => `${makePath(n2k)}.${leaf}`
}))
