// cy.toolbarItem('Configuration', 'Edit this VM') - return a toolbar button state
Cypress.Commands.add('toolbarItem', (...items) => {
  expect(items.length).to.be.within(1, 2);

  let ret = cy.get('#toolbar')
    .find(items[1] ? '.dropdown-toggle' : 'button')
    .contains(items[0]);

  if (items[1]) {
    ret = ret.siblings('.dropdown-menu')
      .find('a > span')
      .contains(items[1])
      .parents('a > span');
  }

  return ret.then((el) => {
    return {
      id: el[0].id,
      label: el.text().trim(),
      icon: el.find('i'),
      disabled: !items[1] ? !!el.prop('disabled') : !!el.parents('li').hasClass('disabled'),
    };
  });
});

// cy.toolbar('Configuration', 'Edit this VM') - click a toolbar button
// TODO {id: 'view_grid'|'view_tile'|'view_list'} for the view toolbar
// TODO {id: 'download_choice'}, .. for the download dropdown
// TODO: some alias for having %i.fa-download, .fa-refresh, .pficon-print, .fa-arrow-left
// TODO custom buttons
Cypress.Commands.add('toolbar', (...items) => {
  expect(items.length).to.be.within(1, 2);

  let ret = cy.get('#toolbar')
    .contains(items[1] ? '.dropdown-toggle' : 'button', items[0]);
    // by-id: #id on button instead of .contains

  ret = ret.then((el) => {
    assert.equal(!!el.prop('disabled'), false, "Parent toolbar button disabled");
    return el;
  });

  if (items[1]) {
    ret.click();

    // a doesn't react to click here, have to click the span
    ret = ret.siblings('.dropdown-menu')
      .find('a > span')
      .contains(items[1])
      .parents('a > span');
      // by-id: #id on the same span

    ret = ret.then((el) => {
      assert.equal(el.parents('li').hasClass('disabled'), false, "Child toolbar button disabled");
      return el;
    });
  }

  return ret.click();
  // TODO .dropdown-toggle#vm_lifecycle_choice
});
