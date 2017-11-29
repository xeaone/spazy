'use strict';

const Util = require('util');
const Boom = require('boom');
const Path = require('path');
const Fs = require('fs');

const Stat = Util.promisify(Fs.stat);

module.exports = async function (path, folder, file, spa) {
	let stat, error, result;

	path = !path ? file : path;
	path = !Path.extname(path) ? Path.join(path, file) : path;

	try {
		stat = await Stat(Path.join(folder, path));
	} catch (e) {
		error = e;
	}

	if (spa) {
		if (error) {
			if (error.code === 'ENOENT') {
				result = Path.join(folder, file);
			} else if (error.code === 'EACCES') {
				result = Boom.forbidden();
			}
		} else {
			if (stat.isFile()) {
				result = Path.join(folder, path);
			} else {
				result = Path.join(folder, file);
			}
		}
	} else {
		if (error) {
			if (error.code === 'ENOENT') {
				result = Boom.notFound();
			} else if (error.code === 'EACCES') {
				result = Boom.forbidden();
			} else {
				result = Boom.boomify(error);
			}
		} else {
			if (stat.isFile()) {
				result = Path.join(folder, path);
			} else if (stat.isDirectory()) {
				// console.log(path.slice(-1));
				result = Path.join(folder, path, file);
			} else {
				result = Path.join(folder, path, file);
			}
		}
	}

	return result;
};
