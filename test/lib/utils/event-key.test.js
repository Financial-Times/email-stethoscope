const { expect } = require('chai');

const { eventKey } = require('../../../lib/utils/event-key');
const { ageEventKeyPrefix: prefix, eventKeyDelimiter } = require('../../../config');

describe('Utils > Event Key', () => {
	describe('.eventKey', () => {
		describe('with event', () => {
			it('returns the event as the key', () => {
				const event = 'PROCESSING_LIST';
				const identifier = undefined;

				const expectedKey = `${event}`;

				expect(eventKey({ event, identifier })).to.equal(expectedKey);
			});
		});

		describe('with event and identifier', () => {
			it('returns the event and identifier as the key', () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

				const expectedKey = `${event}${eventKeyDelimiter}${identifier}`;

				expect(eventKey({ event, identifier })).to.equal(expectedKey);
			});
		});

		describe('with prefix, event and identifier', () => {
			it('returns the prefix, event and identifier as the key', () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';

				const expectedKey = `${prefix}${eventKeyDelimiter}${event}${eventKeyDelimiter}${identifier}`;

				expect(eventKey({ prefix, event, identifier })).to.equal(expectedKey);
			});
		});
	});
});
