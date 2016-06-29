[![npm](https://img.shields.io/npm/v/nativescript-themes.svg)](https://www.npmjs.com/package/nativescript-themes)
[![npm](https://img.shields.io/npm/l/nativescript-themes.svg)](https://www.npmjs.com/package/nativescript-themes)
[![npm](https://img.shields.io/npm/dt/nativescript-themes.svg?label=npm%20d%2fls)](https://www.npmjs.com/package/nativescript-themes)

# nativescript-themes
A NativeScript plugin to deal with UI Themes

## License

This is released under the MIT License, meaning you are free to include this in any type of program -- However for entities that need a support contract, changes, enhancements and/or a commercial license please contact me at [http://nativescript.tools](http://nativescript.tools).

I also do contract work; so if you have a module you want built for NativeScript (or any other software projects) feel free to contact me [nathan@master-technology.com](mailto://nathan@master-technology.com).

[![Donate](https://img.shields.io/badge/Donate-PayPal-brightgreen.svg?style=plastic)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=HN8DDMWVGBNQL&lc=US&item_name=Nathanael%20Anderson&item_number=nativescript%2dthemes&no_note=1&no_shipping=1&currency_code=USD&bn=PP%2dDonationsBF%3ax%3aNonHosted)
[![Patreon](https://img.shields.io/badge/Pledge-Patreon-brightgreen.svg?style=plastic)](https://www.patreon.com/NathanaelA)


## Sample Snapshot
![Sample1](docs/themes.gif)


## Installation 

tns plugin add nativescript-themes


## Usage

To use the module you just `require()` it:

```js
var themes = require( "nativescript-themes" );
```


## You ask, how exactly does this help?
This allows you to dynamically theme an application just by calling the theme system.

red-theme.css
```css
Button {
  background-color: red;
}
```

green-theme.css
```css
Button {
  background-color: green;
}
```

## Demo
Demo shows three sample themes, and shows how to load the last chosen theme at startup.


## Why use this?
This allows you to apply a specific theme file globally so all pages get it.


### themes.applyTheme('cssFile', options);
**options.noSave** = _true_, this will cause it not to save this info for the getAppliedTheme to retrieve, this would typically used if you needed temporarily apply a theme.
```js
  var themes = require('nativescript-themes');
  themes.applyTheme('red-theme.css');
```


### theme.getAppliedTheme(<default_theme>);
This returns the last theme applied; if no theme has been applied it will use the default_theme.
```js
  var themes = require('nativescript-themes');






