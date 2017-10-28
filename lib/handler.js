'use strict';

const Stat = require('./stat');
const Boom = require('boom');
const Path = require('path');
const Url = require('url');

const hasExtension = function (path) {
	return Path.extname(path);
};

const hasFile = function (path, file) {
	return path.split('/').slice(-1)[0] === file;
};

const hasTrailing = function (path) {
	return path !== '/' && path.slice(-1) === '/';
};

const hasBase = function (path, base) {
	return base !== '/' && path.slice(0, base.length) === base;
};

const addSlash = function (path) {
	return path + '/';
};

const stripSlash = function (path) {
	return path.slice(0, -1);
};

const stripFile = function (path, file) {
	return path.slice(0, -file.length-1) || '/';
};

const stripBase = function (path, base) {
	return path.slice(base.length) || '/';
};

const normalizeUrl = function (url, base) {
	let result;

	url = url || '/';
	base = typeof base === 'string' ? base : Url.format(base);
	result = Url.parse(base);

	if (typeof url === 'string') {
		url = url.indexOf('/') === 0 ? url : '/' + url;
		result.pathname = url;
	} else {
		result.pathname = url.pathname;
	}

	return result;
}

module.exports = function (url, options) {
	const self = this;
	const file = Path.normalize(options.file);
	const folder = Path.isAbsolute(options.folder) ? Path.normalize(options.folder) : Path.join(self.request.route.settings.files.relativeTo, options.folder);

	options.base = options.base.charAt(0) === '/' ? options.base : '/' + options.base;

	url = normalizeUrl(url, self.request.url);

	if (options.trailing && !hasTrailing(url.pathname)) {
		url.pathname = addSlash(url.pathname);
		return self.redirect(Url.format(url));
	}

	if (!options.trailing && hasTrailing(url.pathname)) {
		url.pathname = stripSlash(url.pathname);
		return self.redirect(Url.format(url));
	}

	if (hasFile(url.pathname, file)) {
		url.pathname = stripFile(url.pathname, file);
		return self.redirect(Url.format(url));
	}

	return Promise.resolve().then(function () {
		let path = Path.normalize(url.pathname);

		if (hasBase(path, options.base)) {
			path = stripBase(path, options.base);
		}

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
