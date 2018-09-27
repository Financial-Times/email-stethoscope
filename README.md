# Email-Stethoscope

Collecting performance and health data from various places in the platform

## Usage
```
npm install @financial-times/email-Stethoscope

const stethoscope = require('@financial-times/email-Stethoscope');

[...] see below for logger and metric usage
```

### Available functions
```
stethoscope
	loggers
		eventsAge
			startEvent
			endEvent
	metrics
		eventsAge
			eventAge
			eventsAge
```

### Loggers
Loggers are used to log events into the database, to be retrieved later using the metrics

#### Events Age
Events age allows for tagging events when they are started and ended:

- `loggers.startEvent({event!: any, identifier!: any, expire?: integer})`

	description:

	- logs the given event as started

	args:

	- `event`: name of event
	- `identifier`: event identifier
	- `expire`: integer specifying TTL of event

	returns:

	- `undefined`

	```
	stethoscope.loggers.startEvent({ event: 'PROCESSING_LIST', identifier: '7da32a14-a9f1-4582-81eb-e4216e0d9a51' });
	```

- `loggers.endEvent({event!: any, identifier!: any})`

	description:

	- logs the given event as ended

	args:

	- `event`: name of event
	- `identifier`: event identifier


	returns:

	- `undefined`

	```
	stethoscope.loggers.endEvent({ event: 'PROCESSING_LIST', identifier: '7da32a14-a9f1-4582-81eb-e4216e0d9a51' });
	```

### Metrics
Metrics are used to interrogate previously logged events from the database for analysis

#### Events Age
Events age allows for interrogating the age of previously logged events

- `metrics.eventAge({event!: any, identifier!: any})`:

	description:

	- Get the age of the specific event

	args:

	- `event`: name of event
	- `identifier`: event identifier

	returns:

	- `undefined` if event is not found

		or
	- `number`: the age of the given event in **milliseconds**


	```
	stethoscope.metrics.eventAge({ event: 'PROCESSING_LIST', identifier: '7da32a14-a9f1-4582-81eb-e4216e0d9a51' });
	```

- `metrics.eventsAge({event!: any, operation!: ['average', 'max', 'min']})`:

	description:

	- Get the average, max and min age of given events (by event category) - useful to identify slow running events

	args:

	- `event`: name of event
	- `operation`: metric operation.  Allowed values are **`average`, `max`, `min`**

	returns:

	- `undefined` if event is not found

		or

	- `number`: the `average`, `max` or `min` age of the given event in **milliseconds**


	```
	stethoscope.metrics.eventAge({ event: 'PROCESSING_LIST', operation: 'max' });
	```