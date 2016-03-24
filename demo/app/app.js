var application = require("application");

// This will setup the default theme on application load
var themes = require('nativescript-themes');
application.cssFile = themes.getAppliedTheme('light.css');


application.start({ moduleName: "main-page" });

