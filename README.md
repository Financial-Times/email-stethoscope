# Email Platform’s Stethoscope

[![CircleCI](https://circleci.com/gh/Financial-Times/email-stethoscope/tree/master.svg?style=svg&circle-token=edc64b64e84f2b869539c02e299c5b51103b0df1)](https://circleci.com/gh/Financial-Times/email-stethoscope/tree/master)

Collecting performance and health data from various places throughout the email platform.

## Usage

### Installation
```javascript
npm install @financial-times/email-stethoscope --save

const stethoscope = require('@financial-times/email-stethoscope');

[...] see below for logger and metric usage
```

You will also need to ensure that a `STETHOSCOPE_REDIS_URL` env variable is set.

### Available functions
```javascript
stethoscope
	loggers
		age
			startEvent
			endEvent
	metrics
		age
			eventAge
			eventsAge
```

*NOTE* : No functions are rejected, so you can safely avoid having to add a `catch` block for any functions used.

### Loggers
Loggers are used to log events into the database, to be retrieved later using the metrics

#### Events Age
Events age allows for tagging events when they are started and ended:

##### startEvent
```javascript
loggers.age.startEvent({event!: any, identifier!: any, expire?: integer})
```

description:

- logs the given event as started

args:

- `event`: name of event
- `identifier`: event identifier
- `expire`: integer specifying TTL of event

returns:

- `undefined`

```javascript
await stethoscope.loggers.age.startEvent({ event: 'PROCESSING_LIST', identifier: '7da32a14-a9f1-4582-81eb-e4216e0d9a51' });
```

##### endEvent
```javascript
loggers.age.endEvent({event!: any, identifier!: any})
```

description:

- logs the given event as ended

args:

- `event`: name of event
- `identifier`: event identifier


returns:

- `undefined`

```javascript
await stethoscope.loggers.age.endEvent({ event: 'PROCESSING_LIST', identifier: '7da32a14-a9f1-4582-81eb-e4216e0d9a51' });
```

### Metrics
Metrics are used to interrogate previously logged events from the database for analysis

#### Events Age
Events age allows for interrogating the age of previously logged events

##### eventAge
```javascript
metrics.age.eventAge({event!: any, identifier!: any})
```

description:

- Get the age of the specific event

args:

- `event`: name of event
- `identifier`: event identifier

returns:

- `undefined` if event is not found

	or
- `number`: the age of the given event in **milliseconds**


```javascript
await stethoscope.metrics.age.eventAge({ event: 'PROCESSING_LIST', identifier: '7da32a14-a9f1-4582-81eb-e4216e0d9a51' });
```

##### eventsAge
```javascript
metrics.age.eventsAge({event!: any, operation!: ['average', 'max', 'min']})
```

description:

- Get the average, max and min age of given events (by event category) - useful to identify slow running events

args:

- `event`: name of event
- `operation`: metric operation.  Allowed values are **`average`, `max`, `min`**

returns:

- `undefined` if event is not found

	or

- `number`: the `average`, `max` or `min` age of the given event in **milliseconds**


```javascript
await stethoscope.metrics.age.eventAge({ event: 'PROCESSING_LIST', operation: 'max' });
```

## TODO:
1) Introspection
This is a first pass that will allow us to find out the age for a specified event, for example: `Give me the max age for all event X`. The second pass is to allow this to return events by name, for example: `Give me the longest running event names`.

2) Add more types of events, for example
- `std`
- events that were never ended
- etc

Made with ❤️ and 🔥 by the [email-platform-engineers](https://github.com/orgs/Financial-Times/teams/email-platform-engineers)
