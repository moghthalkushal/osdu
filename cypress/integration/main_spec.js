function initialSettings(cy)
  {
    
    localStorage.setItem("pageTour", "initiated");
    localStorage.setItem("osdu_refresh_token", "1//aad-L9IrAF6AEvuk9YjPuXfafuHaRh1z0VJcI9y8qbxtLy_HGXF4HNwLRSHeQ4JdRdYeb3oMK4I");
    localStorage.setItem("email", "MockEmail@mockmail.com");
    localStorage.setItem("user_name", "Mock User");
    localStorage.setItem("osdu_access_token", "osdu_user_access_token");
    localStorage.setItem("osdu_user_access_token", "eyJ0eXAiOiJKV1QiLCJub");
    localStorage.setItem("first_login", new Date());
    cy.visit('http://localhost:2222/');    
    //Cypress.env(PG_PAGE_TO_VISIT)
  }

  Cypress.config(
    {
        "baseUrl": "http://localhost:2222/"
    }
);
describe("Page level", function () {  
  it("it should open geolog-osdu-r2 data search tool ", function () {
    initialSettings(cy);
  });

  it("it should contain user info , support , page tour and logout buttons in the header section ", function () {
    cy.get(".topnav a").contains(`Welcome , Mock User`);
  });
});
describe("Map Section", function () {
  it("it should select few wells and well bore details should be loaded in the download section", function () {
    initialSettings(cy)
    cy.wait(5000);
    cy.window().then((win) => {
      const selected_srns = [
        {
          SRN: "srn:master-data/Well:1057:",
          UWI: "1057",
          WellCommonName: "ANL-01",
          currentOperator: "TNO",
        },
        {
          SRN: "srn:master-data/Well:1076:",
          UWI: "1076",
          WellCommonName: "BDM-01",
          currentOperator: "TNO",
        },
        {
          SRN: "srn:master-data/Well:1074:",
          UWI: "1074",
          WellCommonName: "BAR-NE-02-B",
          currentOperator: "TNO",
        },
      ];
     
      win.setSelectedLayers(selected_srns).then(() => {
        const count = win.downloadGridOptions.api.getDisplayedRowCount();
        expect(count).to.greaterThan(0);
      });
    });
  });
  it("it should have ANL-01 in the table section", function () {
    cy.get(".ag-cell-value").contains("ANL-01");
  });
  it("it should test search functionality on the map section", function () {
  
    cy.get(".search-button").click({ force: true }).should("be.visible");
    cy.get("#searchtext20").should("be.visible");
    cy.get("#searchtext20").should(
      "have.attr",
      "placeholder",
      "Search by Well Names"
    );
    cy.get("#searchtext20").type("A");
    cy.get(".search-tooltip")
      .should("be.visible")
      .children()
      .contains("ANL-01");
  });

  it("it should test lasso functionality on the map section", function () {
    cy.get("#toggleLasso").should("not.have.attr", "checked");

    cy.get(".leaflet-control-lasso")
      .click()
      .should("be.visible")
      .should("have.css", "background-color", "rgb(0, 123, 255)");
  });
});

describe("Download Section", function () {
  it("it should search for BDM-01 Well details", function () {
    cy.get("input.ag-floating-filter-input").first().type("ANL");
    cy.window().then((win) => {
      const count = win.downloadGridOptions.api.getDisplayedRowCount();
      cy.wrap(count).should("be.eq", 3);
    });
  });

  it("it should be able to select all wellbores when clicked on selected all", function () {
    localStorage.setItem("pageTour", "initiated");
    cy.get("div.ag-wrapper.ag-input-wrapper").first().click();
  });

  it("it should start downloading files", function () {
    cy.get("#btnDownloadLasFiles").click();
  });
});
