### cypress in manageiq-ui-classic

#### Run

Please note that the rails server has to be running first:

    bin/rails s


Run without interaction:

    yarn cypress:run

Will run the tests in console, and output a screengrab and screenshot in `cypress/screenshots` and `cypress/videos`.

Run interactively:

    yarn cypress:open

Opens a chrome instance for debugging.


#### Write

Actual tests can be found in `cypress/integration/ui/`.

ManageIQ implements the following cypress extensions:

##### login

`cy.login()` - logs in as admin

##### navigation

* `cy.menu('Compute', 'Infrastructure', 'VMs')` - navigates the main menu
* TODO `cy.accordion('Service Dialogs')` - switch accordions
* TODO `cy.treeSelect('All VMs & Templates', 'HyperV', 'SCVMM')` - switch tree items
* TODO `cy.toolbar('Configuration', 'Edit this VM')` - trigger toolbar buttons
* TODO `cy.gtlClick('RHEL72_1')` - trigger gtl items

TODO allow using {id:...} instead of string label for menu items, gtl items, tree nodes, accordions, toolbar items

##### inspection

* `cy.menuItems()` - parse the main menu and yield an object tree
* TODO `cy.toolbarItem(...)` - yields an object describing a toolbar button state, or null

#### assertions

* `cy.expect_explorer_title('Active Services')` - check the title on an explorer screen
* `cy.expect_show_list_title('Cloud Providers')` - check the title on a show\_list screen
* TODO `cy.expect_layout('miq-layout-center_div_with_listnav')` - check current layout
