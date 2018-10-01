const { expect } = require('chai');
const stethoscope = require('../');

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

		expect(stethoscope).to.deep.equal(expectedClient);
	});
});
