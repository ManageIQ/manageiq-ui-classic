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

##### miq_data_table_commands

* `cy.selectTableRowsByText({ textArray })` - selects table rows that contain any of the specified text values. Iterates through each text in the array and finds the corresponding row. If any text is not found in the table, it throws an error immediately. `textArray` is an array of text values to match against table rows. e.g. `cy.selectTableRowsByText({ textArray: ['Option 1', 'Option 2'] });`

##### tabs

* `cy.tabs({ tabLabel })` - finds a tab element within a tablist that contains the specified label text and automatically clicks it to navigate to the tab. It requires a `tabLabel` parameter and will throw an error if none is provided. `tabLabel` is the text content of the tab to select. Returns a Cypress chainable element representing the selected tab. e.g. `cy.tabs({ tabLabel: 'Collect Logs' });`,  `cy.tabs({ tabLabel: 'Settings' }).then(() => { cy.get('input#name').should('be.visible'); });`

##### toolbar

* `cy.toolbarItems(toolbarButton)` - returns an array of objects {text: String, disabled: Boolean} for the toolbar dropdown buttons for when a toolbar button is clicked. `toolbarButton` is the string for the text of the toolbar button that you want to click on.
* `cy.toolbar(toolbarButton, toolbarOption)` - click on the toolbar button specified by the user. Can also then click on a specified dropdown option as well. `toolbarButton` is the string for the text of the toolbar button that you want to click on. `toolbarOption` is the string for the text of the toolbar dropdown option that you want to click on.

##### api_commands

* `cy.interceptApi({ alias, method = 'POST', urlPattern, waitOnlyIfRequestIntercepted, responseInterceptor, triggerFn, onApiResponse })` - intercepts API calls and waits for them to complete. This command will: 1) Register an intercept(in method-alias format e.g. post-myApiAlias) for the given alias & URL pattern if not already registered, 2) Execute the trigger function that makes the API call, 3) Wait for the intercepted request to complete. `alias` is the string for a unique alias for this interception. `method` is the string for the HTTP method (default: 'POST'). `urlPattern` is the string or RegExp for the URL pattern to intercept. `waitOnlyIfRequestIntercepted` is a boolean that when set to true, the command will only wait for the response if the request was actually intercepted (useful for conditional API calls - default: false). `responseInterceptor` is an optional function that can modify the response before it's returned to the application, with options to stub responses (`req.reply()`), let requests go to origin (`req.continue()`), or modify origin responses (`req.continue((res) => res.send())`). e.g. `{ responseInterceptor: (req) => req.reply({ body: { customData: 'value' } }) }`, `{ responseInterceptor: (req) => req.reply({ fixture: 'users.json' }) }`, `{ responseInterceptor: (req) => req.continue((res) => { res.send(200, { modified: true }) }) }`,  `triggerFn` is the function that triggers the API call. e.g. `{ triggerFn: () => { cy.get('button').click(); } }`. `onApiResponse` is an optional callback function that receives the interception object after the API call completes. Use this to perform assertions on the response, extract data, or perform additional actions based on the API result. Default is a no-op function. e.g. `{ onApiResponse: (interception) => { expect(interception.response.statusCode).to.equal(200); } }`. Usage example: `cy.interceptApi({ alias: 'getUsers', method: 'GET', urlPattern: '/api/users', triggerFn: () => cy.get('#load-users').click(), responseInterceptor: (req) => req.reply({ body: { name: "stubbed value" } }), onApiResponse: (interception) => { expect(interception.response.statusCode).to.equal(200); } });`
* `cy.getInterceptedApiAliases()` - returns the intercepted API aliases stored in Cypress environment variables.
* `cy.setInterceptedApiAlias(aliasKey, aliasValue)` - sets an intercepted API alias in the Cypress environment variables. `aliasKey` is the string for the key/name of the alias to set. `aliasValue` is an optional string for the value to store for the alias (defaults to the same as the key). e.g. `cy.setInterceptedApiAlias('getUsersApi');`, `cy.setInterceptedApiAlias('getUsersApi', 'customValue');`
* `cy.resetInterceptedApiAliases()` - resets the intercepted API aliases stored in Cypress environment variables.

##### custom_logging_commands

* `cy.logAndThrowError(messageToLog, messageToThrow)` - Logs a custom error message to Cypress log and then throws an error. `messageToLog` is the message to display in the Cypress command log. `messageToThrow` is the optional error message to throw, defaults to `messageToLog`. e.g. `cy.logAndThrowError('This is the logged message', 'This is the thrown error message');`, `cy.logAndThrowError('This is the message that gets logged and thrown');`

##### dual_list_commands

