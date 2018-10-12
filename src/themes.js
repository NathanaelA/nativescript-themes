/**********************************************************************************
 * (c) 2016-2018, Master Technology
 * Licensed under the MIT license or contact me for a Support or Commercial License
 *
 * I do contract work in most languages, so let me solve your problems!
 *
 * Any questions please feel free to email me or put a issue up on the github repo
 * Version 2.0.0                                      Nathan@master-technology.com
 *********************************************************************************/
"use strict";

/* jshint camelcase: false */
/* global UIDevice, UIDeviceOrientation, getElementsByTagName, android */

var fs = require("file-system");
var fsa = require("file-system/file-system-access").FileSystemAccess;
var frameCommon = require("ui/frame/frame-common");
var appSettings = require("application-settings");
var application = require("application");
//var styleScope = require('ui/styling/style-scope');

// This allows some basic CSS to propogate properly from the frame; but not the localStyles CSS.  See bug NativeScript#5911 & #5912
if (!frameCommon.FrameBase.prototype.eachChild) {
    frameCommon.FrameBase.prototype.eachChild =
        frameCommon.FrameBase.prototype.eachChildView;
}

var Themes = function() {
    this._curAppPath = fs.knownFolders.currentApp().path + "/";
};

Themes.prototype.getAppliedTheme = function(defaultTheme) {
    defaultTheme = defaultTheme || "";

    if (appSettings.hasKey("__NS.themes")) {
        var theme = appSettings.getString("__NS.themes", defaultTheme);
        if (theme == null || theme === "") {
            return defaultTheme;
        }
        return theme;
    }
    return defaultTheme;
};

Themes.prototype.applyTheme = function(cssFile, options) {
    if (!cssFile) {
        console.log("No Theme css file provided");
        return;
    }
    if (!application.hasLaunched() || !frameCommon.topmost()) {
        var self = this;
        var applyTheme = function() {
            console.log("Delayed Load");
            internalLoadCssFile(cssFile, self._curAppPath);
            if (!(options && options.noSave)) {
                appSettings.setString("__NS.themes", cssFile);
            }
            application.off("loadAppCss", applyTheme);
        };

        application.on("loadAppCss", applyTheme);
        return;
    }

    console.log("Immediate Load");
    internalLoadCssFile(cssFile, this._curAppPath);
    if (!(options && options.noSave)) {
        appSettings.setString("__NS.themes", cssFile);
    }
};

Themes.prototype.applyThemeCss = function(textCss, cssFileName) {
    internalLoadCss(textCss, cssFileName);
};

function internalLoadCssFile(cssFile, path) {
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

    var textCSS = "";

    if (cssFileName && FSA.fileExists(cssFileName)) {
        var file = fs.File.fromPath(cssFileName);
        textCSS = file.readTextSync();
    }

    internalLoadCss(textCSS, cssFileName);
}

/**
 * Set the  theme .css file
 * @param cssFile - css file to load
 * @param path - application path
 */
function internalLoadCss(textCss, cssFileName) {
    // If a Frame hasn't been loaded yet, delay some more...
    var frame = frameCommon.topmost();
    if (!frame) {
        setTimeout(function() {
            internalLoadCss(textCss, cssFileName);
        }, 50);
        return;
    }

    // TODO: Check and run a test to see if we need to look at the entire frame stack and adjust each frame's CSS...
    // Notes: We can tie this to the currentPage and everything looks good for that page...  But we need this globally.
    //
    // One possible solution; We might be able to manually load the app.css file ourselves and merge it with the new theme css file.
    //    However, this will leave the side effect of loosing any other appended css that they might have added outside of this plugin...
    //

    var changed = false,
        preLoaded = false;
    var styleScope = frame._styleScope;
    var curSelectors = styleScope._localCssSelectors;
    // Clear the old Selectors out
    for (var i = 0; i < curSelectors.length; i++) {
        // Check to see if we have already loaded a theme, if so we need to remove it
        if (curSelectors[i]._themeFile) {
            // Is that a different theme?
            if (
                curSelectors[i]._themeFile &&
                curSelectors[i]._themeFile !== cssFileName
            ) {
                changed = true;
                curSelectors.splice(i, 1);
                i--;
            } else {
                // Nope, it is a rule from this theme...
                preLoaded = true;
                break;
            }
        }
    }

    var cssLength = styleScope._css.length;
    if (!preLoaded) {
        // Load the new Selectors
        var cnt = curSelectors.length;
        if (textCss) {
            styleScope.appendCss(
                "/* +NS-THEME-MT */ " + textCss + " /* -NS-THEME-MT */",
                cssFileName
            );
        }

        var newCnt = curSelectors.length;
        // If we fail to load the file, then we will treat it as if we had already loaded it
        if (cnt === newCnt) {
            preLoaded = true;
        } else {
            for (var i = cnt; i < newCnt; i++) {
                curSelectors[i]._themeFile = cssFileName;
            }
        }
    }

    // If anything changed; then we need to trigger a change...
    if (changed || !preLoaded) {
        /* First delete the old text version of the css to keep everything in sync */
        var css = styleScope._css;
        var start = css.indexOf("/* +NS-THEME-MT */");
        var end = css.indexOf("/* -NS-THEME-MT */", start);
        // Make sure we aren't deleting our newly added css  ;-)
        if (start > -1 && end > -1 && start < cssLength) {
            if (start > 0 && end < css.length) {
                css =
                    css.substring(0, start) +
                    css.substring(end + 18, css.length);
            } else if (start > 0) {
                css = css.substring(0, start);
            } else {
                css = css.substring(end + 18, css.length);
            }
            styleScope._css = css;
        }

        // Trigger a Re-sync
        styleScope._localCssSelectorVersion++;
        styleScope.ensureSelectors();
        frame._onCssStateChange();
    }
}

// Export the theme system
module.exports = new Themes();
