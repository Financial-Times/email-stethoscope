const { expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../lib/utils/logger');
const { startEvent, endEvent } = require('../../../lib/loggers/age');
const { eventAge, eventsAge, orderedEvents } = require('../../../lib/metrics/age');
const db = require('../../../lib/utils/db');
const { AgeEvent } = require('../../../lib/db/models/age-event');
const ageEventFixture = require('../db/fixtures/models/age-event');
const errorLogger = require('../../../lib/utils/error-logger');

describe('Metrics > Events Age', () => {
	beforeEach(() => this.clock = sinon.useFakeTimers(Date.now()));
	afterEach(() => sinon.restore());

	describe('.eventAge', () => {
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

			describe('with existing event', () => {
				it('returns the event age', async () => {
					const { event, identifier } = ageEventFixture;
					const expectedAge = 100;

					await startEvent({ event, identifier });
					this.clock.tick(expectedAge);
					await endEvent({ event, identifier });

					expect(await eventAge({ event, identifier })).to.equal(expectedAge);
				});
			});

			describe('without existing event', () => {
				it('returns undefined', async () => {
					const { event, identifier } = ageEventFixture;

					expect(await eventAge({ event, identifier })).to.be.undefined;
				});
			});

			describe('with unexpected error', () => {
				it('logs an error', async () => {
					const { event, identifier } = ageEventFixture;

					const expectedError = new Error('Something went wrong');

					const errorLoggerSpy = sinon.spy(errorLogger, 'logUnexpectedError');
					sinon.stub(AgeEvent, 'findOne').rejects(expectedError);

					const age = await eventAge({ event, identifier });

					expect(errorLoggerSpy.calledOnce).to.be.true;
					expect(age).to.be.undefined;
				});
			});
		});
	});

	describe('.eventsAge', () => {
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

			describe('with invalid operation', () => {
				it('logs an error', async () => {
					const { event } = ageEventFixture;

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
							const { event } = ageEventFixture;

							const identifier1 = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
							const identifier2 = '9da32a14-a9f1-4582-81eb-e4216e0d9a52';

							await startEvent({ event, identifier: identifier1 });
							this.clock.tick(expectedMaxAge);
							await endEvent({ event, identifier: identifier1 });

							await startEvent({ event, identifier: identifier2 });
							this.clock.tick(expectedMaxAge / 2);
							await endEvent({ event, identifier: identifier2 });

							expect(await eventsAge({ event, operation: 'max' })).to.equal(expectedMaxAge);
						});
					});

					describe('with "min" operation', () => {
						it('returns min age', async () => {
							const expectedMinAge = 1000;
							const { event } = ageEventFixture;

							const identifier1 = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
							const identifier2 = '9da32a14-a9f1-4582-81eb-e4216e0d9a52';

							await startEvent({ event, identifier: identifier1 });
							this.clock.tick(expectedMinAge);
							await endEvent({ event, identifier: identifier1 });

							await startEvent({ event, identifier: identifier2 });
							this.clock.tick(expectedMinAge * 2);
							await endEvent({ event, identifier: identifier2 });

							expect(await eventsAge({ event, operation: 'min' })).to.equal(expectedMinAge);
						});
					});

					describe('with "average" operation', () => {
						it('returns average age', async () => {
							const { event } = ageEventFixture;

							const identifier1 = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
							const identifier2 = '9da32a14-a9f1-4582-81eb-e4216e0d9a52';
							const eventAge1 = 1000;
							const eventAge2 = 2000;
							const expectedAverage = (eventAge1 + eventAge2) / 2;

							await startEvent({ event, identifier: identifier1 });
							this.clock.tick(eventAge1);
							await endEvent({ event, identifier: identifier1 });

							await startEvent({ event, identifier: identifier2 });
							this.clock.tick(eventAge2);
							await endEvent({ event, identifier: identifier2 });

							expect(await eventsAge({ event, operation: 'average' })).to.equal(expectedAverage);
						});
					});
				});

				describe('without existing event', () => {
					it('returns undefined', async () => {
						const { event } = ageEventFixture;

						expect(await eventsAge({ event, operation: 'max' })).to.be.undefined;
					});
				});
			});

			describe('with unexpected error', () => {
				it('logs the error', async () => {
					const { event } = ageEventFixture;

					const expectedError = new Error('Something went wrong');

					sinon.stub(AgeEvent, 'find').rejects(expectedError);
					const errorLoggerSpy = sinon.spy(errorLogger, 'logUnexpectedError');

					await eventsAge({ event, operation: 'max' });

					expect(errorLoggerSpy.calledOnce).to.be.true;
				});
			});
		});
	});

	describe('.orderedEvents', () => {
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

			describe('without limit', () => {
				it('returns all of events, sorted, with age', async () => {
					const { event } = ageEventFixture;

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
				it('returns the limited number of event, sorted, with age', async () => {
					const { event } = ageEventFixture;

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

			describe('with no events', () => {
				it('returns undefined', async () => {
					const events = await orderedEvents();
					expect(events).to.be.undefined;
				});
			});

			describe('with unexpected error', () => {
				it('logs the error', async () => {
					const { event } = ageEventFixture;

					const expectedError = new Error('Something went wrong');

					sinon.stub(AgeEvent, 'find').rejects(expectedError);
					const errorLoggerSpy = sinon.spy(errorLogger, 'logUnexpectedError');

					await orderedEvents({ event, operation: 'max' });

					expect(errorLoggerSpy.calledOnce).to.be.true;
				});
			});
		});
	});
});
