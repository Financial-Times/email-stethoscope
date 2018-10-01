const { expect } = require('chai');
const Stethoscope = require('../');

describe('Index', () => {
	it('wires up the package', () => {
		const expectedClient = {
			loggers: {
				age: require('../lib/loggers/age')
			},
			metrics: {
				age: require('../lib/metrics/age')
			}
		};

		expect(Stethoscope).to.deep.equal(expectedClient);
	});
});
