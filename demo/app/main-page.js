var createViewModel = require("./main-view-model").createViewModel;

var frame = require('ui/frame');
function onNavigatingTo(args) {
    var page = args.object;
    page.bindingContext = createViewModel();
}
exports.onNavigatingTo = onNavigatingTo;

exports.secondpage = function() {
    frame.topmost().navigate('second-page');
};