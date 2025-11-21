// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration


// ***********************************************
// Below shows you how to create various custom
// commands and overwrite existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
// ***********************************************************

// Commands
import './commands/api_commands.js';
import './commands/custom_logging_commands.js';
import './commands/dual_list_commands.js';
import './commands/element_selectors.js';
import './commands/explorer.js';
import './commands/form_elements_validation_commands.js';
import './commands/gtl.js';
import './commands/login.js';
import './commands/menu.js';
import './commands/miq_data_table_commands.js';
import './commands/select.js';
import './commands/stub_notifications.js';
import './commands/tabs.js';
import './commands/throttle_response.js';
import './commands/toolbar.js';

// Assertions
import './assertions/expect_alerts.js';
import './assertions/expect_dual_list.js';
import './assertions/expect_rates_table.js';
import './assertions/expect_search_box.js';
import './assertions/expect_text.js';
import './assertions/expect_title.js';
import './assertions/miq_data_table_assertions.js'

// cypress on rails setup:
// ***********************************************************

// Import commands.js using ES2015 syntax:
// import 'cypress-on-rails/support/index'
import './commands'
import './on-rails'

// Alternatively you can use CommonJS syntax:
// require('./commands')
// end of cypress on rails setup

// This is needed to prevent Cypress tests from failing due to uncaught errors:
// Undefined errors are occuring on every initial page load of Manage IQ
// Network and aborted errors are exlusive to firefox when cypress navigates to a new page before the api calls for the last page are fullly loaded
Cypress.on('uncaught:exception', (err, runnable) => {
    console.log(err.message);
    if (err.message.includes(`Cannot read properties of undefined (reading 'received')`) || // Error handler for Chrome
        err.message.includes(`Cannot read properties of undefined (reading 'indexOf')`) || // Error handler for Chrome
        err.message.includes(`Cannot read properties of undefined (reading '0')`) || // Error handler for Chrome
        err.message.includes('subscription is undefined') || // Error handler for Firefox
        err.message.includes('NetworkError when attempting to fetch resource.') || // Error handler for Firefox
        err.message.includes('The operation was aborted.')) // Error handler for Firefox
        {
        return false;
    }
});

beforeEach(() => {
  // Global hook run once before each test
  // cy.throttle_response(500, 56);
  // cy.stub_notifications();

  // Reset the intercepted aliases tracking object
  cy.resetInterceptedApiAliases();
})
