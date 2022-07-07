// need to check what happens when True heading is configured in the AP
module.exports = [
    {
      node: 'navigation.headingtrue',
      filter: function(n2k) {
        return n2k.fields['Heading True']
      },
      source: 'Heading True'
    },
    {
      node: 'navigation.headingMagnetic',
      filter: function(n2k) {
        return n2k.fields['Heading Magnetic']
      },
      source: 'Heading Magnetic'
    }
  ]