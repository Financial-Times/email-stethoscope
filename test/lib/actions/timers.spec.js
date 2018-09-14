const { expect } = require('chai');
const { startEvent } = require('../../../lib/actions/timers');
const sinon = require('sinon');
const logger = require('@financial-times/n-logger');
const Redis = require('ioredis');
const redisClient = new Redis();

describe('timers', () => {
    describe('startEvent', () => {
        describe('with invalid args', () => {
            it.skip ('logs error if event is missing', () => {
               
              
               
            });
            it.skip ('logs error if identifier is missing', () => {
                
            });
        });
        describe('with valid args', () => {
            it ('logs the event and the identifier with the start time to the db', () => {
                const redisSpy = sinon.spy(redisClient, 'hmset');
                startEvent({event: 'PROCESSING_SOMETHING', identifier: '2342342'});
                expect(redisSpy.called).to.be.true;

            });

        });
    });
    describe('endEvent', () => {
        describe('with invalid args', () => {

        });
        describe('with valid args', () => {

        });

    });
});

