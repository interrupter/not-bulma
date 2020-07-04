

describe('notBulma', function() {
  before(async () => {
    await cy.exec('npm run buildtest');
  });

  it('Links rendering', function() {
    cy.visit('http://localhost:7357/ui.links.html');
    cy.get('a[href="/success"].is-success').should('exist');
    cy.get('a[href="/danger.html"].is-danger').should('exist');
    cy.get('a[href="/info"].is-info').should('exist');
    cy.get('a[href="/info"].is-info').click();
    cy.get('a[href="/info"].is-info').then(($el)=>{
        expect($el).to.have.text('clicked')
    });
    cy.get('a.is-danger').click();
    cy.location('href').should('eq', 'http://localhost:7357/danger.html');
  });

  it('Buttons rendering', function() {
    cy.visit('http://localhost:7357/ui.buttons.html');
    cy.get('button.is-success').should('exist');
    cy.get('button.is-danger').should('exist');
    cy.get('button.is-info').should('exist');
    cy.get('button.is-info').click();
    cy.get('button.is-info').then(($el)=>{
        expect($el).to.have.text('clicked')
    });
    cy.get('button.is-danger').click();
    cy.location('href').should('eq', 'http://localhost:7357/danger.html');
  });

});
