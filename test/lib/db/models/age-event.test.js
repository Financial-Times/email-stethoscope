const chai = require('chai');
chai.use(require('chai-as-promised'));

const expect = chai.expect;

const sinon = require('sinon');

const { AgeEvent } = require('../../../../lib/db/models/age-event');
const db = require('../../../../lib/utils/db');
const ageEventFixture = require('../fixtures/models/age-event');
const { eventTTL } = require('../../../../config');

describe('Models > AgeEvent', () => {
	before(async () => {
		sinon.useFakeTimers(Date.now());
		await db.connect();
	});

	afterEach(async () => {
		await AgeEvent.deleteMany();
	});

	after(async () => {
		await db.disconnect();
	});

	describe('attributes', () => {
		describe('with valid values', () => {
			it('is valid', () => {
				return expect(AgeEvent.create({ ...ageEventFixture })).to.eventually.be.fulfilled;
			});
		});

		describe('with invalid values', () => {
			describe('.event', () => {
				it('is invalid since missing', async () => {
					return expect(AgeEvent.create({ ...ageEventFixture, event: null })).to.eventually.be.rejected;
				});
			});

			describe('.identifier', () => {
				it('is invalid since missing', async () => {
					return expect(AgeEvent.create({ ...ageEventFixture, identifier: null })).to.eventually.be.rejected;
				});
			});

			describe('.createdAt', () => {
				it('is invalid since missing', async () => {
					return expect(AgeEvent.create({ ...ageEventFixture, createdAt: null })).to.eventually.be.rejected;
				});

				it('is invalid since not a number', async () => {
					return expect(AgeEvent.create({ ...ageEventFixture, createdAt: '1' })).to.eventually.be.rejected;
				});

				it('is invalid since not in an epoch format', async () => {
					return expect(AgeEvent.create({ ...ageEventFixture, createdAt: 1 })).to.eventually.be.rejectedWith('"createdAt" must be an epoch');
				});
			});

			describe('.endedAt', () => {
				it('is invalid since missing', async () => {
					return expect(AgeEvent.create({ ...ageEventFixture, endedAt: null })).to.eventually.be.rejected;
				});

				it('is invalid since not a number', async () => {
					return expect(AgeEvent.create({ ...ageEventFixture, endedAt: '1' })).to.eventually.be.rejected;
				});

				it('is invalid since not in an epoch format', async () => {
					return expect(AgeEvent.create({ ...ageEventFixture, endedAt: 1 })).to.eventually.be.rejectedWith('"endedAt" must be an epoch');
				});
			});
		});

		describe('.age', () => {
			describe('with event marked as ended', () => {
				it('calculates the event age based on "createdAt" and "endedAt"', async () => {
					const { createdAt, endedAt } = ageEventFixture;
					const expectedAge = endedAt - createdAt;

					const event = await AgeEvent.create({ ...ageEventFixture });
					expect(event.age).to.equal(expectedAge);
				});
			});

			describe('with event not marked as ended', () => {
				it('calculates the event age based on "createdAt" and "endedAt"', async () => {
					const { createdAt } = ageEventFixture;
					const expectedAge = Date.now() - createdAt;

					const ageEventAttributes = ageEventFixture;
					delete ageEventAttributes.endedAt;

					const event = await AgeEvent.create({ ...ageEventAttributes });
					expect(event.age).to.equal(expectedAge);
				});
			});
		});
	});

	describe('indexes', () => {
		it('has a unique composite index of "event" and "indentifier"', () => {
			const expectedIndex = [{ event: 1, identifier: 1 }, { unique: true, background: true }];

			expect(AgeEvent.schema._indexes[0]).to.deep.equal(expectedIndex);
		});

		it(`expires events after "${eventTTL}" seconds`, () => {
			const expectedIndex = [{ createdAt: 1 }, { expireAfterSeconds: eventTTL, background: true }];

			expect(AgeEvent.schema._indexes[1]).to.deep.equal(expectedIndex);
		});
	});
});
