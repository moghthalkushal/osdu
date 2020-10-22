/** @file utilities.js utility functions for the web app
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */


/*
 * functions
 */
/**
* @brief
* This method returns the distance between 2 lat long positions , helping us in generating a scaling factor to draw a boundary , where all wells are found.
*/
function distanceBetweenTwoPosition(lat1, lon1, lat2, lon2, unit) {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1 / 180;
		var radlat2 = Math.PI * lat2 / 180;
		var theta = lon1 - lon2;
		var radtheta = Math.PI * theta / 180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180 / Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit == "K") { dist = dist * 1.609344 }
		if (unit == "N") { dist = dist * 0.8684 }
		return dist;
	}
}

/**
* @brief
* This method returns the centre between various lat long coordinates
*/
function centreBetweenGeolocation(coords) {
    if (coords.length === 1) {
        return coords[0];
    }

    let x = 0.0;
    let y = 0.0;
    let z = 0.0;

    for (let coord of coords) {
        let latitude = coord.latitude * Math.PI / 180;
        let longitude = coord.longitude * Math.PI / 180;

        x += Math.cos(latitude) * Math.cos(longitude);
        y += Math.cos(latitude) * Math.sin(longitude);
        z += Math.sin(latitude);
    }

    let total = coords.length;

    x = x / total;
    y = y / total;
    z = z / total;

    let centralLongitude = Math.atan2(y, x);
    let centralSquareRoot = Math.sqrt(x * x + y * y);
    let centralLatitude = Math.atan2(z, centralSquareRoot);

    return {
        latitude: centralLatitude * 180 / Math.PI,
        longitude: centralLongitude * 180 / Math.PI
    };
}

/**

* @brief

* This method gets the url parameter

* @Returs

 * returns the url params

*/
function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
}


/**

* @brief

* This method gets the email from URL param

* @Returs

 * returns the email id if found else a string User (unverified)

*/
function getEmailId() {
    const emailFromParams = getUrlParameter("email");
    const emailFromLocalStorage = localStorage.getItem('userPrincipalName');
    return (emailFromParams) ? emailFromParams : (emailFromLocalStorage) ? emailFromLocalStorage : 'User (unverified)';    
}