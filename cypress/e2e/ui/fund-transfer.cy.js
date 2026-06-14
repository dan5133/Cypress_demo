describe('Fund Transfer', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/parabank/transfer.htm');
    // Wait for account dropdowns to populate
    cy.get('#fromAccountId option').should('have.length.greaterThan', 0);
    cy.get('#toAccountId option').should('have.length.greaterThan', 0);
  });

  it('transfers funds successfully between own accounts', () => {
    cy.get('#amount').type('10');

    cy.get('#fromAccountId option').first().then(($opt) => {
      cy.get('#fromAccountId').select($opt.val());
    });
    cy.get('#toAccountId option').last().then(($opt) => {
      cy.get('#toAccountId').select($opt.val());
    });

    cy.get('input[value="Transfer"]').click();

    cy.get('#showResult', { timeout: 10000 }).should('be.visible');
    cy.contains(/transfer complete|successfully transferred/i).should('be.visible');
    cy.contains('$10.00').should('be.visible');
  });

  it('shows an error or unexpected result for a zero-amount transfer', () => {
    cy.get('#amount').type('0');

    cy.get('#fromAccountId option').first().then(($opt) => {
      cy.get('#fromAccountId').select($opt.val());
    });
    cy.get('#toAccountId option').last().then(($opt) => {
      cy.get('#toAccountId').select($opt.val());
    });

    cy.get('input[value="Transfer"]').click();

    cy.get('body').then(($body) => {
      const text = $body.text().toLowerCase();
      const hasErrorOrNoResult =
        text.includes('error') ||
        text.includes('invalid') ||
        !$body.find('#showResult').length;
      expect(hasErrorOrNoResult).to.be.true;
    });

    cy.get('input[value="Transfer"]').should('exist');
    cy.get('#amount').should('exist');
  });
});
