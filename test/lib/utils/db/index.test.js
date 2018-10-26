const { expect } = require('chai');
const mongoose = require('mongoose');
const sinon = require('sinon');
const logger = require('../../../../lib/utils/logger');
const db = require('../../../../lib/utils/db');
const config = require('../../../../config');

describe('DB', () => {
	afterEach(async () => {
		await mongoose.connection.close();
		sinon.restore();
	});

	after(async () => {
		await db.disconnect();
	});

	describe('.connect', () => {
		describe('without an existing connection', () => {
			it('creates a new connection with expected options', async () => {
				await db.disconnect();

				const connectSpy = sinon.spy(mongoose, 'connect');
				const expectedOpts = [
					config.dbURI,
					{
						useNewUrlParser: true,
						useCreateIndex: true,
						autoReconnect: true
					}
				];

				await db.connect();
				expect(connectSpy.calledWith(...expectedOpts)).to.be.true;
			});

			it('logs connection event', async () => {
				const loggerSpy = sinon.spy(logger, 'info');

				mongoose.connection.emit('connected');

				expect(loggerSpy.calledWith(`Successfully connected to: ${config.dbURI}`)).to.be.true;
			});
		});

		describe('with existing connection', () => {
			it('does not create a new connection', async () => {
				const connectSpy = sinon.spy(mongoose, 'connect');

				await db.connect();
				await db.connect();

				expect(connectSpy.calledOnce).to.be.true;
			});
		});
	});

	describe('.disconnect', () => {
		describe('with an existing connection', () => {
			it('disconnects', async () => {
				const connectionCloseSpy = sinon.spy(mongoose.Connection.prototype, 'close');

				await db.disconnect();

				expect(connectionCloseSpy.called).to.be.true;
			});
		});

		it('logs disconnection event', async () => {
			const loggerSpy = sinon.spy(logger, 'info');

			mongoose.connection.emit('disconnected');

			expect(loggerSpy.calledWith('DB disconnected. ')).to.be.true;
		});
	});

	describe('with connection error', () => {
		it('logs error', () => {
			const loggerSpy = sinon.spy(logger, 'error');
			const expectedError = new Error('No chicken found!');

			mongoose.connection.emit('error', expectedError);

			expect(loggerSpy.calledWith(`Connection error: ${expectedError.message}`)).to.be.true;
		});
	});
});
