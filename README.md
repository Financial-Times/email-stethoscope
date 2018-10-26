![Email Stethoscope logo](https://www.ft.com/__origami/service/image/v2/images/raw/https%3A%2F%2Fdl.dropboxusercontent.com%2Fs%2F0j7wzjnu6b9c6mg%2Femail_stethoscope.gif?source=email-platform&width=100&format=gif)
# Email Platform’s Stethoscope

[![CircleCI](https://circleci.com/gh/Financial-Times/email-stethoscope/tree/master.svg?style=svg&circle-token=edc64b64e84f2b869539c02e299c5b51103b0df1)](https://circleci.com/gh/Financial-Times/email-stethoscope/tree/master)

Collecting performance and health data from various places throughout the email platform.

* [Usage](#usage)
	* [Prerequisite](#prerequisite)
* Available functions
	* [Loggers](#loggers)
		* [Events Age](#events-age)
			* [startEvent](#startevent)
			* [endEvent](#endevent)
	* [Metrics](#metrics)
		* [Events Age](#events-age-1)
			* [eventAge](#eventage)
			* [eventsAge](#eventsage)
			* [orderedEvents](#orderedevents)
* [TODO](#todo)

## Usage

### Env config variables
- `STETHOSCOPE_MONGO_URI`

	`String` [**required**]

	Used to set up the connection to the MongoDB instance.  See [Documentation](https://mongoosejs.com/docs/connections.html#connections) for examples of this.

- `STETHOSCOPE_EVENT_TTL`

	`Integer` [**optional**]

	The number of seconds the events should be kept for. Default is `86400` seconds (`24` hours).

### Installation
```javascript
npm install financial-times/email-stethoscope --save

const stethoscope = require('@financial-times/email-stethoscope');

[...] see below for logger and metric usage
```

*NOTE* : No functions are rejected, so you can safely avoid having to add a `catch` block for any functions used.  However, as a minimum, we still recommend that you implement `unhandledRejection` or an empty `catch`, eg:
```
await metrics.age.orderedEvents().catch()
```

### Loggers
Loggers are used to log events into the database, to be retrieved later using the metrics

#### Events Age
Events age allows for tagging events when they are started and ended:

##### startEvent
```javascript
loggers.age.startEvent({event!: Any, identifier!: Any, expire?: Integer})
```

description:

- logs the given event as started

args:

- `event`: [**required**] name of event
- `identifier`: [**required**] event identifier
- `expire`: [**optional**] specifies the TTL of event

returns:

- `undefined`

```javascript
await stethoscope.loggers.age.startEvent({ event: 'PROCESSING_LIST', identifier: '7da32a14-a9f1-4582-81eb-e4216e0d9a51' });
```

##### endEvent
```javascript
loggers.age.endEvent({event!: Any, identifier!: Any})
```

description:

- logs the given event as ended

args:

- `event`: [**required**] name of event
- `identifier`: [**required**] event identifier


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
metrics.age.eventAge({event!: Any, identifier!: Any})
```

description:

- Get the age of the specific event

args:

- `event`: [**required**] name of event
- `identifier`: [**required**] event identifier

returns:

- `undefined` if event is not found

	or

- `Number`: the age of the given event in **milliseconds**


```javascript
await stethoscope.metrics.age.eventAge({ event: 'PROCESSING_LIST', identifier: '7da32a14-a9f1-4582-81eb-e4216e0d9a51' });
```

##### eventsAge
```javascript
metrics.age.eventsAge({event!: Any, operation!: ['average', 'max', 'min']})
```

description:

- Get the average, max and min age of given events (by event category) - useful to identify slow running events

args:

- `event`: [**required**] name of event
- `operation`: [**required**] metric operation.  Allowed values are **`average`, `max`, `min`**

returns:

- `undefined` if event is not found

	or

- `Number`: the `average`, `max` or `min` age of the given event in **milliseconds**


```javascript
await stethoscope.metrics.age.eventAge({ event: 'PROCESSING_LIST', operation: 'max' });
```

##### orderedEvents
```javascript
metrics.age.orderedEvents({limit?: Integer})
```

description:

- Returns age ordered events

args:

- `limit`: [**optional**] set number of events.  All Age Events are returned when `limit` is not supplied

returns:

- `undefined` if no events exist

	or

- The list of events with age in **milliseconds**


```javascript
await stethoscope.metrics.age.orderedEvents({ limit: 1 });
```

## TODO:

1) Add more types of events, for example
- `std`
- events that were never ended

Made with ❤️ and 🔥 by the [email-platform-engineers](https://github.com/orgs/Financial-Times/teams/email-platform-engineers)
