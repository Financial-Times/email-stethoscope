const logger = require('@financial-times/n-logger');
const Redis = require('ioredis');
const redisClient = new Redis();

module.exports.startEvent = ({event, identifier}) => {
    //if (!event) {throw new Error('event required');}
    //if (!identifier) {throw new Error('identifier required')}
    //if (!event) {
        //console.log('called');
        //logger.default.error('event is missing')};
        const key = 'PROCESSING_SOMETHING';
        redisClient.hmset(key, { startDate: Date.now() }).then(() => redisClient.expire(key,10));

};