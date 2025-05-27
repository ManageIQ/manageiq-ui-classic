require('./miq_global.js');
require('./jquery_overrides.js');

// locales
require('./i18n.js');
require('./gettextCatalog.js');

// angular
require('./miq_api.js');
require('./miq_angular_application.js');
require('./controllers/');
require('./directives/');
require('./components/');
require('./services/');

require('./miq_browser_detect.js');
require('./miq_application.js');
require('./miq_flash.js');
require('./miq_change_stored_password.js');
require('./miq_qe.js');
require('./git_import.js');
require('./import.js');
require('./automate_import_export.js');
require('./miq_c3_config.js');
require('./miq_ujs_bindings.js');
require('./miq_tree.js');
require('./miq_formatters.js');
require('./miq_grid.js');
require('./miq_list_grid.js');
require('./miq_toolbar.js');
require('./miq_c3.js');
require('./miq_explorer.js');

if (process.env.NODE_ENV === 'development' && process.env.CYPRESS !== 'true') {
  require('./miq_debug.js');
  require('./miq_debug.css');
}
