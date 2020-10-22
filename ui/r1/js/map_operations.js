/** @file map_operations.js Handles all the operations made on the map , eg. lasso on the map , plotting wells on the map
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */

/*
 * variables
 */
var masterData = [];
var layerFound;
var enableCreateCollection = false;
const toggleLasso = document.querySelector("#toggleLasso");

var map;
var circle;

var markers = L.markerClusterGroup({
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: true,
    zoomToBoundsOnClick: true,
    chunkedLoading: true,
    disableClusteringAtZoom : 13
});

var Icon = L.icon({
    iconUrl: window.location.origin + "/img/icon_well.svg",
    iconSize: [25, 25], // size of the icon    
    iconAnchor: [10, 20], // point of the icon which will correspond to marker's location    
    popupAnchor: [0, -10], // point from which the popup should open relative to the iconAnchor
    className: "selected"
});

var defaultIcon = L.icon({
    iconUrl: window.location.origin + "/img/oil_well.svg",
    iconSize: [30, 30], // size of the icon
    iconAnchor: [10, 20], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -10], // point from which the popup should open relative to the iconAnchor
    className: "selected"
});

var wellLogIcon = L.icon({
    iconUrl: window.location.origin + "/img/well_log_icon.svg",
    iconSize: [30, 30], // size of the icon
    iconAnchor: [10, 20], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -10], // point from which the popup should open relative to the iconAnchor
    className: "selected"
});

/*
 * functions
 */

/**

* @brief

* This method clears all the selected well group from the map

*/


function resetSelectedState() {
    if (layerFound)
        map.removeLayer(layerFound);

    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            if (layer.wellLogCount == 0)
                layer.setIcon(defaultIcon);
            else
                layer.setIcon(wellLogIcon);
        } else if (layer instanceof L.Path) {
            layer.setStyle({ color: "#3388ff" });
        }
    });
}

/**

* @brief

* This method sets the selected the group of well to an icon

*/
async function setSelectedLayers(layers) {
    let arrayOfSelectedPlaces = [];
    let arrayOfSelectedWells = {};

    layers.forEach(function (layer) {
        if (layer._childCount) {
            let children = layer.getAllChildMarkers();
            children.forEach((child) => {
                if (child.SRN) {
                    arrayOfSelectedPlaces.push(child.SRN);
                    arrayOfSelectedWells[child.UWI] = { SRN: child.SRN, WellCommonName: child.WellCommonName, currentOperator: child.currentOperator };                   
                }

            })
        }
        else if (layer.SRN) {
            arrayOfSelectedPlaces.push(layer.SRN);           
            arrayOfSelectedWells[layer .UWI] = { SRN: layer.SRN, WellCommonName: layer.WellCommonName, currentOperator: layer.currentOperator };
        }
            

        if (layer instanceof L.Marker) {            
                layer.setIcon(Icon);
        } else if (layer instanceof L.Path) {
            layer.setStyle({ color: "#ff4620" });
        }
    });


    if (arrayOfSelectedPlaces.length >= 1) {
        $('#selectedListDetails').css({ "visibility": "visible" });
        $('#wellboreDetails').text("0");
        $('#loadingModal').modal('show');
        gridOptions.api.setRowData([]);
        uploadGridOptions.api.setRowData([]);
        

        var tc = Math.ceil(arrayOfSelectedPlaces.length / 400);
        var start = 0;
        var end = (arrayOfSelectedPlaces.length < 400) ? arrayOfSelectedPlaces.length : 400;
        let countOfWellswithData = 0;
        let countOfWellswithWellbore = 0;


        for (let index = 0; index < tc; ++index) {

            if (!(start > arrayOfSelectedPlaces.length)) {
                let data = (start == end) ? arrayOfSelectedPlaces[start - 1] : arrayOfSelectedPlaces.slice(start, end);
               // let response = await GetSelectedSRNData(data);     
                const wellBoreResponse = await GetSelectedSRNData(data);  
                
              //  countOfWellswithData = countOfWellswithData + response.length;
                countOfWellswithWellbore = countOfWellswithWellbore + wellBoreResponse.length;
                $('#selectedListDetails').text(countOfWellswithData + " wells / " + arrayOfSelectedPlaces.length + " selected wells contains well logs")
                $('#wellboreDetails').text(countOfWellswithWellbore + " | Total selected : " + arrayOfSelectedPlaces.length);
                
                $('#selectedListDetails').addClass('loading');
               // drawTable(response);           
                drawTable(wellBoreResponse, uploadGridOptions);
                start = end;
                end = ((start + 400) > arrayOfSelectedPlaces.length) ? (arrayOfSelectedPlaces.length) : start + 400;
            }
        }

        $('#selectedListDetails').removeClass('loading');

        
        

    }
    

}

/**

* @brief

* This method enables lasso control on the map

*/
const enableLasso = async () => {
    const lassoControl = L.control.lasso().addTo(map);
    lassoControl.setOptions({ intersect: false });

    if (!localStorage.getItem("pageTour")) {
        iniatePageTour();
        localStorage.setItem("pageTour", "initiated");
    }    

    
}

/**

* @brief

* This method loads the data on the map , when data points are passed

*/
const loadMarkerOnMap = async (data) => {
    if (data) {
        for (var i = 0; i < data.results.length; i++) {

            L.marker([parseFloat(data.results[i].GeoLocation.coordinates[1]), parseFloat(data.results[i].GeoLocation.coordinates[0])], { icon: defaultIcon })
                .bindPopup(data.results[i].WellCommonName)
                .addTo(map);
        }
    }

}


