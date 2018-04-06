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

// const hasBase = function (path, base) {
// 	return base !== '/' && path.slice(0, base.length) === base;
// };

const addSlash = function (path) {
	return path + '/';
};

const stripSlash = function (path) {
	return path.slice(0, -1);
};

const stripFile = function (path, file) {
	return path.slice(0, -file.length-1) || '/';
};

// const stripBase = function (path, base) {
// 	return path.slice(base.length) || '/';
// };

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

module.exports = async function (self, url, options) {
	let path, data;

	const file = Path.normalize(options.file);
	const base = options.base.charAt(0) === '/' ? options.base : '/' + options.base;
	const folder = Path.isAbsolute(options.folder) ? Path.normalize(options.folder) : Path.join(self.request.route.settings.files.relativeTo, options.folder);

	url = normalizeUrl(url, self.request.url);

	if (options.secure) {
		if (url.protocol && url.protocol === 'http') {
			url.protocol ='https';
			return self.redirect(url.toString()).permanent();
		}
	}

	if (options.redirects.length) {
		for (const redirect of options.redirects) {
			if (redirect[0] === url.pathname) {
				return self.redirect(redirect[1]).permanent();
			}
		}
	}

	if (
		url.pathname !== ''
		&& url.pathname !== '/'
		&& !hasExtension(url.pathname)
	) {

		if (options.trailing && !hasTrailing(url.pathname)) {
			url.pathname = addSlash(url.pathname);
			return self.redirect(Url.format(url)).permanent();
		}

		if (!options.trailing && hasTrailing(url.pathname)) {
			url.pathname = stripSlash(url.pathname);
			return self.redirect(Url.format(url)).permanent();
		}

	}

	if (hasFile(url.pathname, file)) {
		url.pathname = stripFile(url.pathname, file);
		return self.redirect(Url.format(url)).permanent();
	}

	path = Path.normalize(url.pathname);

	try {
		data = await Stat(path, folder, base, file, options.spa);
	} catch (error) {
		return Boom.boomify(error);
	}

	if (typeof data === 'string') {
		return self.file(data, {
			confine: folder,
			end: options.end,
			mode: options.mode,
			start: options.start,
			lookupMap: options.lookupMap,
			etagMethod: options.etagMethod,
			lookupCompressed: options.lookupCompressed
		}).code(200);
	} else {
		return data;
	}

};
