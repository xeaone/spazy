
# Spazy
Static and single page application plugin for hapi.js. Spazy uses the tried and true inert to handle the file serving.

## Install
`npm i spazy --save`

## Requirements
- hapi v17.X.X
- inert v5.X.X

## Example
```js
const Hapi = require('hapi');
const Inert = require('inert');
const Spazy = require('spazy');

const server = new Hapi.Server();

server.connection({ port: 8080 });

server.register([
	{
		register: require('inert')
	},
	{
		register: require('spazy'),
		options: {
			folder: '.',
			file: 'index.html'
		}
	}
], function (error) { if (error) throw error; });

server.route([
	{
		method: 'GET',
		path: '/nonspa/{path*}',
		handler: {
			spazy: {
				spa: false
			}
		}
	},
	{
		method: 'GET',
		path: '/{path*}',
		handler: function (req, res) {
			return res.spazy(req.params.path);
		}
	}
]);

server.start();
```

## API

### `options`
Options can be used for register, response.spazy, and handler.spazy. Options used in response and handler will overwrites the register options locally for that route. Also accepts options for Inert.
- `file: String` the default file to serve **index.html**
- `folder: String` the default folder to serve files **.**
- `spa: Boolean` single page application mode **default true**
- `trailing: Boolean` redirect trailing slash **default false**
- `base: String` will set the base path. Usefull for serving content from non root path **default /**

### `response.spazy(path, [options])`
Transmits a file from the file system via a handler function. Returns a promise.
- `path: String` the file/folder path to serve **required**
- `options: Object` see above options

### `handler.spazy`
Transmits a file from the file system via a handler object.
- `path: String` the file/folder path to serve **required**
	- `*` if path is an asterisk it will to serve the request.path
- `options: Object` see above options

## Authors
[AlexanderElias](https://github.com/AlexanderElias)

## License
[Why You Should Choose MPL-2.0](http://veldstra.org/2016/12/09/you-should-choose-mpl2-for-your-opensource-project.html)
This project is licensed under the MPL-2.0 License
