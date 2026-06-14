describe('Account Overview', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/parabank/overview.htm');
  });

  it('displays account list with correct format', () => {
    cy.get('#accountTable').should('be.visible');

    cy.get('#accountTable tbody tr').should('have.length.at.least', 1);

    cy.get('#accountTable tbody tr').first().within(() => {
      cy.get('td').first().invoke('text').should('match', /\d+/);

      cy.get('td').eq(1).invoke('text').then((text) => {
        expect(text.trim()).to.match(/\$[\d,]+\.\d{2}/);
      });
    });
  });

  it('clicks an account and shows transaction history', () => {
    cy.get('#accountTable tbody tr td a').first().then(($link) => {
      const accountId = $link.text().trim();
      cy.wrap($link).click();

      cy.url().should('include', '/parabank/activity');
      cy.get('#transactionTable, table').should('be.visible');

      cy.get('table th').then(($headers) => {
        const headerTexts = [...$headers].map((h) => h.innerText.toLowerCase());
        expect(headerTexts.some((h) => h.includes('date') || h.includes('description') || h.includes('amount'))).to.be.true;
      });

      cy.get('table tbody tr').then(($rows) => {
        if ($rows.length === 0) {
          cy.contains(/no transactions|no activity/i).should('be.visible');
        } else {
          cy.wrap($rows).should('have.length.at.least', 1);
        }
      });
    });
  });
});
