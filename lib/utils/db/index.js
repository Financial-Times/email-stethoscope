const mongoose = require('mongoose');
const logger = require('../logger');
const { dbURI } = require('../../../config');

exports.connect = async () => {
	if (mongoose.connection.readyState) { return; }

	await mongoose.connect(dbURI, {
		useNewUrlParser: true,
		useCreateIndex: true,
		autoReconnect: true
	});
};

exports.disconnect = () => mongoose.connection.close();

mongoose.connection.on('connected', () => logger.info(`Successfully connected to: ${dbURI}`));
mongoose.connection.on('error', err => logger.error(`Connection error: ${err.message}`));
mongoose.connection.on('disconnected', () => logger.info('DB disconnected. '));
