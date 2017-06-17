//Cross Track Error

const state = require('../state')

module.exports = [
  {
    node: function(n2k) {
      return "navigation.course" + state.lastCourseCalculationType + ".crossTrackError"
    },
    filter: function(n2k) {
      return (
        n2k.fields["Navigation Terminated"] &&
        n2k.fields["Navigation Terminated"] === "No" &&
          typeof n2k.fields["XTE"] !== "undefined" &&
          typeof state.lastCourseCalculationType !== 'undefined'
      );
    },
    source: "XTE"
  }
];