/**

* @brief

* This method loads all the markers on the map , by calling OSDU API

*/
const LoadAllMarkers = async (count) => {

    let data = await GetCompleteMapData(count);
    let searchData = [];

    var markersLayer = new L.LayerGroup();	//layer contain searched elements

    


    for (var i = 0; i < data.results.length; i++) {

        let m = L.marker([parseFloat(data.results[i].GeoLocation.coordinates[1]), parseFloat(data.results[i].GeoLocation.coordinates[0])], { icon: (data.results[i].WellLogCount > 0) ? wellLogIcon : defaultIcon }, { 'title': data.results[i].WellCommonName })
            .bindPopup(data.results[i].WellCommonName)
        m.SRN = data.results[i].WellSRN;
        m.wellLogCount = data.results[i].WellLogCount
        markers.addLayer(m);     
        

    }
    

    map.addLayer(markers);
   // map.addControl(controlSearch);


    function localDataSearch(text, callResponse) {
        //here can use custom criteria or merge data from multiple layers

        callResponse( data.results);

        return {	//called to stop previous requests on map move
            abort: function () {
                
            }
        };
    }

    map.addControl(new L.Control.Search({ sourceData: localDataSearch, text: 'Color...', position: 'topright' , initial: false,
        zoom: map.getMaxZoom() ,markerLocation: true }));
    map.removeLayer(circle);
    enableLasso();
    


   

}

function localData(text, callResponse) {
    //here can use custom criteria or merge data from multiple layers
   
    callResponse(masterData);

    return {	//called to stop previous requests on map move
        abort: function () {
           
        }
    };
}
/**

* @brief

* This method loads all the markers on the map , by calling OSDU API

*/
const LoadAllMarkersAsynchronously = async (count) => {
    
    var tc = Math.ceil(count / 750);
    var start = 0;
    var end = (count < 750) ? count : 750;
    let oneTimeActivation = true;
    bar.animate(0.01);
    for (let index = 0; index < tc; index++) {

        if (!(start > count)) {

            let data = await GetMapDataforTheCurrentRange(start, 750);
           

           // masterData = masterData.concat(data.results);
            for (var i = 0; i < data.results.length; i++) {

                let m = L.marker([parseFloat(data.results[i].GeoLocation.coordinates[1]), parseFloat(data.results[i].GeoLocation.coordinates[0])], { icon: (data.results[i].WellLogCount > 0) ? wellLogIcon : defaultIcon })
                    .bindPopup(data.results[i].WellCommonName)
                m.SRN = data.results[i].WellSRN;
                m.WellCommonName = data.results[i].WellCommonName;
                m.currentOperator = data.results[i].CurrentOperator.replace('srn:master-data/Organisation:', '').replace(':', '');                    
                m.wellLogCount = data.results[i].WellLogCount
                markers.addLayer(m);
                masterData.push({ "loc": [parseFloat(data.results[i].GeoLocation.coordinates[1]), parseFloat(data.results[i].GeoLocation.coordinates[0])], "title": data.results[i].WellCommonName})
            }
            map.addLayer(markers);
           

            
            start = end;
            end = ((start + 750) > count) ? (count) : start + 750;
            if (oneTimeActivation) {

                map.removeLayer(circle);
                enableLasso();     
                map.addControl(new L.Control.Search({
                    sourceData: localData, text: 'Color...', position: 'topright', initial: false, 
                    zoom: map.getMaxZoom(), 
                    textPlaceholder: "Search by Well Names",
                    hideMarkerOnCollapse :true,
                    marker: {
                       
                        //animate a circle over location found
                        circle: { //draw a circle in location found
                            radius: 25,
                            weight: 3,
                            color: '#e03',
                            stroke: true,
                            fill: false
                        }
                    }
                })
                    );
            }
            oneTimeActivation = false;
            bar.animate(start / count);
        }
    }



}

/**

* @brief

* This method sets the initial zoom and centre of the map 
 
* @Returs
 
 * Total count of Wells available 

*/

const setInitialMapContext = async () => {

    let data = await GetInitialMapPosition();
    if (data == null) return null;
    map = L.map("map").setView([data[0].latitude, data[0].longitude], 5);
    // zsh.addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map).on("load", function () { map.invalidateSize() });

    circle = L.circle([data[0].latitude, data[0].longitude], data[1] * 1000).bindTooltip(data[2] + " wells found , loading begins asynchronously....",
        { permanent: true, direction: "bottmom" }
    ).openTooltip();

    circle.addTo(map);

    //var legend = L.control({ position: "bottomleft", collapsed: true });
    

    //legend.onAdd = function (map) {
    //    var div = L.DomUtil.create("div", "legend");
    //    div.innerHTML += "<h4>Legend</h4>";
    //    div.innerHTML += '<i style="background: rgb(233, 149, 78)"></i><span>Large cluster of oil wells</span><br>';
    //    div.innerHTML += '<i style="background: #e5c940"></i><span>Medium cluster of oil wells</span><br>';
    //    div.innerHTML += '<i style="background: #89d268"></i><span>Small cluster of oil wells</span><br>';
    //    div.innerHTML += '<i class="withoutDataWL" style="background-repeat: no-repeat;"></i><span>Oil Well without well log data</span><br>';
    //    div.innerHTML += '<i class="withDataWL" style="background-repeat: no-repeat;"></i><span>Oil Well with well log data</span><br>';
    //    return div;
    //};

    //legend.addTo(map);

    map.on('zoomend', async function () {
    });

    map.on("lasso.finished", function (event) {
        setSelectedLayers(event.layers);
    });

    map.on("lasso.enabled", function () {
        
        $("#toggleLasso").bootstrapToggle("on");
        resetSelectedState();
        markers.refreshClusters();

    });
    map.on("lasso.disabled", function () {
        $("#toggleLasso").bootstrapToggle("off");
    });


    return data[2];
}


