/**
 * Data-driven bulk transfer test.
 * Reads cypress/fixtures/bulk-transfer-data.csv via papaparse and performs a
 * transfer attempt for every row, asserting the expected outcome per row.
 */
const Papa = require('papaparse');

describe('Bulk Transfer — CSV-Driven Data Testing', () => {
  let rows = [];

  before(() => {
    // Parse CSV first, then log in once for the whole suite
    cy.readFile('cypress/fixtures/bulk-transfer-data.csv').then((csvText) => {
      const result = Papa.parse(csvText.trim(), { header: true, skipEmptyLines: true });
      rows = result.data;
    });

    cy.login();
  });

  it('processes each CSV row and asserts expected outcome', () => {
    cy.wrap(rows).each((row) => {
      const amount = row.amount;
      const expected = row.expectedResult;

      // Navigate to transfer page for each row — session persists from before()
      cy.visit('/parabank/transfer.htm');

      cy.get('#fromAccountId option').should('have.length.greaterThan', 0);
      cy.get('#toAccountId option').should('have.length.greaterThan', 0);

      cy.get('#amount').clear().type(amount);

      cy.get('#fromAccountId option').first().then(($opt) => {
        cy.get('#fromAccountId').select($opt.val());
      });
      cy.get('#toAccountId option').last().then(($opt) => {
        cy.get('#toAccountId').select($opt.val());
      });

      cy.get('input[value="Transfer"]').click();

      if (expected === 'success') {
        cy.contains(/transfer complete|successfully transferred/i, { timeout: 10000 }).should('be.visible');
        cy.contains(`$${parseFloat(amount).toFixed(2)}`).should('be.visible');
      } else {
        cy.get('body').then(($body) => {
          const text = $body.text().toLowerCase();
          const hasErrorOrNoCompletion =
            text.includes('error') ||
            text.includes('insufficient') ||
            text.includes('invalid') ||
            !$body.find('#showResult').length;
          expect(hasErrorOrNoCompletion, `Row with amount=${amount} should not complete`).to.be.true;
        });
      }
    });
  });
});
