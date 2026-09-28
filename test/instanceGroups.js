const chai = require('chai')
chai.Should()
const expect = chai.expect

const { instancePrefix } = require('../dist/instanceGroups')

describe('instance groups', function () {
  it('instancePrefix names a PGN outside the table', function () {
    expect(() => instancePrefix({ pgn: 129025, src: 1, fields: {} })).to.throw(
      'PGN 129025 has no instance group'
    )
  })
})
