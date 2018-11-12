// all the globals should end up here
// this is the first pack loaded after runtime&shims&vendor
// and the only pack loaded before the asset pipeline

// packs linting errors should be fixed once all packages are moved to package.json
window.$ = window.jQuery = require('jquery');
require('bootstrap');
require('bootstrap-datepicker');
require('bootstrap-filestyle');
require('bootstrap-select');
require('bootstrap-switch');
require('bootstrap-touchspin');
require('eonasdan-bootstrap-datetimepicker');
require('jquery-ui');
require('jquery-ui/ui/widgets/draggable');
require('jquery-ui/ui/widgets/droppable');
require('jquery-ui/ui/widgets/sortable');
require('jquery-ujs');
require('jquery.observe_field');
require('patternfly-bootstrap-treeview');
require('patternfly/dist/js/patternfly.min');

window.angular = require('angular');
require('angular-ui-bootstrap');
require('angular-gettext');
require('angular-sanitize');
require('angular.validators');
require('ng-annotate-loader!angular-ui-codemirror');
require('angular-dragdrop'); // ngDragDrop, used by ui-components
require('angular-ui-sortable'); // ui.sortable, used by ui-components
require('angular-patternfly');
require('angular-bootstrap-switch');

window._ = require('lodash');
window.numeral = require('numeral');
window.sprintf = require('sprintf-js').sprintf;
window.c3 = require('c3');
window.d3 = require('d3');

window.moment = require('moment');
require('moment-strftime');
require('moment-timezone');
require('moment-duration-format')(window.moment);

require('@pf3/timeline');
