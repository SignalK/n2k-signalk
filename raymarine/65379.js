module.exports = [
  {
    node: 'steering.autopilot.state',
    value: function (n2k) {
      var mode = n2k.fields['Pilot Mode']
      if ( typeof mode === 'string' ) {
        if ( mode === "Standby" )
        {
          return 'standby'
        } else if ( mode === "Auto, compass commanded" ) {
          return 'auto'
        } else if ( mode === "Vane, Wind Mode" ) {
          return 'wind'
        } else if ( mode === "Track Mode" ) {
          return 'route'
        } else if ( mode ===  "No Drift, COG referenced (In track, course changes)" ) {
          return 'route'
        }
      } else {
        mode = Number(n2k.fields['Pilot Mode'])
        var subMode = Number(n2k.fields['Sub Mode'])
        if (mode == 0 && subMode == 0) return 'standby'
        else if (mode == 0 && subMode == 1) return 'wind'
        else if ((mode == 128 || mode == 129) && subMode == 1) return 'route'
        else if (mode == 64 && subMode == 0) return 'auto'
        else return 'standby'
      }
    }
  }
]
