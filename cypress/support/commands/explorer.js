/* eslint-disable no-undef */

// title: String of the accordion title for the accordian panel to open.
Cypress.Commands.add('accordion', (title) => {
  cy.get('#main-content'); // ensure screen loads first
  let ret = cy.get('#accordion')
    .find('.panel-title a')
    .contains(new RegExp(`^${title}$`));

  ret.then((el) => {
    // Do not collapse if already expanded
    if (el.is('.collapsed')) {
      el.trigger('click');
    }
    return el;
  });

  return ret.parents('.panel');
});

/**
 * name: String of the record in the accordion panel to click.
 * partialMatch: Boolean to indicate if the name should be matched partially.
 * parentAccordId: Optional ID of the parent accordion to scope the search.
 *                 If provided, the search will be limited to items within that accordion.
 */
Cypress.Commands.add('accordionItem', (name, partialMatch = false, parentAccordId) => {
  cy.get('#main-content'); // ensure screen loads first

  const selector = parentAccordId
    ? `.sidebar-pf-left #${parentAccordId} .list-group-item`
    : '.sidebar-pf-left .list-group-item';
  cy.get(selector).each(($el) => {
    const text = $el.text().trim();
    const isMatch = partialMatch
      ? text.toLowerCase().includes(name.toLowerCase())
      : text === name;

    if (isMatch) {
      const span = $el.find('span.fa-angle-right');
      if (span.length) {
        cy.wrap(span).click({ force: true });
      } else {
        cy.wrap($el).click({ force: true });
      }

      // Stop looping after finding and clicking the matching item
      return false;
    }
    return true; // continue looping
  });
});
