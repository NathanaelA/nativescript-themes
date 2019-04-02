# NativeScript-Themes

A NativeScript plugin to deal with dynamically loading UI Themes

## Developed by

[![MasterTech](https://plugins.nativescript.rocks/i/mtns.png)](https://plugins.nativescript.rocks/mastertech-nstudio)

[![npm](https://img.shields.io/npm/v/nativescript-themes.svg)](https://www.npmjs.com/package/nativescript-themes)
[![npm](https://img.shields.io/npm/l/nativescript-themes.svg)](https://www.npmjs.com/package/nativescript-themes)
[![npm](https://img.shields.io/npm/dt/nativescript-themes.svg?label=npm%20d%2fls)](https://www.npmjs.com/package/nativescript-themes)

## Installation

tns plugin add nativescript-themes

## Sample Snapshot

![Sample1](docs/themes.gif)

## Usage

To use the module `require()` it:

```js
var themes = require('nativescript-themes');
```

## Setup in App

Modify the entry point of your application, usually app.js

```js
var themes = require('nativescript-themes');
themes.applyTheme(themes.getAppliedTheme('red-theme.css'));
```

This will automatically apply the "red-theme.css" theme if no other theme has ever been chosen as the default theme.

## You ask, how exactly does this help?

This allows you to dynamically theme an application just by calling the theme system. Your app.css file is applied first, then the theme file and finally your page.css

red-theme.css

```css
button {
	background-color: red;
}
```

green-theme.css

```css
button {
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
var currentTheme = themes.getAppliedTheme('red-theme.css');
if (currentTheme === 'red-theme.css') {
	console.log('We are using the default red-theme!');
} else {
	console.log('We are using', currentTheme);
}
```

### Important

Be careful declaring your app styles in the main `app.css` file. Those styles take precedent over the themes. So if you plan to use a theming approach in your application, it's best to keep the `app.css` to a minimum of styles that are shared possibly between your themes.

## Tutorials

Need some extra help getting started? Check out these tutorials for dealing with NativeScript UI themes in an iOS and Android application.

- [Changing the UI Theme in a NativeScript Angular Application](https://www.thepolyglotdeveloper.com/2016/11/changing-a-nativescript-css-skin-at-runtime/)

## License

This is released under the MIT License, meaning you are free to include this in any type of program -- However for entities that need a support contract, changes, enhancements and/or a commercial license please contact me at [http://nativescript.tools](http://nativescript.tools).

I also do contract work; so if you have a module you want built for NativeScript (or any other software projects) feel free to contact me [nathan@master-technology.com](mailto://nathan@master-technology.com).

[![Donate](https://img.shields.io/badge/Donate-PayPal-brightgreen.svg?style=plastic)](https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=HN8DDMWVGBNQL&lc=US&item_name=Nathanael%20Anderson&item_number=nativescript%2dthemes&no_note=1&no_shipping=1&currency_code=USD&bn=PP%2dDonationsBF%3ax%3aNonHosted)
[![Patreon](https://img.shields.io/badge/Pledge-Patreon-brightgreen.svg?style=plastic)](https://www.patreon.com/NathanaelA)
