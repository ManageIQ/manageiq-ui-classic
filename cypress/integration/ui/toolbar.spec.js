describe('Toolbar', () => {
  beforeEach(() => {
    cy.login();
  });

  it("click toolbar buttons", () => {
    // click a button group button
    cy.menu('Compute', 'Infrastructure', 'Virtual Machines')
      .accordion('VMs & Templates')
      .toolbar('Lifecycle', 'Provision VMs');

    // click a standalone button
    cy.menu('Services', 'Requests')
      .toolbar('Refresh');
  });

  it("inspect toolbar buttons", () => {
    cy.menu('Services', 'Catalogs')
      .accordion('Catalog Items')
      // FIXME: tree helper
      .get('.node-treeview-sandt_tree[data-nodeid="0.0"]').click(); // tree root

    // enabled group
    cy.toolbarItem('Configuration').then((item) => {
      expect(item.id).to.equal('catalogitem_vmdb_choice');
      expect(item.label).to.equal('Configuration');
      expect(item.disabled).to.equal(false);
    });

    // disabled group
    cy.toolbarItem('Policy').then((item) => {
      expect(item.id).to.equal('catalogitem_policy_choice');
      expect(item.label).to.equal('Policy');
      expect(item.disabled).to.equal(true);
    });

    // enabled button
    cy.toolbarItem('Configuration', 'Add a New Catalog Item').then((item) => {
      expect(item.id).to.equal('catalogitem_vmdb_choice__atomic_catalogitem_new');
      expect(item.label).to.equal('Add a New Catalog Item');
      expect(item.disabled).to.equal(false);
    });

    // disabled button
    cy.toolbarItem('Configuration', 'Edit Selected Item').then((item) => {
      expect(item.id).to.equal('catalogitem_vmdb_choice__catalogitem_edit');
      expect(item.label).to.equal('Edit Selected Item');
      expect(item.disabled).to.equal(true);
    });
  });
});
