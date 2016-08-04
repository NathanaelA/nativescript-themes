/**********************************************************************************
 * (c) 2016, Master Technology
 * Licensed under the MIT license or contact me for a Support or Commercial License
 *
 * I do contract work in most languages, so let me solve your problems!
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 1.0.0                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

/* jshint camelcase: false */
/* global UIDevice, UIDeviceOrientation, getElementsByTagName, android */

var fs = require("file-system");
var fsa = require("file-system/file-system-access").FileSystemAccess;
var frameCommon = require('ui/frame/frame-common');
var appSettings = require('application-settings');
var application = require('application');

var Themes = function() {
    this._curAppPath = fs.knownFolders.currentApp().path + "/";
};


Themes.prototype.getAppliedTheme = function(defaultTheme) {
    defaultTheme = defaultTheme || '';

    if (appSettings.hasKey('__NS.themes')) {
        var theme = appSettings.getString('__NS.themes', defaultTheme);
        if (theme == null || theme === '') { return defaultTheme; }
        return theme;
    }
    return defaultTheme;
};

Themes.prototype.applyTheme = function(cssFile, options) {
    if (!cssFile) { console.log("No Theme css file provided");  return; }
    if (application.cssSelectorVersion === 0 && !frameCommon.topmost()) {
        var self = this;
        application.on(application.launchEvent, function() {
            internalLoadCss(cssFile, self._curAppPath);
            if (!(options && options.noSave)) {
                appSettings.setString('__NS.themes', cssFile);
            }
        });
        return;
    }
    internalLoadCss(cssFile, this._curAppPath);
    if (!(options && options.noSave)) {
        appSettings.setString('__NS.themes', cssFile);
    }
};

/**
 * Override the system .css file
 * @param cssFile - css file to load
 * @param path - application path
 */
function internalLoadCss(cssFile, path) {
    var FSA = new fsa();
    var cssFileName = cssFile;

    if (cssFileName.startsWith("~/")) {
        cssFileName = fs.path.join(path, cssFileName.replace("~/", ""));
    } else if (cssFileName.startsWith("./")) {
        cssFileName = cssFileName.substring(2);
    }

    if (!cssFileName.startsWith(path)) {
        cssFileName = fs.path.join(path, cssFileName);
    }

    var changed = false, preLoaded = false;
    var curSelectors = application.appSelectors;
    for (var i=0;i<curSelectors.length;i++) {
        if (curSelectors[i]._themeFile) {
            if (curSelectors[i]._themeFile && curSelectors[i]._themeFile !== cssFileName) {
                changed = true;
                curSelectors.splice(i, 1);
                i--;
            } else {
                preLoaded = true;
                break;
            }
        }
    }

    var applicationCss;
    if (!preLoaded) {
        if (FSA.fileExists(cssFileName)) {
            var file = fs.File.fromPath(cssFileName);
            var textCSS = file.readTextSync();
            if (textCSS) {
                applicationCss = application.parseCss(textCSS, cssFileName);
            }

            // If we fail to load the file, then we will treat it as if we had already loaded it
            if (!applicationCss) {
                preLoaded = true;
            }
        }
    }

    if (changed || !preLoaded) {
        // Trigger an update
        application.cssSelectors = application.appSelectors.slice();

        if (!preLoaded) {
            for (i=0;i<applicationCss.length;i++) {
                applicationCss[i]._themeFile = cssFileName;
                application.cssSelectors.push(applicationCss[i]);
            }
        }
        application.appSelectors = application.cssSelectors.slice();
        application.cssSelectorVersion++;

        // Activate new CSS
        var f = frameCommon.topmost();
        if (f && f.currentPage) {
            f.currentPage._refreshCss();
        }
    }
}

// Export the theme system
module.exports = new Themes();
