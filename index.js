'use strict';

const Package = require('./package');
const Path = require('path');

function hasExtension (path) {
	return Path.extname(path) !== '';
};

function parsePath (path, base) {
	path = Url.parse(path).pathname;
	path = Path.normalize(path);
	path = Path.extname(path) === '' ? Path.join(path, 'index.html') : path;
	path = Path.join(base, path);
	return path;
};

function file (options, callback) {
	options = options || {};

	var hasExtension = self.hasExtension(options.path);
	options.path = self.parsePath(options.path);

	Fs.stat(options.path, function (error, stat) {
		if (error) {
			if (error.code === ENOENT) {
				if (options.spa) {
					if (hasExtension) {
						return callback(404);
					} else {
						return callback(null, Path.join(options.base, 'index.html'));
					}
				} else {
					return callback(404);
				}
			} else if (error.code === EACCESS) {
				return callback(403);
			} else {
				return callback(500);
			}
		} else {
			if (stat.isFile()) {
				return callback(null, options.path);
			} else if (stat.isDirectory()) {
				return callback(null, Path.join(options.base, 'index.html'));
			} else {
				return callback(500);
			}
		}
	});
}

function handler () {

}

function response (path, options, request) {
	const confineDir = Path.resolve(request.route.settings.files.relativeTo, options.confine);
	path = Path.isAbsolute(path) ? Path.normalize(path) : Path.join(confineDir, path);

	// verify that resolved path is in confineDir
	if (path.lastIndexOf(confineDir, 0) !== 0) {
		path = null;
	}

	file(options, function (code, path) {
		// var result, stream;
		//
		// var header = {
		// 	path: path,
		// 	code: code,
		// 	cors: self.cors,
		// 	cache: self.cache
		// };

		if (code) {
			header = Utility.createHeader(header);
			result = Utility.statusString(code);
			response.writeHead(code, header);
			response.end(result);
		} else {
			stream = Fs.createReadStream(path);

			stream.setEncoding(UTF8);

			stream.on('error', function () {
				code = 500;
				header = Utility.createHeader(header);
				result = Utility.statusString(code);
				response.writeHead(code, header);
				response.end(result);
			});

			stream.on('open', function () {
				code = 200;
				header = Utility.createHeader(header);
				response.writeHead(code, header);
			});

			stream.on('close', function () {
				response.end();
			});

			stream.pipe(response);
		}
	});

}

exports.plugin = {
	pkg: Package,
	once: true,
	register: function (server) {
		server.decorate('handler', 'spazy', handler);
		server.decorate('toolkit', 'spazy', function (path, options) {
			return this.response(response(path, options, this.request));
		});
	}
}
