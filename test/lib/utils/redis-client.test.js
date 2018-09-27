const { expect } = require('chai');

const redisClient = require('../../../lib/utils/redis-client');

describe('Utils > Redis Client', () => {
	describe('.instance', () => {
		afterEach(redisClient.disconnect);

		it('returns a redis connection', () => {
			expect(redisClient.instance().constructor.name).to.equal('Redis')
		});
	});
});
