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

##### toolbar

* `cy.toolbarItems(toolbarButton)` - returns an array of objects {text: String, disabled: Boolean} for the toolbar dropdown buttons for when a toolbar button is clicked. `toolbarButton` is the string for the text of the toolbar button that you want to click on.
* `cy.toolbar(toolbarButton, dropdownButton)` - click on the toolbar button specified by the user. Can also then click on a specified dropdown button as well. `toolbarButton` is the string for the text of the toolbar button that you want to click on. `dropdownButton` is the string for the text of the toolbar dropdown button that you want to click on. s

#### Assertions

* `cy.expect_explorer_title(title)` - check that the title on an explorer screen matches the provided title. `title`: String for the title.
* `cy.expect_no_search_box()` - check if no searchbox is present on the screen.
* `cy.expect_rates_table(headers, rows)` - check the values in a chargeback rate table. `headers`: Array of strings representing the headers of the table. `rows`: Array of type `[String, [...String], [...String], [...String], [...String], String]` where each index of the array represents a column in the table. The arrays within the `rows` array can be any length and represent the values in each given column, e.g. an array of `[0.0, 100.0]` in the index for the `Range Start` column would verify that the column contains two range starts with values `0.0` and `100.0`.
* `cy.expect_show_list_title(title)` - check the title on a show\_list screen matches the provided title. `title`: String for the title.
* `cy.expect_search_box()` - check if searchbox is present on the screen.
* `cy.expect_text(element, text)` - check if the text in the element found by doing cy.get on the element String matches the provided text. `element`: String for the Cypress selector to get a specific element on the screen. `text`: String for the text that should be found within the selected element.
