const { expect } = require('chai');

const { startEvent, endEvent } = require('../../../lib/loggers/age');
const redisClient = require('../../../lib/utils/redis-client');
const { getAllEvents } = require('../../../lib/utils/events');

describe('Utils > Events', () => {
	afterEach(async () => {
		await redisClient.instance().flushall();
		redisClient.disconnect();
	});

	describe('.getAllEvents', () => {
		describe('with existing event', () => {
			describe('with no key pattern', () => {
				it('returns empty array', async () => {
					const event = 'PROCESSING_LIST';
					const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

					await startEvent({ event, identifier });
					await endEvent({ event, identifier });

					expect(await getAllEvents()).to.be.empty;
				});
			});

			describe('with key pattern', () => {
				it('returns matched events', async () => {
					const event = 'PROCESSING_LIST';
					const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

					await startEvent({ event, identifier });
					await endEvent({ event, identifier });

					expect(await getAllEvents(`*${event}*`)).to.have.lengthOf(1);
				});
			});
		});

		describe('without existing event', () => {
			it('returns empty array', async () => {
				expect(await getAllEvents('*')).to.be.empty;
			});
		});
	});
});
