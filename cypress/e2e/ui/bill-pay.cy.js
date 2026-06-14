describe('Bill Pay', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/parabank/billpay.htm');
  });

  it('completes bill pay form and shows confirmation', () => {
    // Fill payee details
    cy.get('input[name="payee.name"]').type('Acme Corp');
    cy.get('input[name="payee.address.street"]').type('123 Main St');
    cy.get('input[name="payee.address.city"]').type('Springfield');
    cy.get('input[name="payee.address.state"]').type('IL');
    cy.get('input[name="payee.address.zipCode"]').type('62701');
    cy.get('input[name="payee.phoneNumber"]').type('555-123-4567');
    cy.get('input[name="payee.accountNumber"]').type('12345');
    cy.get('input[name="verifyAccount"]').type('12345');
    cy.get('input[name="amount"]').type('50');

    // Wait for the from-account select to be populated (loaded via AJAX)
    cy.get('select[name="fromAccountId"], #fromAccountId', { timeout: 8000 })
      .should('exist')
      .find('option')
      .should('have.length.greaterThan', 0);

    cy.get('input[value="Send Payment"]').click();

    // ParaBank updates #billpayResult via JS — wait for it
    cy.get('#billpayResult', { timeout: 15000 })
      .should('not.have.css', 'display', 'none');

    // Assert confirmation details inside result panel
    cy.get('#billpayResult').should('contain.text', 'Acme Corp');
    cy.get('#billpayResult').should('contain.text', '$50.00');
    cy.get('#billpayResult').invoke('text').should('match', /\d+/);
  });
});
