const { expect } = require('chai');
const { startEvent } = require('../../../lib/actions/timers');
console.log(startEvent);

describe('timers', () => {
    describe('startEvent', () => {
        describe('with invalid args', () => {
            it ('errors if event is missing', () => {
               expect(() => startEvent({identifier:'PROCESSING_QUEUE'})).to.throw('event required')
            });
            it ('errors if identifier is missing', () => {
                expect(() => startEvent({event:'PROCESSING_LIST'})).to.throw('identifier required')
            });
        });
        describe('with valid args', () => {

        });
    });
    describe('endEvent', () => {
        describe('with invalid args', () => {

        });
        describe('with valid args', () => {

        });

    });
});

