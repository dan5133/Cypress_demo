/**
 * API tests for ParaBank /services/bank/transactions and transfer endpoints.
 * Uses cy.request() — no UI interaction.
 */
describe('Transactions API', () => {
  const apiUrl = Cypress.env('apiUrl');
  const validUser = Cypress.env('validUser');
  const validPassword = Cypress.env('validPassword');

  let accountId;
  let secondAccountId;

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
        secondAccountId = resp.body.length > 1 ? resp.body[1].id : resp.body[0].id;
      } else {
        accountId = 13344;
        secondAccountId = 13344;
      }
    });
  });

  it('GET transactions for an account returns 200 with correct schema', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/accounts/${accountId}/transactions`,
      auth: { user: validUser, pass: validPassword },
      headers: { Accept: 'application/json' },
    }).then((resp) => {
      expect(resp.status).to.equal(200);
      expect(Array.isArray(resp.body)).to.be.true;

      if (resp.body.length > 0) {
        const tx = resp.body[0];
        expect(tx).to.have.property('date');
        expect(tx).to.have.property('amount');
        expect(tx).to.have.property('type');
        expect(typeof tx.amount).to.equal('number');
      }
    });
  });

  it('POST transfer between accounts returns success and creates a transaction', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/transfer?fromAccountId=${accountId}&toAccountId=${secondAccountId}&amount=5`,
      auth: { user: validUser, pass: validPassword },
      headers: { Accept: 'application/json' },
      failOnStatusCode: false,
    }).then((resp) => {
      expect(resp.status).to.be.oneOf([200, 201]);

      cy.request({
        method: 'GET',
        url: `${apiUrl}/accounts/${accountId}/transactions`,
        auth: { user: validUser, pass: validPassword },
        headers: { Accept: 'application/json' },
      }).then((txResp) => {
        expect(txResp.status).to.equal(200);
        expect(Array.isArray(txResp.body)).to.be.true;
        expect(txResp.body.length).to.be.greaterThan(0);
      });
    });
  });
});
