'use strict';

const Hapi = require('hapi');
const Inert = require('inert');
const Spazy = require('../index');

(async function () {

	const options = { port: 8080 };
	const server = new Hapi.Server(options);

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
					path: '*',
					spa: false,
					base: '/nonspa'
				}
			}
		},
		{
			method: 'GET',
			path: '/subspa/{path*}',
			handler: async function (req, res) {
				return res.spazy(req.url, {
					base: '/subspa'
				});
			}
		},
		{
			method: 'GET',
			path: '/{path*}',
			handler: async function (req, res) {
				return res.spazy(req.url);
			}
		}
	]);

	await server.start();

	console.log(`Spazy: ${server.info.uri}`);

}()).catch(function (error) {
	console.error(error);
});
