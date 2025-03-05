import { ReactSelect, registerDefaultFixtures } from '../../support';

describe('google: Create Server Group Modal GPU Accelerators', () => {
  before(() => {
    require('events').EventEmitter.defaultMaxListeners = 15;
  });

  beforeEach(() => {
    registerDefaultFixtures();
    cy.route('/credentials?expand=true', 'fixture:google/accelerator_zones/credentials.json');
    cy.route('/images/find?*', 'fixture:google/shared/images.json');
  });

  it(`provides different accelerators according to the server group's chosen zone`, () => {
    cy.visit('#/applications/compute/clusters');
    cy.window().its('angular').should('exist');
    cy.get('button:contains("Create Server Group")', { timeout: 10000 })
      .should('be.visible')
      .click();

    cy.get('button:contains("Add Accelerator")').click();
    const typeSelect = ReactSelect('v2-wizard-page[key=advanced] gce-accelerator-configurer td:first-of-type');
    typeSelect.get();
    typeSelect.toggleDropdown();
    typeSelect.getOptions().then(options => {
      const types = Array.from(options).map(o => o.innerHTML);
      expect(types).not.to.include('NVIDIA Tesla K80');
    });
    typeSelect.toggleDropdown();

    // Select region and zone
    cy.get('v2-wizard-page[key=location]').within(() => {
      cy.get('div.form-group:contains("Region") select').select('us-east1');
    });

    cy.get('v2-wizard-page[key=zones]').within(() => {
      cy.get('div.form-group:contains("Zone") select').select('us-east1-c');
    });

    cy.wait(1000);
    cy.get('.btn-primary').first()
      .should('be.visible')
      .click({ force: true });  
    const updatedTypeSelect = ReactSelect('v2-wizard-page[key=advanced] gce-accelerator-configurer td:first-of-type');
    updatedTypeSelect.get();
    updatedTypeSelect.toggleDropdown();
    updatedTypeSelect.getOptions().then(options => {
      const types = Array.from(options).map(o => o.innerHTML);
      expect(types).to.include('NVIDIA Tesla K80');
    });
    updatedTypeSelect.toggleDropdown();
  });

  afterEach(() => {
    cy.window().then((win) => {
      win.removeAllListeners && win.removeAllListeners();
    });
  });
});
