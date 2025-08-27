### cypress in manageiq-ui-classic

#### Run

Please note that the rails server has to be running first:

    bin/rails s


Run without interaction:

    yarn cypress:run:chrome
    yarn cypress:run:firefox

Will run the tests in console, and output a screengrab and screenshot in `cypress/screenshots` and `cypress/videos`.

Run interactively:

    yarn cypress:open

Opens a chrome instance for debugging.


#### Write

Actual tests can be found in `cypress/integration/ui/`.

ManageIQ implements the following cypress extensions:

#### Commands

##### explorer

* `cy.accordion(title)` - open an accordion panel. `title`: String for the accordion title for the accordion panel to open.
* `cy.accordionItem(name)` - click on a record in the accordion panel. `name`: String for the record to click in the accordion panel.
* `cy.selectAccordionItem(accordionPath)` - navigates the expanded accordion panel(use cy.accordion to expand an accordion panel) and then expand the nodes along the given path and click the final target item. `accordionPath`: A mixed array of strings and/or regex patterns that represent the path to the intended target node. e.g. Simple string path: `cy.selectAccordionItem(['Datastore', 'My-Domain', 'My-Namespace']);`, Path with regular expressions: `cy.selectAccordionItem([/^ManageIQ Region:/, /^Zone:/, /^Server:/]);`, Mixed path with strings and regular expressions: `cy.selectAccordionItem([/^ManageIQ Region:/, 'Zones', /^Zone:/]);`                                             

##### gtl

* `cy.gtl_error()` - check that error message is present.
* `cy.gtl_no_record()` - check that `No Record` message is present.
* `cy.gtlGetTable()` - returns GTL table.
* `cy.gtlGetRows(columns)` - return GTL table row data in an array. `columns`: Array of 0-based indexes of the columns to read (e.g. [1, 2, 3] will return all row data from columns 1, 2, and 3).
* `cy.gtlClickRow(columns)` - click on a row in a GTL table. `columns`: Array of `{ title: String, number: Integer }`. `title` is the string you want to find in the table to click on, `number` is the column that string is found in. (e.g. `[{title: 'Default', number: 1}, {title: 'Compute', number: 2}]` will click on a row in the GTL table with `Default` in column 1 and `Compute` in column 2. Using just `[{title: 'Default', number: 1}]` will click on the first row found in the GTL table with `Default` in column 1).

##### login

* `cy.login(user = admin, password = smartvm)` - log in to ManageIQ with the provided username and password. `user`: String for the user account to log in to, default is `admin`. `password`: String for the user account password to log in with, default is `smartvm`.

##### menu

* `cy.menu('primaryMenu', 'secondaryMenu', 'tertiaryMenu')` - navigates the side bar menu items. `primaryMenu`: String for the outer menu item on the side bar. `secondaryMenu`: String for the secondary menu when a side bar menu item is clicked. `tertiaryMenu`: String (optional) for the tertiary menu when a side bar secondary item is clicked. (e.g. `cy.menu('Overview', 'Dashboard')` will navigate to the Overview > Dashboard page while `cy.menu('Overview', 'Chargeback', 'Rates')` will navigate to the Overview > Chargeback > Rates page).
* `cy.menuItems()` - returns an Array of `{ title: String, items: Array of { title: String, href: String, items: Array of { title: String, href: String } }}` for the menu items on the side bar. `title`: String for the menu item title. `href`: String for the url to navigate to, included when the menu item has no children. `items`: Array of the same object with `title` and `href`/`items`, this is included when the menu item has children menu items.

##### tabs

* `cy.tabs({ tabLabel })` - finds a tab element within a tablist that contains the specified label text and automatically clicks it to navigate to the tab. It requires a `tabLabel` parameter and will throw an error if none is provided. `tabLabel` is the text content of the tab to select. Returns a Cypress chainable element representing the selected tab. e.g. `cy.tabs({ tabLabel: 'Collect Logs' });`,  `cy.tabs({ tabLabel: 'Settings' }).then(() => { cy.get('input#name').should('be.visible'); });`

##### toolbar

* `cy.toolbarItems(toolbarButton)` - returns an array of objects {text: String, disabled: Boolean} for the toolbar dropdown buttons for when a toolbar button is clicked. `toolbarButton` is the string for the text of the toolbar button that you want to click on.
* `cy.toolbar(toolbarButton, toolbarOption)` - click on the toolbar button specified by the user. Can also then click on a specified dropdown option as well. `toolbarButton` is the string for the text of the toolbar button that you want to click on. `toolbarOption` is the string for the text of the toolbar dropdown option that you want to click on.

##### api_commands

