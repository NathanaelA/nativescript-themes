/**********************************************************************************
 * (c) 2016-2018, Master Technology
 * Licensed under the MIT license or contact me for a Support or Commercial License
 *
 * I do contract work in most languages, so let me solve your problems!
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 3.0.0                                      Nathan@master-technology.com
 *********************************************************************************/
// @ts-check

'use strict';

/* jshint camelcase: false */
/* global UIDevice, UIDeviceOrientation, getElementsByTagName, android */

const fs = require('tns-core-modules/file-system');
const fsa = require('tns-core-modules/file-system/file-system-access')
	.FileSystemAccess;
const frameCommon = require('tns-core-modules/ui/frame/frame-common');
const appSettings = require('tns-core-modules/application-settings');
const application = require('tns-core-modules/application');
const StyleScope = require('tns-core-modules/ui/styling/style-scope');

let _priorTheme = '!!NO_THEME_LOADED!!';

// This allows some basic CSS to propogate properly from the frame; but not the localStyles CSS.  See bug NativeScript#5911 & #5912
// if (!frameCommon.FrameBase.prototype.eachChild) {
//   //	frameCommon.FrameBase.prototype.eachChild = frameCommon.FrameBase.prototype.eachChildView;
// }

const Themes = function() {
	this._curAppPath = fs.knownFolders.currentApp().path + '/';
};

Themes.prototype.getAppliedTheme = function(defaultTheme) {
	defaultTheme = defaultTheme || '';

	if (appSettings.hasKey('__NS.themes')) {
		const theme = appSettings.getString('__NS.themes', defaultTheme);
		if (theme == null || theme === '') {
			return defaultTheme;
		}
		return theme;
	}
	return defaultTheme;
};

Themes.prototype.applyTheme = function(cssFile, options) {
	if (!cssFile) {
		console.log('No Theme css file provided');
		return;
	}
	if (!application.hasLaunched()) {
		const self = this;
		const applyTheme = function() {
			internalLoadCss(cssFile, self._curAppPath);
			if (!(options && options.noSave)) {
				appSettings.setString('__NS.themes', cssFile);
			}
			application.off('loadAppCss', applyTheme);
		};

		application.on('loadAppCss', applyTheme);
		return;
	}

	internalLoadCss(cssFile, this._curAppPath);
	if (!(options && options.noSave)) {
		appSettings.setString('__NS.themes', cssFile);
	}
};

/**
 * Set the  theme .css file
 * @param cssFile - css file to load
 * @param path - application path
 */
function internalLoadCss(cssFile, path) {
	if (!frameCommon.topmost()) {
		setTimeout(function() {
			internalLoadCss(cssFile, path);
		}, 50);
		return;
	}

	const FSA = new fsa();
	let cssFileName = cssFile;

	if (cssFileName.startsWith('~/')) {
		cssFileName = fs.path.join(path, cssFileName.replace('~/', ''));
	} else if (cssFileName.startsWith('./')) {
		cssFileName = cssFileName.substring(2);
	}

	if (!cssFileName.startsWith(path)) {
		cssFileName = fs.path.join(path, cssFileName);
	}

	// Remove old Selectors
	let changed = StyleScope.removeTaggedAdditionalCSS(_priorTheme);

	// Load the new Selectors
	if (cssFileName && FSA.fileExists(cssFileName)) {
		const file = fs.File.fromPath(cssFileName);
		const textCSS = file.readTextSync();
		if (textCSS) {
			// Add new Selectors
			StyleScope.addTaggedAdditionalCSS(textCSS, cssFileName);

			changed = true;
			_priorTheme = cssFileName;
		}
	}

	if (changed) {
		const frame = frameCommon.topmost();
		if (frame) {
			if (frame._styleScope) {
				frame._styleScope._localCssSelectorVersion++;
				frame._styleScope.ensureSelectors();
				frame._onCssStateChange();
			}
			const backStack = frame.backStack;
			if (backStack) {
				for (let i = 0; i < backStack.length; i++) {
					const page = backStack[i].resolvedPage;
					if (page) {
						//page._onCssStateChange();
						// I suspect this method is probably safer; but the above actually does work...
						page.on('navigatingTo', updatedCSSState);
					}
				}
			}

			const page = frame.currentPage;
			if (page) {
				page._onCssStateChange();
			}
		}
	}
}

function updatedCSSState(args) {
	const page = args.object;
	page._onCssStateChange();
	page.off('navigatingTo', updatedCSSState);
}

// Export the theme system
module.exports = new Themes();
