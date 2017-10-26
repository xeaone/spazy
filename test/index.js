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
			res.spazy(req.params.path)
			// return Promise.resolve().then(function () {
			// 	return res.spazy(req.params.path);
			// }).then(function (r) {
			// 	r.code(302);
			// }).catch(function (error) {
			// 	console.log(error);
			// });
		}
	}
]);

server.start(function () {
	console.log('started');
});
