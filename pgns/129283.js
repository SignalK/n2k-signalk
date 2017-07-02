//Cross Track Error

module.exports = [
  {
    node: function(n2k, context) {
      return "navigation.course" + context.lastCourseCalculationType + ".crossTrackError"
    },
    filter: function(n2k, context) {
      return (
        n2k.fields["Navigation Terminated"] &&
        n2k.fields["Navigation Terminated"] === "No" &&
          typeof n2k.fields["XTE"] !== "undefined" &&
          typeof context.lastCourseCalculationType !== 'undefined'
      );
    },
    source: "XTE"
  }
];
