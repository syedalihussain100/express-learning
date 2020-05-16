'use strict';

const _ = require('lodash');
const bunyan = require('bunyan');

/**
 * Serialize an Error object.
 *
 * Overrides the default bunyan error serializer, only adds in the result the
 * error enumerable properties.
 *
 * @param {Error} error The error
 * @returns {Object} The formatted error.
 */
function err(error) {
  return _.assign(bunyan.stdSerializers.err(error), error);
}

module.exports = {
  err,
};
