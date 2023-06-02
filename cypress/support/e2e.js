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
import './assertions/expect_title.js'

// This is needed to prevent Cypress tests from failing due to the error:
// Uncaught TypeError: Cannot read properties of undefined (reading 'received')
//     at push../node_modules/actioncable/lib/assets/compiled/action_cable.js.ActionCable.Subscriptions.Subscriptions.notify (vendor-5d5d9b46ecb6acf021a4.js:280600:45)
//     at Connection.message (vendor-5d5d9b46ecb6acf021a4.js:280454:43)
// This error occurs on the dashboard usually the first time ManageIQ loads and is causing the Cypress tests to fail so we need this function to prevent that behaviour
Cypress.on('uncaught:exception', (err, runnable) => {
    // returning false here prevents Cypress from
    // failing the test
    console.log(err.message);
    if (err.message.includes(`Cannot read properties of undefined (reading 'received')`)) {
        return false;
    }
});
