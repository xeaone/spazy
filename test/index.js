const Hapi = require('hapi');
const Inert = require('inert');
const Spazy = require('spazy');

const server = new Hapi.Server();

server.connection({
	port: 8080
});

server.register([
	{
		register: Inert
	},
	{
		register: Spazy,
		options: {
			folder: __dirname + '/public'
		}
	}
], function (error) {
	if (error) throw error;
});

server.route([
	{
		method: 'GET',
		path: '/nonspa/{path*}',
		handler: {
			spazy: {
				spa: false,
				path: '*',
				base: 'nonspa'
			}
		}
	},
	{
		method: 'GET',
		path: '/{path*}',
		handler: function (req, res) {
			return res.spazy(req.url);
			// return res.spazy(req.params.path);
		}
	}
]);

server.start(function () {
	console.log(`Server - Running: ${server.info.uri}`);
	console.log(server.info);
});
