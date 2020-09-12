
function makePath(n2k) {
  return `network.n2k.ngt-1.${n2k.fields['Serial ID']}`
}

module.exports = [
  {
    source: 'Ch2 Tx Bandwidth',
    node: (n2k) => `${makePath(n2k)}.ch2.txBandwidth`
  },
  {
    source: 'Ch1 BufferLoading',
    node: (n2k) => `${makePath(n2k)}.ch1.BufferLoading`
  },
  {
    source: 'Indi channel count',
    node: (n2k) => `${makePath(n2k)}.indiChannelCount`
  },
  {
    source: 'Ch1 PointerLoading',
    node: (n2k) => `${makePath(n2k)}.ch1.PointerLoading`
  },
  {
    source: 'Ch2 Rx Bandwidth',
    node: (n2k) => `${makePath(n2k)}.ch2.rxBandwidth`
  },
  {
    source: 'Ch1 Rx Dropped',
    node: (n2k) => `${makePath(n2k)}.ch1.rxDropped`
  },
  {
    source: 'Ch1 Rx Bandwidth',
    node: (n2k) => `${makePath(n2k)}.ch1.rxBandwidth`
  },
  {
    source: 'Ch1 Rx Load',
    node: (n2k) => `${makePath(n2k)}.ch1.rxLoad`
  },
  {
    source: 'Ch2 Rx Filtered',
    node: (n2k) => `${makePath(n2k)}.ch2.rxFiltered`
  },
  {
    source: 'Ch2 PointerLoading',
    node: (n2k) => `${makePath(n2k)}.ch2.pointerLoading`
  },
  {
    source: 'Ch2 Rx Load',
    node: (n2k) => `${makePath(n2k)}.ch2.rxLoad`
  },
  {
    source: 'Ch1 Tx Bandwidth',
    node: (n2k) => `${makePath(n2k)}.ch1.txBandwidth`
  },
  {
    source: 'Model ID',
    node: (n2k) => `${makePath(n2k)}.modelID`
  },
  {
    source: 'Uni channel count',
    node: (n2k) => `${makePath(n2k)}.uniChannelCount`
  },
  {
    source: 'Ch1 Bandwidth',
    node: (n2k) => `${makePath(n2k)}.ch1.bandwidth`
  },
  {
    source: '',
    node: (n2k) => `${makePath(n2k)}.`
  },
  {
    source: 'Ch2 Deleted',
    node: (n2k) => `${makePath(n2k)}.ch2.deleted`
  },
  {
    source: 'Ch1 Deleted',
    node: (n2k) => `${makePath(n2k)}.ch1.deleted`
  },
  {
    source: 'Ch2 Tx Load',
    node: (n2k) => `${makePath(n2k)}.ch2.txLoad`
  },
  {
    source: 'Ch2 BufferLoading',
    node: (n2k) => `${makePath(n2k)}.ch2.bufferLoading`
  },
  {
    source: 'Ch1 Rx Filtered',
    node: (n2k) => `${makePath(n2k)}.ch1.rxFiltered`
  },
  {
    source: 'Ch1 Tx Load',
    node: (n2k) => `${makePath(n2k)}.ch1.txLoad`
  },
  {
    source: 'Ch2 Rx Dropped',
    node: (n2k) => `${makePath(n2k)}.ch2.rxDropped`
  },
  {
    source: 'Error ID',
    node: (n2k) => `${makePath(n2k)}.errorID`
  },
  {
    source: 'Ch2 Bandwidth',
    node: (n2k) => `${makePath(n2k)}.ch2Bandwidth`
  }
]
