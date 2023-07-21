module.exports = [
  {
    node: 'steering.autopilot.state',
    value: function (n2k) {
      var mode = Number(n2k.fields['Pilot Mode'])
      var subMode = Number(n2k.fields['Sub Mode'])
      if (mode == 0 && subMode == 0) return 'standby'
      else if (mode == 0 && subMode == 1) return 'wind'
      else if ((mode == 128 || mode == 129) && subMode == 1) return 'route'
      else if (mode == 64 && subMode == 0) return 'auto'
      else return 'standby'
    }
  }
]
