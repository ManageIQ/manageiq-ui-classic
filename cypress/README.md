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

##### explorer

* `cy.accordion(title)` - open an accordion panel. title: String for the accordion title for the accordion panel to open.
* `cy.accordionItem(name)` - click on a record in the accordion panel. name: String for the record to click in the accordion panel.

##### login

`cy.login()` - logs in as admin

##### navigation

* `cy.menu('Compute', 'Infrastructure', 'VMs')` - navigates the main menu
* `cy.accordion('Service Dialogs')` - expand accordion
* TODO `cy.treeSelect('All VMs & Templates', 'HyperV', 'SCVMM')` - switch tree items
* `cy.toolbar('Configuration', 'Edit this VM')` - trigger toolbar buttons
* TODO `cy.tab('Report Info')` - switch miq tabs

TODO allow using {id:...} instead of string label for menu items, gtl items, tree nodes, accordions, toolbar items

##### inspection

* `cy.menuItems()` - parse the main menu and yield an object tree
* `cy.toolbarItem(...)` - yields an object describing a toolbar button state, or null

#### assertions

* `cy.expect_explorer_title('Active Services')` - check the title on an explorer screen
* `cy.expect_show_list_title('Cloud Providers')` - check the title on a show\_list screen
* `cy.expect_search_box()` - check if searchbox is present on screen
* `cy.expect_no_search_box()` - check if no searchbox is present on the screen
* `cy.expect_rates_table(headers, rows)` - check the values in a chargeback rate table. `headers`: Array of strings representing the headers of the table. `rows`: Array of type `[String, [...String], [...String], [...String], [...String], String]` where each index of the array represents a column in the table. The arrays within the `rows` array can be any length and represent the values in each given column, e.g. an array of `[0.0, 100.0]` in the index for the `Range Start` column would verify that the column contains two range starts with values `0.0` and `100.0`.
* TODO `cy.expect_layout('miq-layout-center_div_with_listnav')` - check current layout

#### GTL

* `cy.gtl_error` - check that error message is present
* `cy.gtl_no_record` - check that `No data` message is present
* `cy.gtlGetTable` - return GTL table
* `cy.gtlGetRows(columns)` - return GTL table row data in an array. columns: Array of 0-based indexes of the columns to read (e.g. [1, 2, 3] will return all row data from columns 1, 2, and 3)
* `cy.gtlClickRow(columns)` - click on a row in a GTL table. columns: Array of `{ title: String, number: Integer }`. `title` is the string you want to find in the table to click on, `number` is the column that string is found in. (e.g. `[{title: 'Default', number: 1}, {title: 'Compute', number: 2}]` will click on a row in the GTL table with 'Default' in column 1 and 'Compute' in column 2. Using just `[{title: 'Default', number: 1}]` will click on the first row found in the GTL table with 'Default' in column 1).

#### searchbox

* `cy.search_box()` - check that searchbox is present 
* `cy.no_search_box()` - check that searchbox is not present

##### Toolbar

* `cy.toolbarItems(toolbarButton)` - returns an array of objects {text: String, disabled: Boolean} for the toolbar dropdown buttons for when a toolbar button is clicked. `toolbarButton` is the string for the text of the toolbar button that you want to click on.
* `cy.toolbar(toolbarButton, dropdownButton)` - click on the toolbar button specified by the user. Can also then click on a specified dropdown button as well. `toolbarButton` is the string for the text of the toolbar button that you want to click on. `dropdownButton` is the string for the text of the toolbar dropdown button that you want to click on. 
  