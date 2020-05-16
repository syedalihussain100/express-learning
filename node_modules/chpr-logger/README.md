# Logger for NodeJS

This utility library implements our standard Bunyan + Sentry configuration

<!-- TOC depthFrom:2 -->

- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Use](#use)
- [Sensitive Data](#sensitive-data)

<!-- /TOC -->

## Requirements

Minimum Node.js version: 4

## Installation

```bash
npm install --save chpr-logger
```

## Configuration

| Key                      | Required | Description                                                                                                                                                                       |
|--------------------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `LOGGER_NAME`              | yes      | Sets the name of the logger.                                                                                                                                                      |
| `LOGGER_LEVEL`             | yes      | Set the minimum level of logs.                                                                                                                                                    |
| `SENTRY_DSN`               | no       | Sets the Sentry stream. ([bunyan-sentry-stream](https://www.npmjs.com/package/bunyan-sentry-stream))                                                                              |
| `USE_BUNYAN_PRETTY_STREAM` | no       | Outputs the logs on stdout with the pretty formatting from Bunyan. Must be set to `true` to be active. ([bunyan-prettystream](https://www.npmjs.com/package/bunyan-prettystream)) |
| `LOGGER_USE_SENSITIVE_DATA_STREAM` | no       | Use the sensitive data stream to remove any possible sensitive data from the logs (enabled by default, `false` to use the `process.stdout` stream). |
| `LOGGER_SENSITIVE_DATA_PATTERN` | no       | Pattern fragments to match sensitive keys (default is `(mdp|password|authorization|token|pwd|auth)`). |

## Use

```javascript
'use strict';

const logger = require('chpr-logger');

/* The signature is logger[level](context, message) where:
- context is an object containing all info to be logged
- context may be passed an `err` property that is an error and will be used by
  sentry to regroup errors and capture proper stacktraces
- message is just a string explaining what the log is

As in bunyan, context is optional and logger[level](message) can also work.
*/

// Log a fatal error message:
logger.fatal({ err: new Error('Fatal'), field: 'additional info' }, 'fatal message');

// Log an error message:
logger.error({ err: new Error('Error'), anotherField: 'extra context' }, 'error message');

// Log a warning message:
logger.warn({ err: new Error('Warn'), userId:'1e7b8d', age: 17 }, 'User is under 18');

// Log an informational message:
logger.info({ field: 1 }, 'info message');

// Log a debug message:
logger.debug({ user }, 'debug message');

// Log a trace message:
logger.trace({ fields: [1, 2, 66]] }, 'trace message');

```

## Sensitive Data

`chpr-logger` can filter sensitive data based on specific keys and replace the
values by `__SENSITIVE_DATA__` string. This feature is enabled by default but
you can skip this (not recommanded) by setting the environment variable
`LOGGER_USE_SENSITIVE_DATA_STREAM` to `false`.

In addition, you can update the pattern on which to make the match with the
environment variable `LOGGER_SENSITIVE_DATA_PATTERN`. Its value must represent
a valid [capturing regular expression](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/RegExp#group_back).
