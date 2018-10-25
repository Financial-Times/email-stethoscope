const { expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../lib/utils/logger');
const { startEvent, endEvent } = require('../../../lib/loggers/age');
const db = require('../../../lib/utils/db');
const { AgeEvent } = require('../../../lib/db/models/age-event');

describe('Loggers > Events Age', () => {
	before(async () => {
		await db.connect();
	});

	beforeEach(() => this.clock = sinon.useFakeTimers(Date.now()));

	afterEach(async () => {
		await AgeEvent.deleteMany();
		this.clock.restore();
		sinon.restore();
	});

	after(async () => {
		await db.disconnect();
	});

	describe('.startEvent', () => {
		describe('with new event', () => {
			it('starts the new event with current date', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

				const findOneSpy = sinon.stub(AgeEvent, 'findOne');
				const createSpy = sinon.stub(AgeEvent, 'create');

				await startEvent({ event, identifier });

				expect(findOneSpy.calledWith({ event, identifier })).to.be.true;
				expect(createSpy.calledWith({ event, identifier, createdAt: Date.now() })).to.be.true;
			});
		});

		describe('with existing event', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

				await AgeEvent.create({ event, identifier, createdAt: Date.now() });
				const loggerStub = sinon.stub(logger, 'warn');

				await startEvent({ event, identifier });

				expect(loggerStub.calledWith(`Attempted to start an event that has already been started. ${{ event, identifier }}`)).to.be.true;
			});
		});

		describe('with unexpected error', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedError = new Error('Connection is closed');

				sinon.stub(AgeEvent, 'create').rejects(expectedError);
				const loggerStub = sinon.stub(logger, 'error');

				await startEvent({ event, identifier });

				expect(loggerStub.calledWith(`Unexpected error occurred: '${expectedError.message}'`)).to.be.true;
			});
		});
	});

	describe('.endEvent', () => {
		describe('with a started event', () => {
			it('ends the event with the current date', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

				await startEvent({ event, identifier });
				await endEvent({ event, identifier });

				expect((await AgeEvent.findOne({ event, identifier })).endedAt).to.equal(Date.now());
			});
		});

		describe('with event previously ended', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

				await startEvent({ event, identifier });
				await endEvent({ event, identifier });

				const loggerStub = sinon.stub(logger, 'warn');

				await endEvent({ event, identifier });

				expect(loggerStub.calledWith(`Attempted to end an event that has already ended. ${{ event, identifier }}`)).to.be.true;
			});
		});

		describe('with unexpected error', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedError = new Error('Connection is closed');

				await startEvent({ event, identifier });

				sinon.stub(AgeEvent.prototype, 'save').rejects(expectedError);
				const loggerStub = sinon.stub(logger, 'error');

				await endEvent({ event, identifier });

				expect(loggerStub.calledWith(`Unexpected error occurred: '${expectedError.message}'`)).to.be.true;
			});
		});
	});
});
