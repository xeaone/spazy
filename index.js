'use strict';

const Handler = require('./lib/handler');
const Package = require('./package');
const Hoek = require('hoek');

const defaults = {
	spa: true,
	base: '/',
	folder: '.',
	trailing: false,
	file: 'index.html'
};

exports.register = function (server, options, next) {

	const settings = Hoek.applyToDefaults(defaults, options);

	server.handler('spazy', function (route, opt) {
		return function (request, response) {
			opt = Hoek.applyToDefaults(settings, opt || {});

			let path = opt.path;

			if (path === '*') {
				path = request.path;
			} else if (!path) {
				throw new Error('spazy path options is missing');
			}

			const self = {
				request: request,
				response: response,
				file: response.file,
				redirect: response.redirect
			};

			return Handler.call(self, path, opt);
		}
	});

	server.decorate('reply', 'spazy', function (path, opt) {
		opt = Hoek.applyToDefaults(settings, opt || {});
		return Handler.call(this, path, opt);
	});

	next();
};

exports.register.attributes = {
    once: true,
	pkg: Package,
	name: 'spazy',
	connections: false,
	dependencies: 'inert'
};