* `cy.dualListAction({ actionType, optionsToSelect })` - performs actions on a dual-list component (components with two lists where items can be moved between them). `actionType` is the type of action to perform, use values from DUAL_LIST_ACTION_TYPE: 'add' (move selected items from left to right), 'remove' (move selected items from right to left), 'add-all' (move all items from left to right), or 'remove-all' (move all items from right to left). `optionsToSelect` is an array of option texts to select (required for 'add' and 'remove' actions, not needed for 'add-all' and 'remove-all'). e.g. `cy.dualListAction({ actionType: DUAL_LIST_ACTION_TYPE.ADD, optionsToSelect: ['Option 1', 'Option 2'] });`, `cy.dualListAction({ actionType: DUAL_LIST_ACTION_TYPE.REMOVE, optionsToSelect: ['Option 3'] });`, `cy.dualListAction({ actionType: DUAL_LIST_ACTION_TYPE.ADD_ALL });`, `cy.dualListAction({ actionType: DUAL_LIST_ACTION_TYPE.REMOVE_ALL });`

##### element_selectors

* `cy.getFormFooterButtonByTypeWithText({ buttonType, buttonText, buttonWrapperClass })` - retrieves form footer button by its name and type. `buttonText` is the name or text content of the button. `buttonType` is the HTML button type (e.g., 'button', 'submit', 'reset'). Defaults to 'button'. `buttonWrapperClass` is the CSS class of the wrapper element containing the buttons. Defaults to 'bx--btn-set'. e.g. `cy.getFormFooterButtonByTypeWithText({buttonText: 'Cancel'});`, `cy.getFormFooterButtonByTypeWithText({buttonText: 'Submit', buttonType: 'submit'});`, `cy.getFormFooterButtonByTypeWithText({buttonText: 'Save', buttonWrapperClass: 'custom-wrapper'});`
* `cy.getFormInputFieldByIdAndType({ inputId, inputType })` - retrieves a form input field by its ID and type. `inputId` is the ID of the input field. `inputType` is the HTML input type (e.g., 'text', 'email', 'password'). Defaults to 'text'. e.g. `cy.getFormInputFieldByIdAndType({inputId: 'name'});`, `cy.getFormInputFieldByIdAndType({inputId: 'name', inputType: 'text'});`
* `cy.getFormLabelByForAttribute({ forValue })` - retrieves a form label associated with a specific input field by its 'for' attribute. `forValue` is the value of the 'for' attribute that matches the input field's ID. e.g. `cy.getFormLabelByForAttribute({forValue: 'name'});`
* `cy.getFormLegendByText({ legendText })` - retrieves a form legend element by its text content. Legend elements are typically used as captions for fieldset elements in forms. `legendText` is the text content of the legend element. e.g. `cy.getFormLegendByText({legendText: 'Basic Information'});`
* `cy.getFormSelectFieldById({ selectId })` - retrieves a form select field by its ID. `selectId` is the ID of the select field. e.g. `cy.getFormSelectFieldById({selectId: 'select-scan-limit'});`
* `cy.getFormTextareaById({ textareaId })` - retrieves a form textarea field by its ID. `textareaId` is the ID of the textarea field. e.g. `cy.getFormTextareaById({textareaId: 'default.auth_key'});`

##### form_elements_validation_commands

* `cy.validateFormLabels(labelConfigs)` - validates form field labels based on provided configurations. `labelConfigs` is an array of label configuration objects with properties: `forValue` (required) - the 'for' attribute value of the label, `expectedText` (optional) - the expected text content of the label. e.g. `cy.validateFormLabels([{ forValue: 'name', expectedText: 'Name' }, { forValue: 'email', expectedText: 'Email Address' }]);` or using constants: `cy.validateFormLabels([{ [LABEL_CONFIG_KEYS.FOR_VALUE]: 'name', [LABEL_CONFIG_KEYS.EXPECTED_TEXT]: 'Name' }]);`
* `cy.validateFormFields(fieldConfigs)` - validates form input fields based on provided configurations. `fieldConfigs` is an array of field configuration objects with properties: `id` (required) - the ID of the form field, `fieldType` (optional, default: 'input') - the type of field ('input', 'select', 'textarea'), `inputFieldType` (optional, default: 'text') - the type of input field ('text', 'password', 'number'), `shouldBeDisabled` (optional, default: false) - whether the field should be disabled, `expectedValue` (optional) - the expected value of the field. e.g. `cy.validateFormFields([{ id: 'name', shouldBeDisabled: true }, { id: 'role', fieldType: 'select', expectedValue: 'admin' }]);` or using constants: `cy.validateFormFields([{ [FIELD_CONFIG_KEYS.ID]: 'email', [FIELD_CONFIG_KEYS.INPUT_FIELD_TYPE]: 'email' }, { [FIELD_CONFIG_KEYS.ID]: 'name', [FIELD_CONFIG_KEYS.SHOULD_BE_DISABLED]: true }]);`
* `cy.validateFormFooterButtons(buttonConfigs)` - validates form buttons based on provided configurations. `buttonConfigs` is an array of button configuration objects with properties: `buttonText` (required) - the text of the button, `buttonType` (optional, default: 'button') - the type of button (e.g., 'submit', 'reset'), `shouldBeDisabled` (optional, default: false) - whether the button should be disabled. e.g. `cy.validateFormFooterButtons([{ buttonText: 'Cancel' }, { buttonText: 'Submit', buttonType: 'submit', shouldBeDisabled: true }]);` or using constants: `cy.validateFormFooterButtons([{ [BUTTON_CONFIG_KEYS.TEXT]: 'Cancel' }]);`

