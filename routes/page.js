const express = require('express');
const router = express.Router({mergeParams: true});

const fs = require("fs");
const path = require('path');
const parseUrl = require('parseurl');

const debug = require('debug')('sketchGit');

const utils = require('../pageUtils');
const repoUtils = require('../repoUtils');
const galleryRoot = utils.galleryRoot;
const isPageDir = utils.isPageDir;
const pageExists = utils.pageExists;
const pageDir = utils.pageDir;
const readPageJSON = utils.readPageJSON;
const createPageJson = utils.createPageJson;
const writePageJson = utils.writePageJson;


router.use(function(req, res, next) {
	console.log('pagesRouter: %s %s %s', req.method, req.url, req.path);
	next();
});

var repo = require('./repo');
router.use('/repo', repo.router);

// router.use('/:commitRef/*', express.static(path.join(__dirname, '..', '.gitGallery')));

/* GET users listing. */
router.get('/', function(req, res, next) {
	//     if directory does not exist
	//       offer to create a new page
	//     else (if directory does exist, but path doesn't)
	//       return 404
	if (pageExists(req.params.commitRef)) {
// console.log("page DOES exist");
		return loadPage(req.params.commitRef, res);	
	} else {
// console.log("page does NOT exist");
		createPageJson(req.params.commitRef, function(error, json) {
			if (error) {
				res.sendStatus(404);
			} else {
				json.title = "Create Page";
				json.isHead = req.params.commitRef === 'HEAD';
				if (json.isHead) {
					
console.log("Checking if working dir clean");
					repoUtils.isWorkingDirClean().then(isClean => {
						json.isClean = isClean;
						console.log("ISCLEAN: " + isClean);
						res.render('createPage.hbs', json);
					});
				} else {
					res.render('createPage.hbs', json);
				}
			}
		});
	}
	
});


router.get('/*', function(req, res, next) {
	let pn = parseUrl(req).pathname;
	let f = path.join(req.params.commitRef, pn);
	let root = '.gitGallery';
// console.log("pathname: " + pn);
// console.log('root resolved: ' + path.resolve(root));
// console.log('req url: ' + req.url);
// console.log('commitRef: ' + req.params.commitRef);
// console.log('Sending file: ' + f);
	res.sendFile(f, {root: root});
});


router.post('/editpage', function(req, res, next) {
	debug('Edit page: name=' + req.body.name + ' => value=' + req.body.value);
	let json = loadPageJSON(req.params.commitRef);
	json[req.body.name] = req.body.value;
	writePageJson(req.params.commitRef, json, (error) => {
		if (error) {
			console.log('Problem writing page.json for ' + req.params.commitRef + ': ' + error);
			return 
		}
		res.sendStatus(200);
	});
});

function loadPage(commitRef, res) {
	let json = loadPageJSON(commitRef);
	res.render('page', json);
}

function loadPageJSON(commitRef) {
	let dir = pageDir(commitRef);
	let json = readPageJSON(dir);
	json.isHead = commitRef === 'HEAD';
	json.commitRef = commitRef;
	return json;	
}



module.exports = router;
