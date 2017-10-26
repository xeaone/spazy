'use strict';

const Stat = require('./stat');
const Boom = require('boom');
const Path = require('path');

module.exports = function (path, options) {
	const self = this;
	const file = Path.normalize(options.file);
	const folder = Path.isAbsolute(options.folder) ? Path.normalize(options.folder) : Path.join(self.request.route.settings.files.relativeTo, options.folder);

	path = path || '';
	path = Path.normalize(path);
	path = path === '/' ? Path.join(path, file) : path;

	if (options.base !== '/') {
		const baseRegExp = new RegExp('^/?' + options.base);
		path = path.replace(baseRegExp, '');
	}

	if (!Path.extname(path)) {
		const hasTrailing = path.slice(-1) === '/';

		if (options.trailing && !hasTrailing) {
			return Promise.resolve().then(function () {
				return self.redirect(self.request.path + '/');
			}).catch(function (error) {
				return self(Boom.boomify(error));
			});;
		}

		if (!options.trailing && hasTrailing) {
			return Promise.resolve().then(function () {
				return self.redirect(self.request.path.slice(0, -1));
			}).catch(function (error) {
				return self(Boom.boomify(error));
			});
		}

	}

	return Promise.resolve().then(function () {
		return Stat(path, folder, file, options.spa);
	}).then(function (data) {
		if (typeof data === 'string') {
			options.contain = folder;
			return self.file(data, options);
		} else {
			return self(data);
		}
	}).catch(function (error) {
		return self(Boom.boomify(error));
	});
};
