

describe('notBulma', function() {
  before(async () => {
    await cy.exec('npm run buildtest');
  });

  it('Forms rendering', function() {
    cy.visit('http://localhost:7357/ui.forms.html');
    //existence
    cy.get('input[name="username"]').should('exist');
    cy.get('input[name="username"]').should('have.value','username from initial data object');
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="email"]').should('have.value','111');
    cy.get('input[name="telephone"]').should('exist');
    cy.get('input[name="beenToKerch"]').should('exist');
    cy.get('select[name="country"]').should('exist');
    cy.get('input[name="date"]').should('exist');
    cy.get('input[name="favoriteColor"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('input[name="password2"]').should('exist');
    cy.get('input[name="validTill"]').should('exist');
    cy.get('input[name="agreed"]').should('exist');
    cy.get('textarea[name="story"]').should('exist');
    //filling in
    cy.get('input[name="username"]').clear();
    cy.get('input[name="username"]').type('mynameIs');
    cy.get('input[name="email"]').type('mynameIs@slim.sha');
    cy.get('input[name="telephone"]').type('+79876543210');
    cy.get('textarea[name="story"]').type('legaly there is no summer in Russia');
    cy.get('label[for="edit-form-switch-beenToKerch"]').click();
    cy.get('select[name="country"]').select('Senegal');
    cy.get('input[name="date"]').type('2001-01-12');
    cy.get('input[name="password"]').type('123456');
    cy.get('input[name="password2"]').type('123456');
    cy.get('input[name="validTill"]').type('2021-01-12');
    cy.get('input[name="agreed"]').click();
    cy.get('#form button.is-primary.pull-right').should('not.be.disabled');
  });

});
