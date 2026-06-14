/**
 * API tests for ParaBank /services/bank/accounts endpoints.
 * Uses cy.request() — no UI interaction.
 */
describe('Accounts API', () => {
  const apiUrl = Cypress.env('apiUrl');
  const validUser = Cypress.env('validUser');
  const validPassword = Cypress.env('validPassword');

  let accountId;

  before(() => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/customers/12212/accounts`,
      auth: { user: validUser, pass: validPassword },
      headers: { Accept: 'application/json' },
      failOnStatusCode: false,
    }).then((resp) => {
      if (resp.status === 200 && Array.isArray(resp.body) && resp.body.length > 0) {
        accountId = resp.body[0].id;
      } else {
        accountId = 13344;
      }
    });
  });

  it('GET account details returns 200 with correct schema', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/accounts/${accountId}`,
      auth: { user: validUser, pass: validPassword },
      headers: { Accept: 'application/json' },
    }).then((resp) => {
      expect(resp.status).to.equal(200);

      const body = resp.body;
      expect(body).to.have.property('id');
      expect(body).to.have.property('balance');
      expect(body).to.have.property('type');
      expect(typeof body.balance).to.equal('number');
      expect(typeof body.id).to.equal('number');
    });
  });

  it('GET account with invalid ID returns 404 or error status', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/accounts/000000000`,
      auth: { user: validUser, pass: validPassword },
      headers: { Accept: 'application/json' },
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.be.oneOf([400, 404, 500]);
      expect(resp.status).to.not.equal(200);
    });
  });
});
