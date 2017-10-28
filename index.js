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

			const self = {
				request: request,
				response: response,
				file: response.file,
				redirect: response.redirect
			};

			let url = opt.path;

			if (!url || url === '*') {
				url = request.url;
			}

			return Handler.call(self, url, opt);
		}
	});

	server.decorate('reply', 'spazy', function (url, opt) {
		opt = Hoek.applyToDefaults(settings, opt || {});
		return Handler.call(this, url, opt);
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
