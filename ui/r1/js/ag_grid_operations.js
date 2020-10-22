/** @file ag_grid_operations.js handles all the operations made on the grid / table
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */

/*
 * variables
 */
var dataGrid;

//download-grid options
var gridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,

    },
    pagination: true,
    overlayLoadingTemplate: '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">Well logs will appear upon well selection for those well which have well log data</span>',
    columnDefs: [
        {

            headerName: 'Select All ',
            checkboxSelection: true,
            suppressMenu: true,
            suppressSorting: true,
            filter: false,
            width: 100,
            headerCheckboxSelection: true,

        },
        {
            headerName: "Name", field: "WellCommonName", width: 150, filterParams: {
                filter: 'agTextColumnFilter',
                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        },
        {
            headerName: "Curve List", field: "curves", width: 300, filterParams: {

                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: false,


            }
        },
        {
            headerName: "Operator", field: "CurrentOperator", width: 150, filterParams: {

                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        },
        {
            headerName: "Resource Type", field: "ResourceType", width: 150, filterParams: {

                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        },
        {
            headerName: "Well SRN", field: "SRN", width: 350, filterParams: {

                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        },
        {
            headerName: "Well Bore SRN", field: "WellboreSRN", width: 300, filterParams: {

                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        }
        ,
        {

            headerName: 'Select All ',
            checkboxSelection: true,
            suppressMenu: true,
            suppressSorting: true,
            filter: false,
            width: 100,
            headerCheckboxSelection: true,

        }
    ],
    animateRows: true,
    rowData: null,
    floatingFilter: true,
    enableCellTextSelection: true,
    debug: false,
    rowBuffer: 0,
    rowSelection: 'multiple',
    rowDeselection: true,

    paginationPageSize: 150,

    cacheOverflowSize: 2,

    maxBlocksInCache: 10
};

//upload-grid options
var uploadGridOptions = {
    defaultColDef: {
        sortable: true,
        filter: true,
        resizable: true,

    },
    pagination: true,
    overlayLoadingTemplate: '<span style="padding: 10px; border: 2px solid #444; background: lightgoldenrodyellow;">Please select the wells from the map section to perform the upload</span>',
    columnDefs: [        
        {
            headerName: "Name", field: "WellCommonName", width: 150, filterParams: {
                filter: 'agTextColumnFilter',
                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        },        
        {
            headerName: "Operator", field: "CurrentOperator", width: 150, filterParams: {

                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        },        
        {
            headerName: "Well SRN", field: "SRN", width: 350, filterParams: {

                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        },
        {
            headerName: "Wellbore SRN", field: "WellboreSRN", width: 350, filterParams: {

                debounceMs: 0,
                caseSensitive: false,
                suppressAndOrCondition: true,

            }
        }
                
    ],
    animateRows: true,
    rowData: null,
    floatingFilter: true,
    enableCellTextSelection: true,
    debug: false,
    rowBuffer: 0,
    rowSelection: 'single',
    rowDeselection: true,
    onSelectionChanged: onSelectionChanged,
    paginationPageSize: 150,

    cacheOverflowSize: 2,

    maxBlocksInCache: 10
};

/*
 * functions
 */



/**

* @brief

* This method draws the ag-grid depending upon the data and the options passed

*/
const drawTable = async (data, gridOptionDetails) => {
    if (!gridOptionDetails)
        gridOptionDetails = gridOptions
    if (data) {
        gridOptionDetails.api.updateRowData({ add: data });
        $('#loadingModal').modal('hide');
    }
}



/**

* @brief

* This method initializes the ag-grid depending upon the options 


*/
const initializeTable = async(eGridDiv  ,options) => {

    if (!options)
        options = gridOptions

    if (!eGridDiv)
        eGridDiv = document.getElementById('myGrid');     

    dataGrid = new agGrid.Grid(eGridDiv, options);
}



/**

* @brief

* This method handles upload form on row selection in the upload grid

*/
function onSelectionChanged() {
    var selectedRows = uploadGridOptions.api.getSelectedRows();
    $('#Job-id-ingest').text("");
    $('#ingest-job-details').css({ "visibility": "hidden" });

    $('#selected-row-details').empty();
    $('#selected-row-details').text('');
    if (selectedRows.length == 1) {
        $('#ingest-form').css({ "visibility": "visible" });        
        $('#selected-row-details').append('Selected' + '<br/>' + 'Name : ' + selectedRows[0].WellCommonName + '<br/>' + 'SRN : ' + selectedRows[0].SRN + '<br/>' + "Wellbore SRN : " + selectedRows[0].WellboreSRN);
        if (document.getElementsByName("sampleFile")[0].files.length  >=1) {
            document.getElementsByName("sampleFile")[0].value = null;            
        }
    } else {
        $('#ingest-form').css({ "visibility": "hidden" });
        
    }
}