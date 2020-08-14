function makePath(n2k) {
  return `network.n2k.ikonvert.${n2k.fields['Gateway address']}`
}

module.exports = [
  {
    value: (n2k) => Number(n2k.fields['CAN network load'])/100,
    node: (n2k) => `${makePath(n2k)}.canNetworkLoad`
  },
  {
    source: 'Errors',
    node: (n2k) => `${makePath(n2k)}.errors`
  },
  {
    source: 'Device count',
    node: (n2k) => `${makePath(n2k)}.deviceCount`
  },
  {
    source: 'Uptime',
    node: (n2k) => `${makePath(n2k)}.uptime`
  },
  {
    source: 'Gateway address',
    node: (n2k) => `${makePath(n2k)}.gatewayAddress`
  },
  {
    source: 'Rejected TX requests',
    node: (n2k) => `${makePath(n2k)}.rejectedTxRequests`
  }
]
