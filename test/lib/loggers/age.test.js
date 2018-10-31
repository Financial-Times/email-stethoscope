const { expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../lib/utils/logger');
const { startEvent, endEvent } = require('../../../lib/loggers/age');
const db = require('../../../lib/utils/db');
const { AgeEvent } = require('../../../lib/db/models/age-event');
const ageEventFixture = require('../db/fixtures/models/age-event');
const errorLogger = require('../../../lib/utils/error-logger');

describe('Loggers > Events Age', () => {
	beforeEach(() => this.clock = sinon.useFakeTimers(Date.now()));
	afterEach(() => sinon.restore());

	describe('.startEvent', () => {
		describe('with db connection not ready', () => {
			before(async () => { await db.disconnect(); });

			it('logs a "db not ready" warning', async () => {
				const errorLoggerSpy = sinon.spy(errorLogger, 'logDbNotReadyError');

				const { event, identifier } = ageEventFixture;
				await startEvent({ event, identifier });

				expect(errorLoggerSpy.calledOnce).to.be.true;
			});
		});

		describe('with db connection ready', () => {
			beforeEach(async () => { await db.connect(); });

			afterEach(async () => {
				await AgeEvent.deleteMany();
				await db.disconnect();
			});

			describe('with new event', () => {
				it('starts the new event with current date', async () => {
					const { event, identifier } = ageEventFixture;

					const findOneSpy = sinon.stub(AgeEvent, 'findOne');
					const createSpy = sinon.stub(AgeEvent, 'create');

					await startEvent({ event, identifier });

					expect(findOneSpy.calledWith({ event, identifier })).to.be.true;
					expect(createSpy.calledWith({ event, identifier, createdAt: Date.now() })).to.be.true;
				});
			});

			describe('with existing event', () => {
				it('logs an error', async () => {
					const { event, identifier } = ageEventFixture;

					await AgeEvent.create({ event, identifier, createdAt: Date.now() });
					const loggerStub = sinon.stub(logger, 'warn');

					await startEvent({ event, identifier });

					expect(loggerStub.calledWith(`Attempted to start an event that has already been started. ${{ event, identifier }}`)).to.be.true;
				});
			});

			describe('with unexpected error', () => {
				it('logs an error', async () => {
					const { event, identifier } = ageEventFixture;

					const expectedError = new Error('Connection is closed');

					sinon.stub(AgeEvent, 'create').rejects(expectedError);
					const errorLoggerSpy = sinon.spy(errorLogger, 'logUnexpectedError');

					await startEvent({ event, identifier });

					expect(errorLoggerSpy.calledOnce).to.be.true;
				});
			});
		});
	});

	describe('.endEvent', () => {
		describe('with db connection not ready', () => {
			before(async () => { await db.disconnect(); });

			it('logs a "db not ready" warning', async () => {
				const errorLoggerSpy = sinon.spy(errorLogger, 'logDbNotReadyError');

				const { event, identifier } = ageEventFixture;
				await startEvent({ event, identifier });

				expect(errorLoggerSpy.calledOnce).to.be.true;
			});
		});

		describe('with db connection ready', () => {
			beforeEach(async () => { await db.connect(); });

			afterEach(async () => {
				await AgeEvent.deleteMany();
				await db.disconnect();
			});

			describe('with a started event', () => {
				it('ends the event with the current date', async () => {
					const { event, identifier } = ageEventFixture;

					await startEvent({ event, identifier });
					await endEvent({ event, identifier });

					expect((await AgeEvent.findOne({ event, identifier })).endedAt).to.equal(Date.now());
				});
			});

			describe('with event previously ended', () => {
				it('logs an error', async () => {
					const { event, identifier } = ageEventFixture;

					await startEvent({ event, identifier });
					await endEvent({ event, identifier });

					const loggerStub = sinon.stub(logger, 'warn');

					await endEvent({ event, identifier });

					expect(loggerStub.calledWith(`Attempted to end an event that has already ended. ${{ event, identifier }}`)).to.be.true;
				});
			});

			describe('with unexpected error', () => {
				it('logs an error', async () => {
					const { event, identifier } = ageEventFixture;

					const expectedError = new Error('Connection is closed');

					await startEvent({ event, identifier });

					sinon.stub(AgeEvent.prototype, 'save').rejects(expectedError);
					const errorLoggerSpy = sinon.spy(errorLogger, 'logUnexpectedError');

					await endEvent({ event, identifier });

					expect(errorLoggerSpy.calledOnce).to.be.true;
				});
			});
		});
	});
});
