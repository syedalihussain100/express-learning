// Type definitions for chpr-logger 3.0.0
// Project: chpr-logger
// Definitions by: Chauffeur Privé
// TypeScript Version: 3.0.1

/// <reference types="node" />

import BaseLogger = require('bunyan');

declare class Logger extends BaseLogger {
  init(config?: logger.Config): Logger;
}

declare const logger: Logger;
declare namespace logger {
  type Logger = typeof logger;

  export interface LoggerConfig {
    name?: string;
    level?: string;
    pretty?: boolean;
    hideSensitiveData?: boolean;
    sensitiveDataPattern?: string;
  }

  export interface SentryConfig {
    dsn?: string;
    release?: string;
    environment?: string;
  }

  export interface Config {
    logger?: LoggerConfig;
    sentry?: SentryConfig;
  }
}

export = logger;
