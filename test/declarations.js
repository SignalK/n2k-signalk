const { execFileSync } = require('child_process')
const path = require('path')

const TSC_TIMEOUT_MS = 60000

describe('declarations', function () {
  this.timeout(TSC_TIMEOUT_MS)

  it('type-check a strict consumer without skipLibCheck', function () {
    const project = path.join(__dirname, 'declarations', 'tsconfig.json')
    try {
      execFileSync(
        process.execPath,
        [require.resolve('typescript/bin/tsc'), '-p', project],
        { encoding: 'utf8' }
      )
    } catch (err) {
      throw new Error(err.stdout || err.message)
    }
  })
})
