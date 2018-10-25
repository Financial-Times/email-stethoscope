require('./lib/utils/db').connect();

module.exports = ({
	loggers: {
		age: require('./lib/loggers/age')
	},
	metrics: {
		age: require('./lib/metrics/age')
	}
});
