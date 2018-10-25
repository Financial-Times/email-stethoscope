const { expect } = require('chai');
const { isEpochy } = require('../../../lib/db/base-event-schema');

describe('DB > Base Event Schema', () => {
	describe('.isEpochy', () => {
		describe('with value as an epoch', () => {
			it('is true', () => {
				expect(isEpochy(Date.now())).to.be.true;
			});
		});

		describe('with value not as an epoch', () => {
			it('is false', () => {
				expect(isEpochy(1)).to.be.false;
			});
		});
	});
});
