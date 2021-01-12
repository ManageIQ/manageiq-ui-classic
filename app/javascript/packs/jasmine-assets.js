// jasmine can no longer consume the old asset pipeline JS, faking it through webpack

require('../oldjs/application.js');
require('jasmine-jquery/lib/jasmine-jquery.js');
require('angular-mocks');
