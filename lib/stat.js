'use strict';

const Boom = require('boom');
const Path = require('path');
const Fs = require('fs');

// const requestPath = Path.join(folder, path);
// const defaultPath = Path.join(folder, file);

module.exports = function Stat (path, folder, file, spa) {
	return new Promise(function (resolve) {

		path = !path ? file : path;
		path = !Path.extname(path) ? Path.join(path, file) : path;

		Fs.stat(Path.join(folder, path), function (error, stat) {
			if (spa) {
				if (error) {
					if (error.code === 'ENOENT') {
						resolve(Path.join(folder, file));
					} else if (error.code === 'EACCES') {
						resolve(Boom.forbidden());
					}
				} else {
					if (stat.isFile()) {
						resolve(Path.join(folder, path));
					} else {
						resolve(Path.join(folder, file));
					}
				}
			} else {
				if (error) {
					if (error.code === 'ENOENT') {
						resolve(Boom.notFound());
					} else if (error.code === 'EACCES') {
						resolve(Boom.forbidden());
					} else {
						resolve(Boom.boomify(error));
					}
				} else {
					if (stat.isFile()) {
						resolve(Path.join(folder, path));
					} else if (stat.isDirectory()) {
						console.log(path.slice(-1));
						resolve(Path.join(folder, path, file));
					} else {
						resolve(Path.join(folder, path, file));
					}
				}
			}
		});
	});
};
