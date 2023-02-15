export {};

const panelContentSelector = '[class="panel-content"]';
const panelHoverSelector = '[class="u-over"]';
const plottedHoverSelectorOff = '[class="u-cursor-pt u-off"]';
const plottedHoverSelectorOn = '[class="u-cursor-pt"]';

Cypress.Commands.add('loginGrafana', () => {
  cy.visit('/login');
  cy.get('input[name="user"]').type(Cypress.env('grafanaUsername'));
  cy.get('input[name="password"]').type(Cypress.env('grafanaPassword'));
  cy.get('[aria-label="Login button"]').click();
});

Cypress.Commands.add('logoutGrafana', () => {
  cy.visit('/logout');
});

Cypress.Commands.add('addNewPanel', () => {
  // add a new panel in a new dashboard
  cy.visit('/dashboard/new');
  cy.get('button[aria-label="Add new panel"]').click();
});

Cypress.Commands.add('addCmkDatasource', (cmkUser: string, cmkPass: string, edition: string) => {
  cy.visit('/datasources/new');
  cy.get('button[aria-label="Add data source Checkmk"]').contains('Checkmk').click();

  cy.get('input[id="basic-settings-name"]').type(' ' + edition);
  cy.get('[data-test-id="checkmk-url"]').type(Cypress.env('grafanaToCheckmkUrl'));
  cy.get('input[id="react-select-2-input"]').type(edition + '{enter}'); // TODO: introduce an id for the input selector
  cy.contains(edition).should('exist');

  cy.get('[data-test-id="checkmk-username"]').type(cmkUser);
  cy.get('[data-test-id="checkmk-password"]').type(cmkPass);
  cy.get('[id="checkmk-version"]').type('<{enter}');

  cy.get('[aria-label="Data source settings page Save and Test button"]').click();

  cy.get('[data-testid="data-testid Alert success"]').should('be.visible');
  cy.contains('Data source is working').should('be.visible');
});

Cypress.Commands.add('rmCmkDatasource', (edition: string) => {
  // Remove the previously-created datasource as teardown process.
  // This makes sure the tests use the newly generated datasource in each execution.
  // Important especially when running the tests locally if docker images are up during multiple tests' executions.

  cy.visit('/datasources/');

  cy.get('[class="page-container page-body"]')
    .contains('Checkmk ' + edition)
    .click();
  cy.contains('Delete').click();
  cy.get('button[aria-label="Confirm Modal Danger Button"]').click();
});

Cypress.Commands.add('saveDashboard', () => {
  const randInt = Math.floor(Math.random() * 1000).toString();

  cy.get('button[title="Apply changes and save dashboard"]').contains('Save').click();
  cy.get('input[aria-label="Save dashboard title field"]').type(' ' + randInt);

  cy.get('button[aria-label="Save dashboard button"]').click();
  cy.contains('Dashboard saved').should('be.visible');

  return cy.wrap(randInt);
});

Cypress.Commands.add('passOnException', (errorMessage: string) => {
  // Make the test pass if an uncaught exception with errorMessage is raised
  cy.on('uncaught:exception', (err, runnable) => {
    if (err.message.match(errorMessage)) {
      return false;
    }
  });
});

Cypress.Commands.add('assertHoverSelectorsOff', (nSelectors: number) => {
  // assert number of plotlines via hover elements
  cy.get(plottedHoverSelectorOff).should('have.length', nSelectors);
});

Cypress.Commands.add('assertHoverSelectorsOn', (nSelectors: number) => {
  // click on the panel (uncaught exception raised in the CI)
  cy.passOnException('ResizeObserver loop limit exceeded');
  cy.get(panelHoverSelector).click();

  // assert changes in the hover elements
  cy.get(plottedHoverSelectorOn).should('have.length', nSelectors);
  cy.assertHoverSelectorsOff(0);
});

Cypress.Commands.add('assertLegendElement', (text: string) => {
  cy.get(panelContentSelector).contains(text).should('be.visible');
});

Cypress.Commands.add('inputLocatorById', (id: string) => {
  return cy.get(`input[id="${id}"]`);
});

Cypress.Commands.add('inputLocatorByDataTestId', (dataTestId: string) => {
  return cy.get(`input[data-test-id="${dataTestId}"]`);
});

declare global {
  namespace Cypress {
    interface Chainable {
      loginGrafana(): Chainable<void>;
      logoutGrafana(): Chainable<void>;
      addNewPanel(): Chainable<void>;
      addCmkDatasource(cmkUser: string, cmkPass: string, edition: string): Chainable<void>;
      rmCmkDatasource(edition: string): Chainable<void>;
      saveDashboard(): Chainable<string>;
      passOnException(errorMessage: string): Chainable<void>;
      assertHoverSelectorsOff(nSelectors: number): Chainable<void>;
      assertHoverSelectorsOn(nSelectors: number): Chainable<void>;
      assertLegendElement(text: string): Chainable<void>;
      inputLocatorById(id: string): Chainable<JQuery>;
      inputLocatorByDataTestId(dataTestId: string): Chainable<JQuery>;
    }
  }
}
