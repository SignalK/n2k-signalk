var chai = require("chai");
var expect = chai.expect;
chai.Should();
chai.use(require('chai-things'));

var mapper = require("../n2kMapper.js");

/*


2011-04-25-10:16:42.555,3,129283,6,255,8,3b,30,00,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,30,ff,ff,ff,ff,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,30,01,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,30,fd,ff,ff,7f,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,30,00,00,00,80,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,31,00,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,31,ff,ff,ff,ff,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,31,01,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,31,fd,ff,ff,7f,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,31,00,00,00,80,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,32,00,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,32,ff,ff,ff,ff,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,32,01,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,32,fd,ff,ff,7f,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,32,00,00,00,80,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,33,00,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,33,ff,ff,ff,ff,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,33,01,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,33,fd,ff,ff,7f,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,33,00,00,00,80,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,34,00,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,34,ff,ff,ff,ff,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,34,01,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,34,fd,ff,ff,7f,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,34,00,00,00,80,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,44,00,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,44,ff,ff,ff,ff,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,44,01,00,00,00,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,44,fd,ff,ff,7f,ff,ff
2011-04-25-10:16:42.555,3,129283,6,255,8,3b,44,00,00,00,80,ff,ff

{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":0.00}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":-0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":21474836.45}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":-21474836.48}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Differential enhanced","Navigation Terminated":"No","XTE":0.00}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Differential enhanced","Navigation Terminated":"No","XTE":-0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Differential enhanced","Navigation Terminated":"No","XTE":0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Differential enhanced","Navigation Terminated":"No","XTE":21474836.45}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Differential enhanced","Navigation Terminated":"No","XTE":-21474836.48}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Estimated","Navigation Terminated":"No","XTE":0.00}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Estimated","Navigation Terminated":"No","XTE":-0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Estimated","Navigation Terminated":"No","XTE":0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Estimated","Navigation Terminated":"No","XTE":21474836.45}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Estimated","Navigation Terminated":"No","XTE":-21474836.48}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Simulator","Navigation Terminated":"No","XTE":0.00}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Simulator","Navigation Terminated":"No","XTE":-0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Simulator","Navigation Terminated":"No","XTE":0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Simulator","Navigation Terminated":"No","XTE":21474836.45}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Simulator","Navigation Terminated":"No","XTE":-21474836.48}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"No","XTE":0.00}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"No","XTE":-0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"No","XTE":0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"No","XTE":21474836.45}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"No","XTE":-21474836.48}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"Yes","XTE":0.00}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"Yes","XTE":-0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"Yes","XTE":0.01}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"Yes","XTE":21474836.45}}
{"timestamp":"2011-04-25-10:16:42.555","prio":3,"src":6,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":59,"XTE mode":"Manual","Navigation Terminated":"Yes","XTE":-21474836.48}}
*/

describe('129283 xte', function() {
  //real example from Jammy
  // it('No XTE, but Navigation is not terminated', function() {
  //   //2015-01-15-16:25:14.978,3,129283,4,255,8,fa,3f,ff,ff,ff,7f,ff,ff
  //   var msg = JSON.parse('{"timestamp":"2015-01-15-16:25:14.978","prio":3,"src":4,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":250,"Navigation Terminated":"No"}}');
  //   var delta = mapper.toDelta(msg);
  //   expect(delta).to.be.undefined;
  // });

  it('Positive XTE', function() {
    var msg = JSON.parse('{"timestamp":"2016-06-21T10:00:52.086Z","prio":3,"src":4,"dst":255,"pgn":129283,"description":"Cross Track Error","fields":{"SID":12,"XTE mode":"Autonomous","Navigation Terminated":"No","XTE":967.57}}');
    var tree = mapper.toNested(msg);
    tree.should.have.deep.property('navigation.courseGreatCircle.crossTrackError.value', 967.57);
  });

});
