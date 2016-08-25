#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const ncp = require('ncp').ncp;

const utils = require('../pageUtils');

const commandLineCommands = require('command-line-commands');

const validCommands = [ null, 'init' ];
const { command, argv } = commandLineCommands(validCommands);


if (!command) {
	if (ableToStart(true)) {
		startServer();
	}
} else if (command === 'init') {
	if (ableToStart(false)) {
		console.log("Found an existing gallery root at " + utils.galleryRoot);
		console.log("Aborting init.");
	} else {
		init();
	}
}


function ableToStart(logErrors) {
	let galleryExists = utils.directoryExists(utils.galleryRoot);
	if (!galleryExists && logErrors) {
		console.log("Unable to find gallery root at " + utils.galleryRoot);
		console.log("Run 'git-gallery init' to create a new gallery.");
	}
	let gitDir = path.resolve('./.git');
	let gitExists = utils.directoryExists(gitDir);
	if (!gitExists && logErrors) {
		console.log("Unable to find git repository at " + gitDir);
	}
	return galleryExists && gitExists;
}



function init() {
	// create the .gitGallery directory
	fs.mkdirSync(utils.galleryRoot);

	// copy in the default page template
	var sourcePageTemplate = path.join(__dirname, '../defaultPage.hbs');
	var destPageTemplate = path.join(utils.galleryRoot, 'page.hbs');
	ncp(sourcePageTemplate, destPageTemplate, (error) => { console.error(error); });
}


/** Starts the GitGallery server. This code is copied from the autogenerated express file 'www'. */
function startServer() {
	const app = require('../app');
	const debug = require('debug')('express:server');
	const http = require('http');

	/**
	 * Get port from environment and store in Express.
	 */
	var port = normalizePort(process.env.PORT || '3000');
	app.set('port', port);

	/**
	 * Create HTTP server.
	 */
	var server = http.createServer(app);

	/**
	 * Listen on provided port, on all network interfaces.
	 */
	server.listen(port);
	server.on('error', onError);
	server.on('listening', onListening);

	/**
	 * Normalize a port into a number, string, or false.
	 */
	function normalizePort(val) {
	 	var port = parseInt(val, 10);

	 	if (isNaN(port)) {
			// named pipe
			return val;
		}

		if (port >= 0) {
			// port number
			return port;
		}

		return false;
	}

	/**
	* Event listener for HTTP server "error" event.
	*/
	function onError(error) {
		if (error.syscall !== 'listen') {
			throw error;
		}

		var bind = typeof port === 'string'
			? 'Pipe ' + port
			: 'Port ' + port;

		// handle specific listen errors with friendly messages
		switch (error.code) {
			case 'EACCES':
				console.error(bind + ' requires elevated privileges');
				process.exit(1);
				break;
			case 'EADDRINUSE':
				console.error(bind + ' is already in use');
				process.exit(1);
				break;
			default:
				throw error;
		}
	}

	/**
	* Event listener for HTTP server "listening" event.
	*/
	function onListening() {
		var addr = server.address();
		var bind = typeof addr === 'string'
			? 'pipe ' + addr
			: 'port ' + addr.port;
		console.log('Listening for connections on ' + bind);
	}
}