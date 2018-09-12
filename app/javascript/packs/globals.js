// all the globals should end up here
// this is the first pack loaded after runtime&shims&vendor
// and the only pack loaded before the asset pipeline

window.$ = window.jQuery = require('jquery');
require('jquery-ui');
require('jquery-ui/ui/widgets/draggable');
require('jquery-ui/ui/widgets/droppable');
require('jquery-ui/ui/widgets/sortable');
require('jquery-ujs');
require('jquery.observe_field');
require('bootstrap-filestyle');
require('patternfly-bootstrap-treeview');

window.angular = require('angular');
require('angular-gettext');
require('angular-sanitize');
require('angular.validators/angular.validators');
require('ng-annotate-loader!angular-ui-codemirror');
require('angular-dragdrop');  // ngDragDrop, used by ui-components
require('angular-ui-sortable'); // ui.sortable, used by ui-components

window._ = require('lodash');
window.numeral = require('numeral');
window.sprintf = require('sprintf-js').sprintf;

window.moment = require('moment');
require("moment-strftime");
require("moment-timezone");
require("moment-duration-format")(window.moment);
