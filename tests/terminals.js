// tests/config.js
var chai = require('chai');
var expect = chai.expect; // we are using the "expect" style of Chai



describe('terminals', function () {
  it('terminals route', function () {
    global["socket"] = require("@nodulus/socket");
    global["socket"].on = function () { };

    var terminals = require('../routes/terminals.js');
    expect(terminals).to.not.equal(undefined);
  });
});