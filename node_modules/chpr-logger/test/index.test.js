'use strict';

const expect = require('chai').expect;
const rewire = require('rewire');

let logger = require('../index');
const { init } = require('../index');
const SensitiveDataStream = require('../streams/sensitive-data');

const PrettyStream = require('bunyan-prettystream');
const SentryStream = require('bunyan-sentry-stream').SentryStream;

describe('index.js', () => {
  let oldStdoutWrite;

  describe('Log functions', () => {
    const logs = [];

    before(() => {
      oldStdoutWrite = process.stdout.write;

      process.stdout.write = function stubStdout(string) {
        try {
          string = JSON.parse(string);
          logs.push(string);
        } catch (e) {
          oldStdoutWrite.apply(process.stdout, [string]);
        }
      };

      const oldEnv = process.env;
      process.env = {
        LOGGER_NAME: 'Test logger name',
        LOGGER_LEVEL: 'debug',
        SENTRY_DSN: 'https://a:b@fake.com/12345',
      };
      logger = rewire('../index');
      process.env = oldEnv;
    });

    after(() => {
      process.stdout.write = oldStdoutWrite;
    });

    it('should output the fatal level message', () => {
      logger.fatal('hello');
      let message = logs.shift();
      expect(message.name).to.be.eql('Test logger name');
      expect(message.msg).to.be.eql('hello');
      expect(message.level).to.be.eql(60);

      // Should keep the object safe:
      logger.fatal(
        {
          a: 1,
        },
        'hello'
      );
      message = logs.shift();

      expect(message.a).to.be.eql(1);

      // Should use the Error object for the stack:
      logger.fatal(new Error('Fatal error'), 'hello');
      message = logs.shift();

      expect(message.err)
        .to.be.an('object')
        .with.property('stack');
      expect(message.err.stack.substr(0, 18)).to.be.eql('Error: Fatal error');
    });

    it('should output the error level message', () => {
      logger.error('hello');
      let message = logs.shift();
      expect(message.level).to.be.eql(50);

      // Should keep the object safe:
      logger.error(
        {
          a: 1,
        },
        'hello'
      );
      message = logs.shift();

      expect(message.a).to.be.eql(1);

      // Should use the Error object for the stack:
      logger.error(new Error('Fatal error'), 'hello');
      message = logs.shift();

      expect(message.err).to.be.an('object');
      expect(message.err.stack.substr(0, 18)).to.be.eql('Error: Fatal error');
    });

    it('should output the warn level message', () => {
      logger.warn('hello');
      const message = logs.shift();
      expect(message).to.have.property('level', 40);
      expect(message).to.not.have.property('stack');
    });

    it('should output the info level message', () => {
      logger.info('hello');
      const message = logs.shift();
      expect(message).to.have.property('level', 30);
    });

    it('should output the debug level message', () => {
      logger.debug('hello');
      const message = logs.shift();
      expect(message).to.have.property('level', 20);
    });

    it('should not output the trace level message (level set to debug)', () => {
      logger.trace('hello');
      expect(logs).to.have.lengthOf(0);
    });

    it('should format message correctly', () => {
      logger.info('hello %s', 20);
      const message = logs.shift();
      expect(message.msg).to.be.eql('hello 20');
    });

    it('should keep objects safe', () => {
      logger.info(
        {
          a: 1,
          b: {
            c: 1,
          },
        },
        'hello'
      );
      const message = logs.shift();
      expect(message.a).to.be.eql(1);
      expect(message.b).to.be.eql({
        c: 1,
      });
      expect(message.msg).to.be.eql('hello');
    });

    describe('sensitive data', () => {
      it('must replace sensitive data with __SENSITIVE_DATA__ in logs', () => {
        logger.info(
          {
            password: 'My personal password',
            headers: {
              'accept-language': 'fr-FR', // unchanged
              authorization: 'Bearer token',
            },
            req: {
              token: 'My personal token',
            },
          },
          'Logging amazingly sensitive data!'
        );
        const message = logs.shift();

        expect(message.password).to.equal('__SENSITIVE_DATA__');
        expect(message.headers['accept-language']).to.equal('fr-FR');
        expect(message.headers.authorization).to.equal('__SENSITIVE_DATA__');
        expect(message.req.token).to.equal('__SENSITIVE_DATA__');
      });
    });
  });

  describe('Streams configuration', () => {
    it('should use the sensitive data stream if no config is set', () => {
      const newLogger = init();

      expect(newLogger.streams).to.have.lengthOf(1);
      expect(newLogger.streams[0]).to.have.property('stream');

      expect(newLogger.streams[0].stream).to.be.instanceOf(SensitiveDataStream);
      expect(newLogger.streams[0].stream.fragments).to.equal(
        '(mdp|password|authorization|token|pwd|auth)'
      );
    });

    it('should use the sensitive data stream with specific pattern fragments if set', () => {
      const newLogger = init({
        logger: { sensitiveDataPattern: '(password)' },
      });

      expect(newLogger.streams).to.have.lengthOf(1);
      expect(newLogger.streams[0]).to.have.property('stream');

      expect(newLogger.streams[0].stream).to.be.instanceOf(SensitiveDataStream);
      expect(newLogger.streams[0].stream.fragments).to.equal('(password)');
    });

    it('should use only the default stdout stream if LOGGER_USE_SENSITIVE_DATA_STREAM is false', () => {
      const newLogger = init({
        logger: { hideSensitiveData: false },
      });

      expect(newLogger.streams).to.have.lengthOf(1);
      expect(newLogger.streams[0]).to.have.property('stream', process.stdout);
    });

    it('should use the pretty stream formatter with USE_BUNYAN_PRETTY_STREAM set to true', () => {
      const newLogger = init({
        logger: { pretty: true },
      });

      expect(newLogger.streams).to.have.lengthOf(1);
      expect(newLogger.streams[0]).to.have.property('type', 'raw');
      expect(newLogger.streams[0]).to.have.property('level', 30);
      expect(newLogger.streams[0].stream).to.be.instanceOf(PrettyStream);
    });

    it('should have sentry stream with SENTRY_DSN set', () => {
      const newLogger = init({
        sentry: {
          dsn: 'https://a:b@fake.com/12345',
          release: 'some_release',
          environment: 'some_env',
        },
      });

      expect(newLogger.streams).to.have.lengthOf(2);
      expect(newLogger.streams[1].stream).to.be.instanceOf(SentryStream);
      expect(newLogger.streams[1].stream).to.have.deep.property(
        'client.environment',
        'some_env'
      );
      expect(newLogger.streams[1].stream).to.have.deep.property(
        'client.release',
        'some_release'
      );
    });
  });
});
