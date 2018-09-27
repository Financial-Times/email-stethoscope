module.exports = ({
	loggers: {
		eventsAge: require('./lib/loggers/events-age')
	},
	metrics: {
		eventsAge: require('./lib/metrics/events-age')
	}
});