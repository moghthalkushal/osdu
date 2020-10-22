/** @file page_operation.js Handles all the operations made on the index.html page
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */
$('#loadingModal').modal('show');

var bar = new ProgressBar.Line(progress_bar, {
    strokeWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    color: '#309c60',
    trailColor: '#eee',
    trailWidth: 1,
    svgStyle: { width: '100%', height: '100%' },
    text: {
        style: {
            // Text color.
            // Default: same as stroke color (options.color)
            color: 'black',
            position: 'absolute',
            right: '0',
            top: '0',
            padding: 0,
            margin: 0,
            transform: null
        },
        autoStyleContainer: true
    },
    from: { color: '#309c60' },
    to: { color: '#0e733b' },
    step: (state, bar) => {
        bar.setText(Math.round(bar.value() * 100) + ' %');
    }
});
   

//const myMSALObj = getMicrosoftLoginObject();

//$('#loggingInModal').modal('hide');
loadPage();



/**
* @brief
* This method checks if the DOM is ready , on ready , loads the map with the necessary data and sets the zoom level and other necessary things
*/

/*
 * functions
 */

/**
* @brief
* This methods triggered when the login is succesful
*/
async function loadPage() {   
    $(document).ready(async function () {     
        
        initializeTable();
        initializeTable(document.getElementById('uploadGrid'),uploadGridOptions);
        document.getElementsByClassName('btn btn-primary toggle-on')[0].className = 'btn btn-primary toggle-on disabled';
        document.getElementsByClassName('btn btn-default active toggle-off')[0].className = 'btn btn-default active toggle-off disabled';
        $('#userName').text(getEmailId());
       // $('#loggingInModal').modal('hide');      
        
            SetToken().then(async function (result) {
                if (result) {
                    setInitialMapContext().then(async function (response) {
                        LoadAllMarkersAsynchronously(response);
                        /// LoadAllMarkers(response)
                        $('#loadingModal').modal('hide');
                    }
                    );
                }
                else {
                    $('#loadingModal').modal('hide');
                    alert("contact admin , something's not right");
                }
                    

            });

            /**
            * @brief
            * This method triggers on a button click download , helps us in downloading files 
            */
            $("#btnDownloadLasFiles").click(function () {
                downloadFiles();
            })        
        
    });
}

/**
* @brief
* This methods triggered when logout button is clicked
*/
//function signOut() {
//    myMSALObj.logout();
//}



/**
* @brief
* This method renders the data table. /  ag-grid 
*/
async function renderDataTable(data) {
    var table = $("#example").DataTable();
    table
        .clear()
        .rows.add(data)
        .draw();

}

/**
* @brief
* This method helps us download files asynchrounously 
*/
async function downloadFiles() {
    if (document.getElementById('btnDownloadLasFiles').getAttribute('data-clicked') == "false") {       

        let rowsSelected = gridOptions.api.getSelectedRows();

        if (rowsSelected.length >= 1) {
            document.getElementById('btnDownloadLasFiles').setAttribute('data-clicked', true);
            $('#divDownload').css({ "visibility": "visible" });
            $('#downloadImg').css({ "visibility": "visible" });
            $('#downloading').css({ "visibility": "visible" });
            $('#downloadCountSpan').text("");

            let downloadCount = 1;

            rowsSelected.forEach(function (item) {
                ListOfFilesToDownload([item.SRN]).then(
                    (fileList) => {
                        fileList.forEach((file) => {
                            UrlToDownLoad([file]).
                                then((downloadLink) => {
                                    fetch(downloadLink)
                                        .then(resp => resp.blob())
                                        .then(blob => {

                                            if (downloadCount == rowsSelected.length) {

                                                $('#downloadImg').css({ "visibility": "hidden" });
                                                $('#downloading').css({ "visibility": "hidden" });
                                                document.getElementById('btnDownloadLasFiles').setAttribute('data-clicked', false);
                                            }

                                            if (navigator.msSaveBlob) {
                                                navigator.msSaveBlob(blob, item.SRN + ".las");
                                            }
                                            else {
                                                let $link = document.createElement("a");
                                                let url = URL.createObjectURL(blob);
                                                $link.setAttribute("target", "_blank");
                                                $link.setAttribute("href", url);
                                                $link.setAttribute("download", item.SRN + ".las");
                                                $link.style.visibility = "hidden";
                                                document.body.appendChild($link);
                                                $link.click();
                                                document.body.removeChild($link);
                                            }
                                            $('#downloadCountSpan').text("Downloaded " + downloadCount++ + "/" + rowsSelected.length);
                                        })
                                        .catch(() => alert('Failed to download contact admin'));
                                })

                        });
                    }
                );
            });
        }
        else
            alert('please select the wells to download the las files');
    }
    else
        alert('please try after current download is complete');
}



$("form").submit(function (evt) {
    evt.preventDefault();
    
   
    if (!uploadGridOptions.api.getSelectedRows().length == 1) {
        alert("Please choose the wellbore by clicking on row to associate your ingest");
        return false;
    }

    if (document.getElementsByName('sampleFile')[0].files.length >= 1) {
        
        var formData = new FormData($(this)[0]);
        $('#ingestStatus').css({ "visibility": "visible" });
        $.ajax({
            url: window.location.origin + '/osdu/upload',
            type: 'POST',
            data: formData,
            async: true,
            cache: false,
            contentType: false,
            enctype: 'multipart/form-data',
            processData: false,
            success: function (response) {
                alert(JSON.stringify(response));
                $('#Job-id-ingest').text(response.jobId);
                $('#ingest-job-details').css({ "visibility": "visible" });
                $('#ingestStatus').css({ "visibility": "hidden" });
                
            }
        });
        return false;
    } else
        alert("No files selected for ingest !")
   
});
