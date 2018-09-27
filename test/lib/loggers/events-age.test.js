const { expect } = require('chai');
const sinon = require('sinon');
const Redis = require('ioredis');

const redisClient = require('../../../lib/utils/redis-client');
const { startEvent, endEvent } = require('../../../lib/loggers/events-age');
const { eventKey } = require('../../../lib/utils/event-key');
const errorLogger = require('../../../lib/utils/error-logger');
const logger = require('@financial-times/n-logger').default;

describe('Loggers > Events Age', () => {
	beforeEach(() => this.clock = sinon.useFakeTimers(Date.now()));

	afterEach(async () => {
		await redisClient.instance().flushall();
		this.clock.restore();
		sinon.restore();
		redisClient.disconnect();
	});

	describe('.startEvent', () => {
		describe('with new event', () => {
			it('starts the new event with current date', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expire = 1000;
				const expectedKey = eventKey(event, identifier);

				const redisExistsSpy = sinon.spy(Redis.prototype, 'exists');
				const redisHmsetSpy = sinon.spy(Redis.prototype, 'hmset');
				const redisExpireSpy = sinon.spy(Redis.prototype, 'expire');

				await startEvent({event, identifier, expire});

				expect(redisExistsSpy.calledWith(expectedKey)).to.be.true;
				expect(redisHmsetSpy.calledWith(expectedKey, { startDate: Date.now() })).to.be.true;
				expect(redisExpireSpy.calledWith(expectedKey, expire)).to.be.true;
			});

			it('defaults expiration to "86400" if not specified', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedKey = eventKey(event, identifier);

				const redisExpireSpy = sinon.spy(Redis.prototype, 'expire');

				await startEvent({event, identifier});

				expect(redisExpireSpy.calledWith(expectedKey, 86400)).to.be.true;
			});
		});

		describe('with existing event', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedKey = eventKey(event, identifier);

				sinon.stub(Redis.prototype, 'exists').returns(1);
				const loggerSpy = sinon.stub(logger, 'warn');

				await startEvent({event, identifier});

				expect(loggerSpy.calledWith(`Attempted to start an event that has already been started.  key: ${expectedKey}`)).to.be.true;
			});
		});

		describe('with unexpected error', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedKey = eventKey(event, identifier);
				const expectedError = new Error('Connection is closed');

				sinon.stub(Redis.prototype, 'exists').throws(expectedError);
				const errorLoggerStub = sinon.stub(errorLogger, 'logUnexpectedError');

				await startEvent({event, identifier});

				expect(errorLoggerStub.calledWith(expectedError, expectedKey)).to.be.true;
			});
		});
	});

	describe('.endEvent', () => {
		describe('with a started event', () => {
			it('ends the event with the current date', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedKey = eventKey(event, identifier);

				const redisHgetallSpy = sinon.spy(Redis.prototype, 'hgetall');
				const redisHmsetSpy = sinon.spy(Redis.prototype, 'hmset');

				await startEvent({event, identifier});
				await endEvent({event, identifier});

				expect(redisHgetallSpy.calledWith(expectedKey)).to.be.true;
				expect(redisHmsetSpy.calledWith(expectedKey, { endDate: Date.now() })).to.be.true;
			});
		});

		describe('with event not previously started',  () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedKey = eventKey(event, identifier);

				sinon.stub(Redis.prototype, 'hgetall').returns({});
				const loggerStub = sinon.stub(logger, 'warn');

				await endEvent({event, identifier});

				expect(loggerStub.calledWith(`Attempted to end an event that has not started.  key: '${expectedKey}'`)).to.be.true;
			});
		});

		describe('with event previously ended', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedKey = eventKey(event, identifier);

				sinon.stub(Redis.prototype, 'hgetall').returns({ startDate: Date.now(), endDate: Date.now() });
				const loggerStub = sinon.stub(logger, 'warn');

				await endEvent({event, identifier});

				expect(loggerStub.calledWith(`Attempted to end an event that has already ended.  key: '${expectedKey}'`)).to.be.true;
			});
		});

		describe('with unexpected error', () => {
			it('logs an error', async () => {
				const event = 'PROCESSING_LIST';
				const identifier = '7da32a14-a9f1-4582-81eb-e4216e0d9a51';
				const expectedKey = eventKey(event, identifier);
				const expectedError = new Error('Connection is closed');

				sinon.stub(Redis.prototype, 'hgetall').throws(expectedError);
				const errorLoggerStub = sinon.stub(errorLogger, 'logUnexpectedError');

				await endEvent({event, identifier});

				expect(errorLoggerStub.calledWith(expectedError, expectedKey)).to.be.true;
			});
		});
	});
});
