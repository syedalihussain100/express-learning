'use strict';

const _ = require('lodash');
const bunyan = require('bunyan');
const raven = require('raven');
const sentryStream = require('bunyan-sentry-stream');
const PrettyStream = require('bunyan-prettystream');

const SensitiveDataStream = require('./streams/sensitive-data');
const serializers = require('./serializers');

const defaultConfig = {
  logger: {
    name: process.env.LOGGER_NAME || 'Development logger',
    level: process.env.LOGGER_LEVEL || 'info',
    pretty: process.env.USE_BUNYAN_PRETTY_STREAM === 'true',
    hideSensitiveData: process.env.LOGGER_USE_SENSITIVE_DATA_STREAM !== 'false',
    sensitiveDataPattern: process.env.LOGGER_SENSITIVE_DATA_PATTERN,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    release: undefined,
    environment: process.env.NODE_ENV || 'development',
  },
};

function init(config) {
  const finalConfig = _.defaultsDeep(config, defaultConfig);

  const loggerName = finalConfig.logger.name;
  const loggerLevel = finalConfig.logger.level;
  const loggerConfig = {
    name: loggerName,
    level: loggerLevel,
    streams: [],
    serializers: {
      err: serializers.err,
    },
  };

  if (finalConfig.logger.pretty) {
    const prettyStdOut = new PrettyStream();
    prettyStdOut.pipe(process.stdout);
    loggerConfig.streams.push({
      type: 'raw',
      level: loggerLevel,
      stream: prettyStdOut,
    });
  } else if (finalConfig.logger.hideSensitiveData) {
    loggerConfig.streams.push({
      level: loggerLevel,
      stream: new SensitiveDataStream(finalConfig.logger.sensitiveDataPattern),
    });
  } else {
    loggerConfig.streams.push({ level: loggerLevel, stream: process.stdout });
  }

  if (finalConfig.sentry && finalConfig.sentry.dsn) {
    const client = new raven.Client(finalConfig.sentry.dsn, {
      name: loggerName,
      release: finalConfig.sentry.release,
      environment: finalConfig.sentry.environment,
    });
    client.install();
    loggerConfig.streams.push(sentryStream(client));
  }

  return bunyan.createLogger(loggerConfig);
}

const logger = init(defaultConfig);

module.exports = logger;
module.exports.init = init;
