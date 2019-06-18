'use strict';

const Handler = require('./lib/handler');
const Package = require('./package');
const Hoek = require('@hapi/hoek');

const defaults = {
	spa: true,
	base: '/',
	folder: '.',
	redirects: [],
	secure: false,
	trailing: false,
	file: 'index.html',
};

exports.plugin = {
	once: true,
	pkg: Package,
	name: 'spazy',
	dependencies: 'inert',
	register: function (server, options) {

		const settings = Hoek.applyToDefaults(defaults, options);

		server.decorate('handler', 'spazy', function (_, opt) {
			return async function (request, response) {
				opt = Hoek.applyToDefaults(settings, opt || {});

				let url = opt.path;

				if (!url || url === '*') {
					url = request.url;
				}

				return Handler(response, url, opt);
			}
		});

		server.decorate('toolkit', 'spazy', function (url, opt) {
			opt = Hoek.applyToDefaults(settings, opt || {});

			return Handler(this, url, opt);
		});

	}
};
