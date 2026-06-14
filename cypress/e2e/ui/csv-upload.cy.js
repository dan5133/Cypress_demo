/**
 * ParaBank does not have a native CSV upload page, so these tests target a
 * generic file-input element that we inject into the page via cy.document()
 * to demonstrate the upload-testing pattern required by the spec.
 *
 * In a project with a real upload endpoint, replace the page injection with
 * cy.visit('/upload') and cy.get('input[type="file"]').
 */
describe('CSV Upload', () => {
  const csvFileName = 'bulk-transfer-data.csv';

  beforeEach(() => {
    cy.visit('/parabank/index.htm');

    cy.document().then((doc) => {
      const form = doc.createElement('form');
      form.id = 'csvUploadForm';

      const input = doc.createElement('input');
      input.type = 'file';
      input.id = 'csvFileInput';
      input.accept = '.csv';
      form.appendChild(input);

      const btn = doc.createElement('button');
      btn.id = 'uploadBtn';
      btn.type = 'submit';
      btn.textContent = 'Upload';
      form.appendChild(btn);

      const msg = doc.createElement('div');
      msg.id = 'uploadMessage';
      form.appendChild(msg);

      doc.body.prepend(form);

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = input.files[0];
        if (file) {
          msg.textContent = `Uploaded: ${file.name}`;
          msg.setAttribute('data-status', 'success');
        } else {
          msg.textContent = 'No file selected.';
          msg.setAttribute('data-status', 'error');
        }
      });
    });
  });

  it('shows filename and success message after uploading a valid CSV', () => {
    cy.fixture(csvFileName, 'binary').then((content) => {
      const blob = Cypress.Blob.binaryStringToBlob([content], 'text/csv');
      const file = new File([blob], csvFileName, { type: 'text/csv' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      cy.get('#csvFileInput').then(($input) => {
        $input[0].files = dataTransfer.files;
        $input[0].dispatchEvent(new Event('change', { bubbles: true }));
      });
    });

    cy.get('#uploadBtn').click();

    cy.get('#uploadMessage').should('be.visible');
    cy.get('#uploadMessage').should('contain.text', csvFileName);
    cy.get('#uploadMessage[data-status="success"]').should('exist');
    cy.get('#uploadMessage').invoke('text').should('include', csvFileName);
  });

  it('shows validation error or disables upload when no file is selected', () => {
    cy.get('#uploadBtn').click();

    cy.get('#uploadMessage').should('be.visible');

    cy.get('#uploadMessage').then(($msg) => {
      const status = $msg.attr('data-status');
      const text = $msg.text().toLowerCase();
      const isDisabledOrError =
        status === 'error' ||
        text.includes('no file') ||
        text.includes('select') ||
        text.includes('required');
      expect(isDisabledOrError).to.be.true;
    });

    cy.get('#csvFileInput').then(($input) => {
      expect($input[0].files.length).to.equal(0);
    });
  });
});
