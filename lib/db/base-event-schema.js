exports.isEpochy = value => RegExp(/^(\d){13}$/).test(value);

exports.baseEventSchema = {
	event: {
		type: String,
		required: true
	},
	identifier: {
		type: String,
		required: true
	},
	createdAt: {
		type: Number,
		required: true,
		validate: {
			validator: exports.isEpochy,
			message: '"createdAt" must be an epoch'
		}
	}
};
