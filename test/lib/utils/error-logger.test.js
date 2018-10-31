const { expect } = require('chai');
const sinon = require('sinon');

const logger = require('../../../lib/utils/logger');
const errorLogger = require('../../../lib/utils/error-logger');

describe('Utils > Error Logger', () => {
	afterEach(sinon.restore);

	describe('.logUnexpectedError', () => {
		it('logs an error', () => {
			const err = new Error('Something went wrong');
			const loggerSpy = sinon.spy(logger, 'error');

			errorLogger.logUnexpectedError(err);

			expect(loggerSpy.calledWith(`Unexpected error occurred: '${err.message}'`)).to.be.true;
		});
	});

	describe('.logDbNotReadyError', () => {
		it('logs an error', () => {
			const loggerSpy = sinon.spy(logger, 'warn');

			errorLogger.logDbNotReadyError();

			expect(loggerSpy.calledWith('Stethoscope DB not ready.  Please check connection')).to.be.true;
		});
	});
});
