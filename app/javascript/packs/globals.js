// all the globals should end up here
// this is the first pack loaded after runtime&shims&vendor
// and the only pack loaded before the asset pipeline

// packs linting errors should be fixed once all packages are moved to package.json
window.$ = window.jQuery = require('jquery'); // eslint-disable-line no-multi-assign
require('bootstrap');
require('bootstrap-datepicker');
require('bootstrap-filestyle');
require('@pf3/select');
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
require('jquery.hotkeys');

// all of patternfly js except for vertical navigation (patternfly-functions-vertical-nav.js)
// list from https://github.com/patternfly/patternfly/blob/master/Gruntfile.js#L62-L85
require('patternfly/dist/js/patternfly-settings.js');
require('patternfly/dist/js/patternfly-functions-base.js');
require('patternfly/dist/js/patternfly-functions-list.js');
require('patternfly/dist/js/patternfly-functions-sidebar.js');
require('patternfly/dist/js/patternfly-functions-popovers.js');
require('patternfly/dist/js/patternfly-functions-data-tables.js');
require('patternfly/dist/js/patternfly-functions-navigation.js');
require('patternfly/dist/js/patternfly-functions-count-chars.js');
require('patternfly/dist/js/patternfly-functions-colors.js');
require('patternfly/dist/js/patternfly-functions-charts.js');
require('patternfly/dist/js/patternfly-functions-fixed-heights.js');
require('patternfly/dist/js/patternfly-functions-tree-grid.js');

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
require('kubernetes-topology-graph');
require('@manageiq/ui-components');

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

window.CodeMirror = require('codemirror');
require('codemirror/mode/css/css.js'); // not referenced directly, needed by htmlmixed
require('codemirror/mode/htmlmixed/htmlmixed.js');
require('codemirror/mode/javascript/javascript.js'); // not referenced directly, needed by htmlmixed
require('codemirror/mode/ruby/ruby.js');
require('codemirror/mode/shell/shell.js');
require('codemirror/mode/xml/xml.js');
require('codemirror/mode/yaml/yaml.js');
require('codemirror/lib/codemirror.css');
require('codemirror/theme/eclipse.css');

// bootstrap-datepicker language catalogs
require('./bootstrap-datepicker-languages.js');

// added d3 7.X.X as alias for d3 add ins
require('d3-7.0.0');
