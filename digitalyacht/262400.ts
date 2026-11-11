// ts-pgns has no type for 262400 (Digital Yacht iKonvert status); these
// mappings read the field names canboatjs decodes it with.
type Frame = { src: number; fields: Record<string, unknown> }

// The gateway sends this itself, so its address is the frame's source when
// it leaves the gateway address out.
function makePath(n2k: Frame) {
  return `network.n2k.ikonvert.${n2k.fields.gatewayAddress ?? n2k.src}`
}

module.exports = [
  {
    // A percentage; nothing when the gateway doesn't send it
    value: (n2k: Frame) =>
      n2k.fields.canNetworkLoad == null
        ? undefined
        : Number(n2k.fields.canNetworkLoad) / 100,
    node: (n2k: Frame) => `${makePath(n2k)}.canNetworkLoad`
  },
  ...[
    'errors',
    'deviceCount',
    'uptime',
    'gatewayAddress',
    'rejectedTxRequests'
  ].map((source) => ({
    source,
    node: (n2k: Frame) => `${makePath(n2k)}.${source}`
  }))
]
