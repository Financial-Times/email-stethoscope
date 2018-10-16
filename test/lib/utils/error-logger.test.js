const { expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../lib/utils/logger');

const { eventKey } = require('../../../lib/utils/event-key');
const { logUnexpectedError } = require('../../../lib/utils/error-logger');

describe('Utils > Error Logger', () => {
	beforeEach(sinon.restore);

	describe('.logUnexpectedError', () => {
		it('logs the error', () => {
			const event = 'PROCESSING_LIST';
			const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
			const expectedKey = eventKey({ event, identifier });
			const expectedError = new Error('Something went wrong');
			const expectedLoggedError = `Unexpected error occured: '${expectedError.message}' for key: ${expectedKey}`;
			const loggerStub = sinon.stub(logger, 'error');

			logUnexpectedError(expectedError, expectedKey);

			expect(loggerStub.calledWith(expectedLoggedError)).to.be.true;
		});
	});
});
