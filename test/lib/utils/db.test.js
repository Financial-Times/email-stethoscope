const { expect } = require('chai');
const sinon = require('sinon');
const logger = require('../../../lib/utils/logger');
const db = require('../../../lib/utils/db');
const config = require('../../../config');

describe('DB', () => {
	afterEach(async () => {
		await db.disconnect();
		sinon.restore();
	});

	describe('.dbInstance', () => {
		it('is an instance of Mongoose', () => {
			expect(db.dbInstance.constructor.name).to.equal('Mongoose');
		});
	});

	describe('.isDbReady', () => {
		it('returns the state of the connection', () => {
			expect(db.isDbReady()).to.equal(db.dbInstance.connection.readyState);
		});
	});

	describe('.connect', () => {
		describe('without an existing connection', () => {
			it('creates a new connection with expected options', async () => {
				await db.disconnect();

				const connectSpy = sinon.spy(db.dbInstance, 'connect');
				const expectedOpts = [
					config.dbURI,
					{
						useNewUrlParser: true,
						useCreateIndex: true,
						autoReconnect: true,
						reconnectInterval: 1000,
						reconnectTries: 100
					}
				];

				await db.connect();
				expect(connectSpy.calledWith(...expectedOpts)).to.be.true;
			});

			it('logs connection event', async () => {
				const loggerSpy = sinon.spy(logger, 'info');

				db.dbInstance.connection.emit('connected');

				expect(loggerSpy.calledWith(`Successfully connected to: ${config.dbURI}`)).to.be.true;
			});
		});

		describe('with existing connection', () => {
			it('does not create a new connection', async () => {
				const connectSpy = sinon.spy(db.dbInstance, 'connect');

				await db.connect();
				await db.connect();

				expect(connectSpy.calledOnce).to.be.true;
			});
		});
	});

	describe('.disconnect', () => {
		describe('with an existing connection', () => {
			it('disconnects', async () => {
				const connectionCloseSpy = sinon.spy(db.dbInstance.connection, 'close');

				await db.disconnect();

				expect(connectionCloseSpy.called).to.be.true;
			});
		});

		it('logs disconnection event', async () => {
			const loggerSpy = sinon.spy(logger, 'info');

			db.dbInstance.connection.emit('disconnected');

			expect(loggerSpy.calledWith('DB disconnected. ')).to.be.true;
		});
	});

	describe('with connection error', () => {
		it('logs error', () => {
			const loggerSpy = sinon.spy(logger, 'error');
			const expectedError = new Error('No chicken found!');

			db.dbInstance.connection.emit('error', expectedError);

			expect(loggerSpy.calledWith(`Connection error: ${expectedError.message}`)).to.be.true;
		});
	});

	describe('with reconnection failure', () => {
		it('logs error', () => {
			const loggerSpy = sinon.spy(logger, 'error');

			db.dbInstance.connection.emit('reconnectFailed');

			expect(loggerSpy.calledWith(`Unable to reconnect to: ${config.dbURI}.  Giving up reconnection attempt. `)).to.be.true;
		});
	});
});
