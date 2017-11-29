'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Spazy = require('../index');

(async function() {

	const server = new Hapi.Server({ port: 8080 });

	await server.register([
		{
			plugin: Inert
		},
		{
			plugin: Spazy,
			options: {
				folder: __dirname + '/public'
			}
		}
	]);

	server.route([
		{
			method: 'GET',
			path: '/nonspa/{path*}',
			handler: {
				spazy: {
					spa: false,
					path: '*',
					base: '/nonspa'
				}
			}
		},
		{
			method: 'GET',
			path: '/{path*}',
			handler: async function (req, res) {
				return res.spazy(req.params.path);
			}
		}
	]);

	await server.start();

	console.log(`Spazy: ${server.info.uri}`);

}());
