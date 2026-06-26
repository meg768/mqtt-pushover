#!/usr/bin/env node

var Pushover = require('pushover-notifications');
var MQTT = require('mqtt-ex');

require('dotenv').config();

class App {

	constructor() {
		var yargs = require('yargs');

		yargs.usage('Usage: $0 [options]')

		yargs.option('help',     {alias:'h', describe:'Displays this information'});
		yargs.option('host',     {describe:'Specifies MQTT host', default:process.env.MQTT_HOST});
		yargs.option('password', {describe:'Password for MQTT broker', default:process.env.MQTT_PASSWORD});
		yargs.option('username', {describe:'User name for MQTT broker', default:process.env.MQTT_USERNAME});
		yargs.option('port',     {describe:'Port for MQTT', default:process.env.MQTT_PORT});
		yargs.option('topic',    {describe:'Specifies root topic', default:process.env.MQTT_TOPIC});
		yargs.option('debug',    {describe:'Debug mode', type:'boolean', default:false});

		yargs.help();
		yargs.wrap(null);

		yargs.check(function(argv) {
			return true;
		});

		this.argv   = yargs.argv;
		this.debug  = this.argv.debug ? console.log : () => {};
	}

	routeForTopic(topic) {
		var root = this.argv.topic;

		if (topic == root)
			return 'message';

		if (!topic.startsWith(`${root}/`))
			return null;

		var route = topic.slice(root.length + 1).split('/')[0];
		var routes = ['message', 'notify', 'warning', 'alarm'];

		return routes.includes(route) ? route : null;
	}


	applyRouteDefaults(payload, route) {
		var result = {...payload};

		if (route == 'warning' && result.priority == null)
			result.priority = 1;

		if (route == 'alarm') {
			if (result.priority == null)
				result.priority = 2;

			if (Number(result.priority) == 2) {
				if (result.retry == null)
					result.retry = 60;

				if (result.expire == null)
					result.expire = 3600;
			}
		}

		if (route == 'notify' && result.priority == null)
			result.priority = -1;

		if (route == 'message' && result.priority == null)
			result.priority = 0;

		if (Number(result.priority) == 2) {
			if (result.retry == null)
				result.retry = 60;

			if (result.expire == null)
				result.expire = 3600;
		}

		return result;
	}


	pushover(payload) {
		return new Promise((resolve, reject) => {
			try {
				this.debug(`Sending payload ${JSON.stringify(payload)}`);

				var user  = payload.user || process.env.PUSHOVER_USER;
				var token = payload.token || process.env.PUSHOVER_TOKEN;
				var {user: _user, token: _token, ...message} = payload;
				var push = new Pushover({user:user, token:token});

				push.send(message, (error, result) => {
					if (error)
						reject(error);
					else {
						console.log(`Sent Pushover message "${message.message || message.title || ''}".`);
						resolve();
					}
				});
			}
			catch (error) {
				reject(error);
			}

		});
	}


	send(payload) {
		console.log(`Sending Pushover payload with keys: ${Object.keys(payload).join(', ')}`);

		return this.pushover(payload).catch((error) => {
			console.error(error);
		});
	}


	parse(message) {
		if (message == '')
			return null;

		try {
			return JSON.parse(message);
		}
		catch (error) {
			return {message: message};
		}
	}


	run() {
		try {

			var argv = this.argv;

			this.mqtt = MQTT.connect(argv.host, {username:argv.username, password:argv.password, port:argv.port, protocolVersion:5});
					
			this.mqtt.on('connect', () => {
				this.debug(`Connected to host ${argv.host}:${argv.port}...`);
			});

			this.mqtt.addListener('message', (topic, message, packet) => {
				try {
					var route = this.routeForTopic(topic);

					if (!route)
						return;

					if (packet && packet.retain) {
						console.log(`Ignoring retained Pushover message on ${topic}.`);
						return;
					}

					message = message.toString();
					message = this.parse(message);

					if (message) {
						message = this.applyRouteDefaults(message, route);
						console.log(`Received Pushover ${route} on ${topic}.`);
						this.send(message);
					}
				}
				catch (error) {
					console.error(error);
				}
			});

			this.debug(`Subscribing to topic "${this.argv.topic}/#"...`);
			this.mqtt.subscribe(`${this.argv.topic}/#`, {rh:2});
			
		}
		catch(error) {
			console.error(error.stack);
		}

	}

}


new App().run();
