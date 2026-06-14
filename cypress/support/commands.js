/**
 * cy.login(username, password) — logs in via the ParaBank login form.
 * Defaults to the validUser/validPassword env vars so callers can omit args.
 */
Cypress.Commands.add('login', (username, password) => {
  const user = username || Cypress.env('validUser');
  const pass = password || Cypress.env('validPassword');

  cy.visit('/parabank/index.htm');
  cy.get('input[name="username"]').clear().type(user);
  cy.get('input[name="password"]').clear().type(pass);
  cy.get('input[value="Log In"]').click();
  cy.url().should('include', '/parabank/overview');
});

/**
 * cy.logout() — clicks the Log Out link and waits for the home page.
 */
Cypress.Commands.add('logout', () => {
  cy.contains('a', 'Log Out').click();
  cy.url().should('include', '/parabank/index');
});
