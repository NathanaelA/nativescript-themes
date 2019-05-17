/**********************************************************************************
 * (c) 2016-2019, Master Technology
 * Licensed under the MIT license or contact me for a Support or Commercial License
 *
 * I do contract work in most languages, so let me solve your problems!
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 3.0.1                                      Nathan@master-technology.com
 *********************************************************************************/
// @ts-check

'use strict';

/* jshint camelcase: false */
/* global UIDevice, UIDeviceOrientation, getElementsByTagName, android */

const fs = require('tns-core-modules/file-system');
const fsa = require('tns-core-modules/file-system/file-system-access').FileSystemAccess;
const frameCommon = require('tns-core-modules/ui/frame/frame-common');
const appSettings = require('tns-core-modules/application-settings');
const application = require('tns-core-modules/application');
const StyleScope = require('tns-core-modules/ui/styling/style-scope');

let _priorTheme = '!!NO_THEME_LOADED!!';

// This allows some basic CSS to propogate properly from the frame; but not the localStyles CSS.  See bug NativeScript#5911 & #5912
// if (!frameCommon.FrameBase.prototype.eachChild) {
// 		frameCommon.FrameBase.prototype.eachChild = frameCommon.FrameBase.prototype.eachChildView;
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
		return;
	}
	if (!application.hasLaunched()) {
		const self = this;
		const applyTheme = function() {
			internalLoadCssFile(cssFile, self._curAppPath);
			if (!(options && options.noSave)) {
				appSettings.setString('__NS.themes', cssFile);
			}
			application.off('loadAppCss', applyTheme);
		};

		application.on('loadAppCss', applyTheme);
		return;
	}

	internalLoadCssFile(cssFile, this._curAppPath);
	if (!(options && options.noSave)) {
		appSettings.setString('__NS.themes', cssFile);
	}
};

Themes.prototype.applyThemeCss = function(textCss, cssFileName) {
	internalLoadCss(textCss, cssFileName);
};

/**
 * Set the  theme .css file
 * @param cssFile - css file to load
 * @param path - application path
 */
function internalLoadCssFile(cssFile, path) {
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

	let textCss = '';

	// Load the new Selectors
	if (cssFileName && FSA.fileExists(cssFileName)) {
		const file = fs.File.fromPath(cssFileName);
		textCss = file.readTextSync();
	}

	internalLoadCss(textCss, cssFileName);
}

function internalLoadCss(textCss, cssFileName) {
	if (!frameCommon.topmost()) {
		setTimeout(function() {
			internalLoadCss(textCss, cssFileName);
		}, 50);
		return;
	}

	// Remove old Selectors
	let changed = StyleScope.removeTaggedAdditionalCSS(_priorTheme);

	if (textCss) {
		// Add new Selectors
		StyleScope.addTaggedAdditionalCSS(textCss, cssFileName);

		changed = true;
		_priorTheme = cssFileName;
	}

	if (changed) {
		const rootView = application.getRootView();
		if (rootView) {
			if (rootView._styleScope) {
				rootView._styleScope._localCssSelectorVersion++;
				rootView._styleScope.ensureSelectors();
				rootView._onCssStateChange();
			}
			const backStack = rootView.backStack;
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

			const frame = frameCommon.topmost();
			const page = frame && frame.currentPage;
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