* `cy.interceptApi({ alias, method = 'POST', urlPattern, triggerFn, onApiResponse })` - intercepts API calls and waits for them to complete. This command will: 1) Register an intercept(in method-alias format e.g. post-myApiAlias) for the given alias & URL pattern if not already registered, 2) Execute the trigger function that makes the API call, 3) Wait for the intercepted request to complete. `alias` is the string for a unique alias for this interception. `method` is the string for the HTTP method (default: 'POST'). `urlPattern` is the string or RegExp for the URL pattern to intercept. `triggerFn` is the function that triggers the API call. `onApiResponse` is an optional callback function that receives the interception object after the API call completes. Use this to perform assertions on the response, extract data, or perform additional actions based on the API result. Default is a no-op function. e.g. `cy.interceptApi({ alias: 'getUsers', method: 'GET', urlPattern: '/api/users', triggerFn: () => cy.get('#load-users').click(), onApiResponse: (interception) => { expect(interception.response.statusCode).to.equal(200); } });`
* `cy.getInterceptedApiAliases()` - returns the intercepted API aliases stored in Cypress environment variables.
* `cy.setInterceptedApiAlias(aliasKey, aliasValue)` - sets an intercepted API alias in the Cypress environment variables. `aliasKey` is the string for the key/name of the alias to set. `aliasValue` is an optional string for the value to store for the alias (defaults to the same as the key). e.g. `cy.setInterceptedApiAlias('getUsersApi');`, `cy.setInterceptedApiAlias('getUsersApi', 'customValue');`
* `cy.resetInterceptedApiAliases()` - resets the intercepted API aliases stored in Cypress environment variables.

##### custom_logging_commands

* `cy.logAndThrowError(messageToLog, messageToThrow)` - Logs a custom error message to Cypress log and then throws an error. `messageToLog` is the message to display in the Cypress command log. `messageToThrow` is the optional error message to throw, defaults to `messageToLog`. e.g. `cy.logAndThrowError('This is the logged message', 'This is the thrown error message');`, `cy.logAndThrowError('This is the message that gets logged and thrown');`

##### element_selectors

* `cy.getFormFooterButtonByTypeWithText({ buttonType, buttonText })` - retrieves form footer button by its name and type. `buttonText` is the name or text content of the button. `buttonType` is the HTML button type (e.g., 'button', 'submit', 'reset'). Defaults to 'button'. e.g. `cy.getFormFooterButtonByType({buttonType: 'Reset', buttonText: 'reset'});`, `cy.getFormFooterButtonByTypeWithText({buttonText: 'Cancel'});`
* `cy.getFormInputFieldByIdAndType({ inputId, inputType })` - retrieves a form input field by its ID and type. `inputId` is the ID of the input field. `inputType` is the HTML input type (e.g., 'text', 'email', 'password'). Defaults to 'text'. e.g. `cy.getFormInputFieldByIdAndType({inputId: 'name'});`, `cy.getFormInputFieldByIdAndType({inputId: 'name', inputType: 'text'});`
* `cy.getFormLabelByForAttribute({ forValue })` - retrieves a form label associated with a specific input field by its 'for' attribute. `forValue` is the value of the 'for' attribute that matches the input field's ID. e.g. `cy.getFormLabelByForAttribute({forValue: 'name'});`
* `cy.getFormSelectFieldById({ selectId })` - retrieves a form select field by its ID. `selectId` is the ID of the select field. e.g. `cy.getFormSelectFieldById({selectId: 'select-scan-limit'});`

#### Assertions

* `cy.expect_explorer_title(title)` - check that the title on an explorer screen matches the provided title. `title`: String for the title.
* `cy.expect_no_search_box()` - check if no searchbox is present on the screen.
* `cy.expect_rates_table(headers, rows)` - check the values in a chargeback rate table. `headers`: Array of strings representing the headers of the table. `rows`: Array of type `[String, [...String], [...String], [...String], [...String], String]` where each index of the array represents a column in the table. The arrays within the `rows` array can be any length and represent the values in each given column, e.g. an array of `[0.0, 100.0]` in the index for the `Range Start` column would verify that the column contains two range starts with values `0.0` and `100.0`.
* `cy.expect_show_list_title(title)` - check the title on a show\_list screen matches the provided title. `title`: String for the title.
* `cy.expect_search_box()` - check if searchbox is present on the screen.
* `cy.expect_text(element, text)` - check if the text in the element found by doing cy.get on the element String matches the provided text. `element`: String for the Cypress selector to get a specific element on the screen. `text`: String for the text that should be found within the selected element.
* `cy.expect_flash(flashType, containsText)` - command to validate flash messages. `flashType` is the type of flash. It is recommended to use values from `flashClassMap`.`containsText` is the optional text that the flash-message should contain. e.g. `expect_flash(flashClassMap.warning, 'cancelled');`
* `cy.expect_browser_confirm_with_text({ confirmTriggerFn, containsText, proceed })` - command to validate browser confirm alerts. `confirmTriggerFn` is the function that triggers the confirm dialog. This function **must return a Cypress.Chainable**, like `cy.get(...).click()` so that Cypress can properly wait and chain .then() afterward. `containsText` is the optional text that the confirm alert should contain. `proceed` is the flag to determine whether to proceed with the confirm (true = OK, false = Cancel). e.g. `cy.expect_browser_confirm_with_text({containsText: 'sure to proceed?', proceed: true, confirmTriggerFn: () => { return cy.get('[data-testid="delete"]').click()}});`, `cy.expect_browser_confirm_with_text({ confirmTriggerFn: () => cy.contains('deleted').click()});`