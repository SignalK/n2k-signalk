
module.exports = function(n2k) {
  var fromStarboard = n2k.fields['Position reference from Starboard']
  var width = n2k.fields['Beam']
  if ( fromStarboard > (width/2) )
  {
    return (fromStarboard - (width/2)) * -1;
  }
  else
  {
    return (width/2) - fromStarboard;
  }
}
