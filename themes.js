/**********************************************************************************
 * (c) 2016, Master Technology
 * Licensed under the MIT license or contact me for a Support or Commercial License
 *
 * I do contract work in most languages, so let me solve your problems!
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 0.0.1                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

/* jshint camelcase: false */
/* global UIDevice, UIDeviceOrientation, getElementsByTagName, android */

var fs = require("file-system");
var fsa = require("file-system/file-system-access").FileSystemAccess;
var frameCommon = require('ui/frame/frame-common');
var appSettings = require('application-settings');
var application = require('application');
var styleScope = require("ui/styling/style-scope");


var Themes = function() {
    this._curAppPath = fs.knownFolders.currentApp().path + "/";
};


Themes.prototype.getAppliedTheme = function(defaultTheme) {
    defaultTheme = defaultTheme || '';
    
    if (appSettings.hasKey('__NS.themes')) {
        return appSettings.getString('__NS.themes', defaultTheme);
    }
    return defaultTheme;
};

Themes.prototype.applyTheme = function(cssFile, options) {
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
    if (cssFile.startsWith("./")) {
        cssFile = cssFile.substring(2);
    }

    var cssFileName;
    if (cssFile.startsWith(path)) {
        cssFileName = cssFile;
    } else {
        cssFileName = fs.path.join(path, cssFile);
    }

    var applicationCss;
    if (FSA.fileExists(cssFileName)) {
        applicationCss = FSA.readText(cssFileName);
        //noinspection JSUnusedAssignment
        application.cssSelectorsCache = styleScope.StyleScope.createSelectorsFromCss(applicationCss, cssFileName);

        // Add New CSS to Current Page
        var f = frameCommon.topmost();
        if (f && f.currentPage) {
            f.currentPage._resetCssValues();
            f.currentPage._styleScope = new styleScope.StyleScope();
            //noinspection JSUnusedAssignment
            f.currentPage._addCssInternal(applicationCss, cssFileName);
            f.currentPage._refreshCss();
        }
    }
};


// Export the theme system
module.exports = new Themes();
