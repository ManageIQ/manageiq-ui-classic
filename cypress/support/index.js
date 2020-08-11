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
import './commands/gtl.js'
import './commands/login.js'
import './commands/menu.js'
import './commands/search.js'
import './commands/toolbar.js'

// Assertions
import './assertions/expect_explorer_title.js'
import './assertions/expect_show_list_title.js'

Cypress.Screenshot.defaults({
  screenshotOnRunFailure: !(Cypress.env('disable_screenshots') == 'true')
})
