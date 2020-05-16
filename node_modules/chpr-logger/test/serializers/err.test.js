'use strict';

const { expect } = require('chai');

const serializers = require('../../serializers');

describe('Serializers', () => {
  describe('err', () => {
    it('should format correctly a standard error', () => {
      const err = new Error('some test error');
      const res = serializers.err(err);
      expect(res).to.deep.equal({
        message: 'some test error',
        name: 'Error',
        code: undefined,
        signal: undefined,
        stack: res.stack,
      });
      expect(res.stack).to.match(/^Error: some test error/);
    });

    it('should forward the additional fields for a custom error', () => {
      const err = new Error('some test error');
      err.someField = 'ok';
      const res = serializers.err(err);
      expect(res).to.deep.equal({
        message: 'some test error',
        name: 'Error',
        code: undefined,
        signal: undefined,
        stack: res.stack,
        someField: 'ok',
      });
      expect(res.stack).to.match(/^Error: some test error/);
    });
  });
});
