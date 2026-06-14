describe('Login', () => {
  beforeEach(() => {
    cy.visit('/parabank/index.htm');
  });

  it('successfully logs in with valid credentials', () => {
    cy.get('input[name="username"]').type(Cypress.env('validUser'));
    cy.get('input[name="password"]').type(Cypress.env('validPassword'));
    cy.get('input[value="Log In"]').click();

    cy.url().should('include', '/parabank/overview');
    // ParaBank shows the customer's full name (e.g. "John Smith") rather than login name
    cy.contains('a', 'Log Out').should('be.visible');
    cy.get('#accountTable, table').should('be.visible');
  });

  it('shows error message with invalid credentials', () => {
    cy.get('input[name="username"]').type('invalidUser');
    cy.get('input[name="password"]').type('wrongPassword');
    cy.get('input[value="Log In"]').click();

    cy.get('.error, p.error, #loginPanel .error, [class*="error"]')
      .should('be.visible')
      .and('not.be.empty');
    cy.url().should('not.include', '/parabank/overview');
    cy.get('input[name="username"]').should('exist');
  });

  it('logs out and returns to login page', () => {
    cy.login();
    cy.url().should('include', '/parabank/overview');

    cy.contains('a', 'Log Out').click();

    cy.url().should('include', '/parabank/index');
    cy.get('input[name="username"]').should('be.visible');
    cy.get('input[name="password"]').should('be.visible');
  });
});
