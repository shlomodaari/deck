import { registerDefaultFixtures, ReactSelect } from '../../support';

describe('google: Regional Instance Type Distribution', () => {
  beforeEach(() => {
    registerDefaultFixtures();
    cy.route('/credentials?expand=true', 'fixture:google/accelerator_zones/credentials.json');
    cy.route('/images/find?*', 'fixture:google/shared/images.json');
    cy.route('/gce/instanceTypes', 'fixture:google/instance-types.json').as('instanceTypes');
    cy.route('/gce/zones', 'fixture:google/zones.json').as('zones');
    cy.route('/gce/instanceTypes/c4-standard-2', 'fixture:google/instance-types.json').as('c4details');
  });

  const selectImage = () => {
    const imageDropdown = ReactSelect('v2-wizard-page[key=location] div.form-group:contains("Image")');
    imageDropdown.get();
    imageDropdown.toggleDropdown();
    imageDropdown.type('ubuntu-1404-trusty-v20181002');
    imageDropdown.select(0);
  };

  it('should hide c4-standard-2 in europe-west1-d when regional is false', () => {
    cy.visit('#/applications/compute/clusters');
    cy.get('button:contains("Create Server Group")').click();

    selectImage();

    cy.get('v2-wizard-page[key=location]').within(() => {
      cy.get('div.form-group:contains("Region") select').select('europe-west1');
    });

    cy.get('v2-wizard-page[key=zones]').within(() => {
      cy.contains('Distribute instances across multiple zones')
        .parent()
        .find('input[type="checkbox"]')
        .should('not.be.checked');

      cy.get('div.form-group:contains("Zone") select').select('europe-west1-d');
    });

    cy.get('.btn-primary').first().click({ force: true });

    cy.get('v2-wizard-page[key="instance-type"]').within(() => {
      cy.contains('c4-standard-2').should('not.exist');
    });
  });

  it('should show c4-standard-2 when regional is enabled without zone selection', () => {

    cy.get('v2-wizard-page[key=zones]').within(() => {
      cy.contains('Distribute instances across multiple zones')
        .parent()
        .find('input[type="checkbox"]')
        .scrollIntoView()
        .click({ force: true });
    });

    cy.get('.btn-primary').first().click({ force: true });

    cy.get('v2-wizard-page[key="instance-type"]').within(() => {
      cy.contains('c4-standard-2', { timeout: 10000 }).should('exist');
    });
  });

});