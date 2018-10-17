const { expect } = require('chai');
const sinon = require('sinon');
const Redis = require('ioredis');
const logger = require('../../../lib/utils/logger');

const { startEvent, endEvent } = require('../../../lib/loggers/age');
const { eventAge, eventsAge, orderedEvents } = require('../../../lib/metrics/age');
const errorLogger = require('../../../lib/utils/error-logger');
const { eventKey } = require('../../../lib/utils/event-key');
const redisClient = require('../../../lib/utils/redis-client');

describe('Metrics > Events Age', () => {
	beforeEach(() => this.clock = sinon.useFakeTimers(Date.now()));

	afterEach(async () => {
		await redisClient.instance().flushall();
		this.clock.restore();
		sinon.restore();
		redisClient.disconnect();
	});

	describe('.eventAge', () => {
		describe('with existing event', () => {
			it('returns the event age', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedAge = 100;

				await startEvent({ event, identifier });
				this.clock.tick(expectedAge);
				await endEvent({ event, identifier });

				expect(await eventAge({ event, identifier })).to.equal(expectedAge);
			});
		});

		describe('without existing event', () => {
			it('returns undefined', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

				expect(await eventAge({ event, identifier })).to.be.undefined;
			});
		});

		describe('with unexpected error', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedEventKey = eventKey(event, identifier);
				const expectedError = new Error('Something went wrong');

				const errorLoggerStub = sinon.stub(errorLogger, 'logUnexpectedError');
				sinon.stub(Redis.prototype, 'hgetall').throws(expectedError);

				const age = await eventAge({ event, identifier });

				expect(errorLoggerStub.calledWith(expectedError, expectedEventKey)).to.be.true;
				expect(age).to.be.undefined;
			});
		});
	});

	describe('.eventsAge', () => {
		describe('with invalid operation', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const invalidOperation = 'somethingWrong';
				const expectedLogMessage = `Attempted to use invalid operation: ${invalidOperation}`;
				const loggerStub = sinon.stub(logger, 'error');

				const age = await eventsAge({ event, operation: invalidOperation });

				expect(loggerStub.calledWithMatch(expectedLogMessage)).to.be.true;
				expect(age).to.be.undefined;
			});
		});

		describe('with valid operation', () => {
			describe('with existing event', () => {
				describe('with "max" operation', () => {
					it('returns max age', async () => {
						const expectedMaxAge = 1000;
						const event = 'PROCESSING_LIST';

						const identifier1 = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
						await startEvent({ event, identifier: identifier1 });
						this.clock.tick(expectedMaxAge);
						await endEvent({ event, identifier: identifier1 });

						const identifier2 = '9da32a14-a9f1-4582-81eb-e4216e0d9a52';
						await startEvent({ event, identifier: identifier2 });
						this.clock.tick(expectedMaxAge / 2);
						await endEvent({ event, identifier: identifier2 });

						expect(await eventsAge({ event, operation: 'max' })).to.equal(expectedMaxAge);
					});
				});

				describe('with "min" operation', () => {
					it('returns min age', async () => {
						const expectedMinAge = 1000;
						const event = 'PROCESSING_LIST';

						const identifier1 = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
						await startEvent({ event, identifier: identifier1 });
						this.clock.tick(expectedMinAge);
						await endEvent({ event, identifier: identifier1 });

						const identifier2 = '9da32a14-a9f1-4582-81eb-e4216e0d9a52';
						await startEvent({ event, identifier: identifier2 });
						this.clock.tick(expectedMinAge * 2);
						await endEvent({ event, identifier: identifier2 });

						expect(await eventsAge({ event, operation: 'min' })).to.equal(expectedMinAge);
					});
				});

				describe('with "average" operation', () => {
					it('returns average age', async () => {
						const event = 'PROCESSING_LIST';

						const identifier1 = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
						const eventAge1 = 1000;
						await startEvent({ event, identifier: identifier1 });
						this.clock.tick(eventAge1);
						await endEvent({ event, identifier: identifier1 });

						const identifier2 = '9da32a14-a9f1-4582-81eb-e4216e0d9a52';
						const eventAge2 = 2000;
						await startEvent({ event, identifier: identifier2 });
						this.clock.tick(eventAge2);
						await endEvent({ event, identifier: identifier2 });

						expect(await eventsAge({ event, operation: 'average' })).to.equal((eventAge1 + eventAge2) / 2);
					});
				});
			});

			describe('without existing event', () => {
				it('returns undefined', async () => {
					const event = 'PROCESSING_LIST';

					expect(await eventsAge({ event, operation: 'max' })).to.be.undefined;
				});
			});
		});

		describe('with unexpected error', () => {
			it('logs the error', async () => {
				const event = 'PROCESSING_LIST';
				const expectedEventKey = eventKey(event);
				const expectedError = new Error('Something went wrong');

				const errorLoggerStub = sinon.stub(errorLogger, 'logUnexpectedError');
				sinon.stub(Redis.prototype, 'hgetall').throws(expectedError);

				await eventAge({ event });

				expect(errorLoggerStub.calledWith(expectedError, expectedEventKey)).to.be.true;
			});
		});
	});

	describe('.orderedEvents', () => {
		describe('without limit', () => {
			it('returns expected number of sorted events with age', async () => {
				const event = 'PROCESSING_LIST';
				const identifier1 = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const identifier2 = '9da32a14-a9f1-4582-81eb-e4216e0d9a52';
				const expectedAge = 120;

				await startEvent({ event, identifier: identifier1 });
				this.clock.tick(expectedAge);
				await endEvent({ event, identifier: identifier1 });

				await startEvent({ event, identifier: identifier2 });
				this.clock.tick(expectedAge / 2);
				await endEvent({ event, identifier: identifier2 });
				const events = await orderedEvents();

				expect(events.length).to.equal(2);
				expect(events[0].age).to.equal(expectedAge);
				expect(events[0].identifier).to.equal(identifier1);
				expect(events[1].identifier).to.equal(identifier2);
			});
		});

		describe('with limit', () => {
			it('returns default number of sorted events with age', async () => {
				const event = 'PROCESSING_LIST';
				const identifier1 = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const identifier2 = '9da32a14-a9f1-4582-81eb-e4216e0d9a52';
				const expectedAge = 120;
				const limit = 1;

				await startEvent({ event, identifier: identifier1 });
				this.clock.tick(expectedAge);
				await endEvent({ event, identifier: identifier1 });

				await startEvent({ event, identifier: identifier2 });
				this.clock.tick(expectedAge / 2);
				await endEvent({ event, identifier: identifier2 });
				const events = await orderedEvents({ limit });

				expect(events.length).to.equal(limit);
				expect(events[0].age).to.equal(expectedAge);
				expect(events[0].identifier).to.equal(identifier1);
			});
		});
	});

	describe('with no events', () => {
		it('returns undefined', async () => {
			const events = await orderedEvents();
			expect(events).to.be.undefined;
		});
	});
});
