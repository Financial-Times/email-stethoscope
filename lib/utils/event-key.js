const { eventKeyDelimiter } = require('../../config');

exports.eventKey = ({ prefix, event, identifier }) => {
	return [prefix, event, identifier].filter(identity).join(eventKeyDelimiter);
};

const identity = value => value;
