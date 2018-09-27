const { expect } = require('chai');
const Stethoscope = require('../');

describe('Index', () => {
	it('wires up the package', () => {
		const expectedClient = {
			loggers: {
				eventsAge: require('../lib/loggers/events-age')
			},
			metrics: {
				eventsAge: require('../lib/metrics/events-age')
			}
		};

		expect(Stethoscope).to.deep.equal(expectedClient);
	});
});
