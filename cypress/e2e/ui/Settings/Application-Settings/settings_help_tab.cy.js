describe('Settings > Application Settings > Help Menu', () => {
  beforeEach(() => {
    cy.login();
    cy.menu('Settings', 'Application Settings');
    cy.accordion('Settings');
    cy.selectAccordionItem([/^ManageIQ Region:/]);
    cy.tabs({ tabLabel: 'Help' });
  });

  afterEach(() => {
    cy.appEval("MiqRegion.my_region.settings_changes.where('key LIKE ?', '/help_menu%').destroy_all");
  });

  it('save button is disabled when form is pristine and re-disabled after a successful save', () => {
    cy.contains('button', 'Save').should('be.disabled');

    cy.get('[name="documentation_title"]').clear().type('My Docs');
    cy.contains('button', 'Save').should('not.be.disabled').click();
    cy.get('.cds--inline-notification--success').should('be.visible');
    cy.contains('button', 'Save').should('be.disabled');
  });

  it('edits all fields and dropdowns, saves, then verifies menu items reflect the changes', () => {
    cy.get('[name="documentation_title"]').clear().type('My Docs');
    cy.get('[name="documentation_url"]').clear().type('https://docs.example.com');
    cy.get('[name="documentation_type"]').select('new_window');

    cy.get('[name="product_title"]').clear().type('My Product');
    cy.get('[name="product_url"]').clear().type('https://product.example.com');
    cy.get('[name="product_type"]').select('default');

    // Ensure about_url is enabled before typing — it is disabled when about_type is modal
    cy.get('[name="about_type"]').select('default');
    cy.get('[name="about_title"]').clear().type('My About');
    cy.get('[name="about_url"]').clear().type('https://about.example.com');
    // Switch to modal last so about_url validation is already satisfied
    cy.get('[name="about_type"]').select('modal');

    cy.contains('button', 'Save').should('not.be.disabled').click();
    cy.get('.cds--inline-notification--success').should('be.visible');

    cy.get('[name="documentation_title"]').should('have.value', 'My Docs');
    cy.get('[name="documentation_url"]').should('have.value', 'https://docs.example.com');
    cy.get('[name="documentation_type"]').should('have.value', 'new_window');
    cy.get('[name="product_title"]').should('have.value', 'My Product');
    cy.get('[name="product_url"]').should('have.value', 'https://product.example.com');
    cy.get('[name="product_type"]').should('have.value', 'default');
    cy.get('[name="about_title"]').should('have.value', 'My About');
    cy.get('[name="about_type"]').should('have.value', 'modal');

    // Reload so the help menu re-renders with the saved customizations
    cy.reload();

    // Open the Settings section in the side nav to reveal the help menu items
    cy.get('#main-menu nav.primary').contains('a > span', 'Settings').click();

    // Documentation: custom label, correct href, opens in new window
    cy.get('#menu_item_documentation')
      .should('contain.text', 'My Docs')
      .and('have.attr', 'href', 'https://docs.example.com')
      .and('have.attr', 'target', '_blank');

    // Product: custom label, correct href, opens in current window
    cy.get('#menu_item_product')
      .should('contain.text', 'My Product')
      .and('have.attr', 'href', 'https://product.example.com')
      .and('not.have.attr', 'target', '_blank');

    // About: custom label, type is modal — clicking fires the About modal, not a navigation
    cy.get('#menu_item_about').should('contain.text', 'My About').click();
    cy.get('.about-modal').should('be.visible');
  });

  it('about_url is disabled when about_type is modal, enabled otherwise, and required when not modal', () => {
    // Dirty the form first so pristine never blocks Save in this test
    cy.get('[name="documentation_title"]').clear().type('x');

    // Selecting modal disables the URL field
    cy.get('[name="about_type"]').select('modal');
    cy.get('[name="about_url"]').should('be.disabled');

    // Switching away re-enables it
    cy.get('[name="about_type"]').select('default');
    cy.get('[name="about_url"]').should('not.be.disabled');

    // Clearing the URL with a non-modal type blocks save
    cy.get('[name="about_url"]').clear();
    cy.contains('button', 'Save').should('be.disabled');

    // Switching back to modal clears the validation error
    cy.get('[name="about_type"]').select('modal');
    cy.contains('button', 'Save').should('not.be.disabled');
  });
});
