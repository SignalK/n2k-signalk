module.exports = [
  {
    source: 'Temperature',
    node: 'propulsion.port.temperature',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    }
  },
  {
    source: 'Temperature',
    node: 'propulsion.starboard.temperature',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    }
  },
  {
    source: 'Alternator Potential',
    node: 'propulsion.port.alternatorVoltage',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    }
  },
  {
    source: 'Alternator Potential',
    node: 'propulsion.starboard.alternatorVoltage',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    }
  },
  {
    node: 'propulsion.port.fuel.rate',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var lph = Number(n2k.fields['Fuel Rate'])
      return lph / 3600000
    }
  },
  {
    node: 'propulsion.starboard.fuel.rate',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var lph = Number(n2k.fields['Fuel Rate'])
      return lph / 3600000
    }
  },
  {
    node: 'propulsion.port.oilPressure',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields['Oil pressure'])
      return kpa * 1000.0
    }
  },
  {
    node: 'propulsion.starboard.oilPressure',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var kpa = Number(n2k.fields['Oil pressure'])
      return kpa * 1000.0
    }
  },
  {
    source: 'Total Engine hours',
    node: 'propulsion.port.runTime',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    }
  },
  {
    source: 'Total Engine hours',
    node: 'propulsion.starboard.runTime',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    }
  },
  {
    node: 'propulsion.port.engineLoad',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var percent = Number(n2k.fields['Percent Engine Load'])
      return percent / 100.0
    }
  },
  {
    node: 'propulsion.port.engineTorque',
    filter: function (n2k) {
      return (
        n2k.fields['Engine Instance'] === 'Single Engine or Dual Engine Port'
      )
    },
    value: function (n2k) {
      var percent = Number(n2k.fields['Percent Engine Torque'])
      return percent / 100.0
    }
  },
  {
    node: 'propulsion.starboard.engineLoad',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var percent = Number(n2k.fields['Percent Engine Load'])
      return percent / 100.0
    }
  },
  {
    node: 'propulsion.starboard.engineTorque',
    filter: function (n2k) {
      return n2k.fields['Engine Instance'] === 'Dual Engine Starboard'
    },
    value: function (n2k) {
      var percent = Number(n2k.fields['Percent Engine Torque'])
      return percent / 100.0
    }
  }
]
