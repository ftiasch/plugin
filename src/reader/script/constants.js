var when = require('when/node');
var dust = require('capnp-js-plugin-dust');

// Load precompiled templates.
require('./templates');
require('../../templates');

module.exports = function (context) {
    return when.lift(dust.render)('constants', context);
};
