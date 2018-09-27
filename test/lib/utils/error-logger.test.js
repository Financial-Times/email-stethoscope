const { expect } = require('chai');
const sinon = require('sinon');

const { eventKey } = require('../../../lib/utils/event-key');
const { logUnexpectedError } = require('../../../lib/utils/error-logger');

const logger = require('@financial-times/n-logger').default;

describe('Utils > Error Logger', () => {
	beforeEach(sinon.restore);

	describe('.logUnexpectedError', () => {
		it('logs the error', () => {
			const expectedKey = eventKey('PROCESSING_LIST', '7da32a14-a9f1-4582-81eb-e4216e0d9a51');
			const expectedError = new Error('Something went wrong');
			const expectedLoggedError = `Unexepected error occured: '${expectedError.message}' for key: ${expectedKey}`
			const loggerStub = sinon.stub(logger, 'error');

			logUnexpectedError(expectedError, expectedKey)

			expect(loggerStub.calledWith(expectedLoggedError)).to.be.true;
		});
	});
});
