var createViewModel = require('./main-view-model').createViewModel;

function onNavigatingTo(args) {
	var page = args.object;
	page.bindingContext = createViewModel();
}
exports.onNavigatingTo = onNavigatingTo;

exports.secondpage = function() {
	var frame = require('tns-core-modules/ui/frame');
	//frame.topmost().currentPage.addCss("Button { background-color: green; color: purple; }");
	frame.topmost().navigate('second-page');
};
