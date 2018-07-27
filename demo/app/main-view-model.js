var Observable = require("data/observable").Observable;
var themes = require('nativescript-themes');


function getMessage(counter) {
	var themeId = counter % 3;
	if (themeId  === 0) {
		return "Current theme is: Light";
	} else if (themeId === 1) {
		return "Current theme is: Dark";
	} else {
		return "Current theme is Blue";
	}

}
function getNextTheme(counter) {
	var themeId = counter % 3;
	if (themeId  === 0) {
		return "Click for Dark theme";
	} else if (themeId === 1) {
		return "Click for Blue theme";
	} else {
		return "Click for Light theme";
	}

}


function createViewModel() {
	var viewModel = new Observable();
	viewModel.curTheme = 0;
	var curThemeName = themes.getAppliedTheme('light.css');
	if (curThemeName === 'dark.css') { viewModel.curTheme++; }
	else if (curThemeName === 'blue.css') { viewModel.curTheme += 2; }

	viewModel.message = getMessage(viewModel.curTheme);
	viewModel.nextTheme = getNextTheme(viewModel.curTheme);



	viewModel.onTap = function() {
		this.curTheme++;
		this.set("message", getMessage(this.curTheme));
		this.set("nextTheme", getNextTheme(this.curTheme));

		var themeId = this.curTheme % 3;

		switch( themeId ) {
			case 0:
				themes.applyTheme('light.css');
				break;
			case 1:
				themes.applyTheme('dark.css');
				break;
			case 2:
				themes.applyTheme('blue.css');
				break;
		}




	};

	return viewModel;
}

exports.createViewModel = createViewModel;