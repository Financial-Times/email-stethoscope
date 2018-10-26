require('../lib/utils/logger').removeConsole();

const { expect } = require('chai');
const stethoscope = require('../');
const db = require('../lib/utils/db');

describe('Index', () => {
	after(async () => {
		await db.disconnect();
	});

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
