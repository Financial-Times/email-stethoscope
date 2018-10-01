const { expect } = require('chai');

const { eventKey } = require('../../../lib/utils/event-key');

describe('Utils > Event Key', () => {
	describe('.eventKey', () => {
		beforeEach(() => {
			this.event = 'PROCESSING_LIST';
			this.identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
		});

		describe('with no identifier', () => {
			it('returns the event as the key', () => {
				this.identifier = undefined;
				const expectedKey = `${this.event}`;

				expect(eventKey(this.event, this.identifier)).to.equal(expectedKey);
			});
		});

		describe('with event and identifier', () => {
			it('returns the event and identifier as the key', () => {
				const expectedKey = `${this.event}:${this.identifier}`;

				expect(eventKey(this.event, this.identifier)).to.equal(expectedKey);
			});
		});
	});
});
