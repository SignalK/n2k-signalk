const EVENT_TO_AUTOPILOT_MODE = {
  Standby: 'standby',
  'Auto mode': 'auto',
  'Nav mode': 'route',
  'Non Follow Up mode': undefined,
  'Wind mode': undefined,
  'Square (Turn)': undefined,
  'C-Turn': undefined,
  'U-Turn': undefined,
  'Spiral (Turn)': undefined,
  'Zig Zag (Turn)': undefined,
  'Lazy-S (Turn)': undefined,
  'Depth (Turn)': undefined,
  'Change Course': undefined,
}

module.exports = [
  {
    node: function () {
      return 'steering.autopilot.state'
    },
    filter: function (n2k, state) {
      return n2k.fields['Event']
    },
    value: function (n2k) {
      return EVENT_TO_AUTOPILOT_MODE[n2k.fields['Event']]
    },
  },
]