#### Assertions

* `cy.expect_explorer_title(title)` - check that the title on an explorer screen matches the provided title. `title`: String for the title.
* `cy.expect_no_search_box()` - check if no searchbox is present on the screen.
* `cy.expect_rates_table(headers, rows)` - check the values in a chargeback rate table. `headers`: Array of strings representing the headers of the table. `rows`: Array of type `[String, [...String], [...String], [...String], [...String], String]` where each index of the array represents a column in the table. The arrays within the `rows` array can be any length and represent the values in each given column, e.g. an array of `[0.0, 100.0]` in the index for the `Range Start` column would verify that the column contains two range starts with values `0.0` and `100.0`.
* `cy.expect_show_list_title(title)` - check the title on a show\_list screen matches the provided title. `title`: String for the title.
* `cy.expect_search_box()` - check if searchbox is present on the screen.
* `cy.expect_text(element, text)` - check if the text in the element found by doing cy.get on the element String matches the provided text. `element`: String for the Cypress selector to get a specific element on the screen. `text`: String for the text that should be found within the selected element.
* `cy.expect_flash(flashType, containsText)` - command to validate flash messages. `flashType` is the type of flash. It is recommended to use values from `flashClassMap`.`containsText` is the optional text that the flash-message should contain. e.g. `expect_flash(flashClassMap.warning, 'cancelled');`
* `cy.expect_browser_confirm_with_text({ confirmTriggerFn, containsText, proceed })` - command to validate browser confirm alerts. `confirmTriggerFn` is the function that triggers the confirm dialog. This function **must return a Cypress.Chainable**, like `cy.get(...).click()` so that Cypress can properly wait and chain .then() afterward. `containsText` is the optional text that the confirm alert should contain. `proceed` is the flag to determine whether to proceed with the confirm (true = OK, false = Cancel). e.g. `cy.expect_browser_confirm_with_text({containsText: 'sure to proceed?', proceed: true, confirmTriggerFn: () => { return cy.get('[data-testid="delete"]').click()}});`, `cy.expect_browser_confirm_with_text({ confirmTriggerFn: () => cy.contains('deleted').click()});`
* `cy.expect_modal({ modalHeaderText, modalContentExpectedTexts, targetFooterButtonText })` - command to validate and interact with modal dialogs. Verifies the modal content and clicks a specified button in the modal footer. `modalHeaderText` is the optional text to verify in the modal header (case insensitive). `modalContentExpectedTexts` is an optional array of text strings that should be present in the modal content (case insensitive). `targetFooterButtonText` is the text of the button in the modal footer to click (required). e.g. `cy.expect_modal({ modalHeaderText: 'Confirmation', modalContentExpectedTexts: ['you want to continue?'], targetFooterButtonText: 'Confirm' });`, `cy.expect_modal({ modalContentExpectedTexts: ['cannot be undone.', 'data will be permanently deleted.'], targetFooterButtonText: 'Cancel' });`, `cy.expect_modal({ targetFooterButtonText: 'OK' });`
* `cy.expect_inline_field_errors({ containsText })` - command to validate inline field error messages. `containsText` is the text that the error message should contain (required). e.g. `cy.expect_inline_field_errors({ containsText: 'blank' });`, `cy.expect_inline_field_errors({ containsText: 'taken' });`
* `cy.expect_dual_list({ availableItemsHeaderText, selectedItemsHeaderText, availableItems, selectedItems })` - command to test dual-list components (components with two lists where items can be moved between them). Tests all aspects including item selection, moving items between lists, and search functionality. `availableItemsHeaderText` is the optional string for the heading of the available items list. `selectedItemsHeaderText` is the optional string for the heading of the selected items list. `availableItems` is an optional array of strings representing the items initially in the available items list. `selectedItems` is an optional array of strings representing the items initially in the selected items list. At least one of `availableItems` or `selectedItems` must contain items. The command automatically detects whether to test a flow starting from available items or selected items based on which list has items initially. e.g. `cy.expect_dual_list({ availableItemsHeaderText: 'Available Items', selectedItemsHeaderText: 'Selected Items', availableItems: ['Item 1', 'Item 2', 'Item 3'] });`, `cy.expect_dual_list({ availableItemsHeaderText: 'Unassigned Roles', selectedItemsHeaderText: 'Assigned Roles', selectedItems: ['Role 1', 'Role 2', 'Role 3'] });`
