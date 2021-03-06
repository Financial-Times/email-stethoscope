const Mongoose = require('mongoose').Mongoose;
const logger = require('./logger');
const { dbURI } = require('../../config');

const dbInstance = new Mongoose();

exports.isDbReady = () => dbInstance.connection.readyState;
exports.dbInstance = dbInstance;

exports.connect = async () => {
	if (exports.isDbReady()) { return; }

	await dbInstance.connect(dbURI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		autoReconnect: true,
		reconnectInterval: 1000,
		reconnectTries: 100
	});
};

exports.disconnect = () => dbInstance.connection.close(true);

dbInstance.connection.on('connected', () => logger.info(`Successfully connected to: ${dbURI}`));
dbInstance.connection.on('error', err => logger.error(`Connection error: ${err.message}`));
dbInstance.connection.on('disconnected', () => logger.info('DB disconnected. '));
dbInstance.connection.on('reconnectFailed', () => { logger.error(`Unable to reconnect to: ${dbURI}.  Giving up reconnection attempt. `); });
