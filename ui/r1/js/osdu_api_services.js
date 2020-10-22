/** @file osdu_api_services.js handles all osdu api operations
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */


/*
 * variables
 */

const osdu_token_url = window.location.origin + (!getUrlParameter('appId')) ? "/osdu/token" : "/osdu/token?appId=" + getUrlParameter('appId')  ;
var osdu_search_url;
var osdu_getResources_url;
var completeMAPData;
var bearerToken;
var countOfRestore = 0;

/*
 * functions
 */


/**

* @brief

* This method sets the bearer token , so we can communicate to OSDU Servers


*/
const SetToken = async () => {
    //let tokenResponse = await myMSALObj.acquireTokenSilent(requestObj);
   // let userName = myMSALObj.account.userName;
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            //Authorization: "Bearer " + tokenResponse.accessToken
        }
    };
    let response = await fetch(osdu_token_url, settings);    
    window.appInsights.trackEvent("Geolog-OSDU", { apiRoute: "GET osdu/token", user_Id: getEmailId() });
    if (response.ok) {
        let json = await response.json();
        bearerToken = "Bearer " + json.access_token;
        osdu_search_url = json.osdu_search_url;
        osdu_getResources_url = json.osdu_getResources_url;
        return true
    }
    else if (response.status == 403) {
        alert('Contact admin , enviroment vairables not set')
        window.appInsights.trackEvent("Geolog-OSDU", { apiRoute: "GET osdu/token", error : "enviromnent variables not set" });
        return false;
    }
    else {
        return false;
    }
}



/**

* @brief

* This method gets complete map data to display on the screen

* @Returs

 * returns all the data on success , false on failure

*/
const GetCompleteMapData = async (count) => {
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            "fulltext": "*",
            "start": 0,
            "count": count,
            "full_results": false,
            "map_aggregates": true,

            "metadata": {
                "ResourceType": [
                    "master-data/well"
                ]
            }

        }),
    };
    try {
        const fetchResponse = await fetch(osdu_search_url, settings);
        completeMAPData = await fetchResponse.json();
        return completeMAPData;
    } catch (e) {
        return false;
    }

}


/**

* @brief

* This method gets complete map data to display on the screen

* @Returs

 * returns all the data on success , false on failure

*/
const GetMapDataforTheCurrentRange = async (start, count) => {
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            "fulltext": "*",
            "start": start,
            "count": count,
            "metadata": {
                "ResourceType": ["master-data/well"]
            },
            "sort": [
                {
                    "WellCommonName": { "order": "asc" }
                }],
            "full_results": false,
            "map_aggregates": true
        }),
    };
    try {
        const fetchResponse = await fetch(osdu_search_url, settings);
        completeMAPData = await fetchResponse.json();
        return completeMAPData;
    } catch (e) {
        return false;
    }

}


/**

* @brief

* This method finds the initial start coordinates of the map 

* @Returs

 * returns all the data on success , null  on no data

*/

const GetInitialMapPosition = async () => {

    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            "fulltext": "*",
            "start": 0,
            "count": 0,
            "full_results": false,
            "map_aggregates": true,
            "metadata": {
                "ResourceType": [
                    "master-data/well"
                ]
            }

        }),
    };
    try {

        const fetchResponse = await fetch(osdu_search_url, settings);
        let data = await fetchResponse.json();
        if (data.statusCode === 401 && data.message === "Unauthorized. Access token is missing or invalid." && countOfRestore < 1) {
            ++countOfRestore;
            await SetToken(); await GetInitialMapPosition();
        }
        else if (countOfRestore > 1) {
            return null;
        }

        let interim = [{
            latitude: data.facets.geo_aggregates[0].cell.bounds.top_left.lat,
            longitude: data.facets.geo_aggregates[0].cell.bounds.top_left.lon
        }, {
            latitude: data.facets.geo_aggregates[0].cell.bounds.bottom_right.lat,
            longitude: data.facets.geo_aggregates[0].cell.bounds.bottom_right.lon
        }];
        let temp = []
        temp = [
            centreBetweenGeolocation(interim),
            distanceBetweenTwoPosition(data.facets.geo_aggregates[0].cell.bounds.top_left.lat, data.facets.geo_aggregates[0].cell.bounds.top_left.lon, data.facets.geo_aggregates[0].cell.bounds.bottom_right.lat, data.facets.geo_aggregates[0].cell.bounds.bottom_right.lon), data.total_hits]
        return temp;

    } catch (e) {

        return null;
    }

}

/**

* @brief

* This method gets the current zoom area on the map

* @Returs

 * returns all the data on success , null  on no data

*/
const GetCurrentZoomAreaMap = async (arrayOfGeoLocation) => {
    let count = 0;
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            "fulltext": "*",
            "full_results": false,
            "map_aggregates": true,

            "metadata": {
                "ResourceType": [
                    "master-data/well"
                ]
            },
            "GeoLocation": {
                "type": "Polygon",
                "coordinates": arrayOfGeoLocation
            }
        }),
    };
    try {
        let response = await CallOSDUIndexSearchAPI(settings);
        if (response)
            return response;
        if (response.statusCode === 401 && response.message === "Unauthorized. Access token is missing or invalid." && count < 1) {
            ++count;
            await SetToken(); return await CallOSDUIndexSearchAPI(settings);
        }
        else
            return null;
    } catch (e) {
        return false;
    }

}

/**

* @brief

* This method returns well log data for the given array of SRN , with paging functionality
* @Returs

 * returns all the data on success , null  on no data 

*/
const GetSelectedSRNDataWithPaging = async (arrayOfSelectedSRNs, start, end) => {
    let count = 0;
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            "fulltext": "*",
            "start": start,
            "count": end,
            "full_results": false,
            "metadata": {
                "ResourceType": [
                    "work-product-component/welllog"
                ],
                "WellSRN": arrayOfSelectedSRNs,
                "WellCommonName": { "order": "asc" }
            }
        }),
    };
    try {
        let response = await CallOSDUIndexSearchAPI(settings);
        let fr = [];
        if (response.results) {
            let data = [];
            response.results.forEach((item) => {
                let mnemonics = [];
                let cl = item.Curves.forEach((i) => {
                    mnemonics.push(i.Mnemonic);
                })
                fr.push({
                    WellCommonName: item.WellCommonName,
                    CurrentOperator: item.CurrentOperator.replace('srn:master-data/Organisation:', '').replace(':', ''),
                    ResourceType: item.ResourceType.replace('work-product-component/', ''),
                    SRN: item.SRN,
                    WellboreSRN: item.WellboreSRN,
                    curves: mnemonics.join(',')
                });
            });
            //data.push(fr);
            return fr;
        }

        if (response.statusCode === 401 && response.message === "Unauthorized. Access token is missing or invalid." && count < 1) {
            ++count;
            await SetToken(); return await CallOSDUIndexSearchAPI(settings);
        }
        else
            return null;
    } catch (e) {
        return false;
    }

}

/**

* @brief

* This method returns well log data for the given array of SRN , without paging functionality
* @Returs

 * returns all the data on success , null  on no data

*/

const GetSelectedSRNData = async (arrayOfSelectedSRNs) => {
    let count = 0;
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            "fulltext": "*",
            "start": 0,
            "count": arrayOfSelectedSRNs.length,
            "full_results": false,
            "metadata": {
                "ResourceType": [
                    "work-product-component/welllog"
                ],
                "WellSRN": arrayOfSelectedSRNs
            }
        }),
    };
    try {
        let response = await CallOSDUIndexSearchAPI(settings);
        let fr = [];
        if (response.results) {
            let data = [];
            response.results.forEach((item) => {
                let mnemonics = [];
                let cl = item.Curves.forEach((i) => {
                    mnemonics.push(i.Mnemonic);
                })
                fr.push({
                    WellCommonName: item.WellCommonName,
                    CurrentOperator: item.CurrentOperator.replace('srn:master-data/Organisation:', '').replace(':', ''),
                    ResourceType: item.ResourceType.replace('work-product-component/', ''),
                    SRN: item.SRN,
                    WellboreSRN: item.WellboreSRN,
                    curves: mnemonics.join(',')
                });
            });

            return fr;
        }

        if (response.statusCode === 401 && response.message === "Unauthorized. Access token is missing or invalid." && count < 1) {
            ++count;
            await SetToken(); return await CallOSDUIndexSearchAPI(settings);
        }
        else
            return null;
    } catch (e) {
        return false;
    }

}



const GetWellBoreDetails = async (arrayOfSelectedSRNs) => {
    let count = 0;
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            "fulltext": "*",
            "start": 0,
            "count": arrayOfSelectedSRNs.length,
            "full_results": false,
            "metadata": {
                "ResourceType": [
                    "master-data/wellbore"
                ],
                "WellSRN": arrayOfSelectedSRNs
            }
        }),
    };
    try {
        let response = await CallOSDUIndexSearchAPI(settings);
        let fr = [];
        if (response.results) {
            let data = [];
            response.results.forEach((item) => {
                let mnemonics = [];
                let cl = item.Curves.forEach((i) => {
                    mnemonics.push(i.Mnemonic);
                })
                fr.push({
                    WellCommonName: item.WellCommonName,
                    CurrentOperator: item.CurrentOperator.replace('srn:master-data/Organisation:', '').replace(':', ''),
                    ResourceType: item.ResourceType.replace('work-product-component/', ''),
                    SRN: item.SRN,
                    WellboreSRN: item.WellboreSRN,
                    curves: mnemonics.join(',')
                });
            });

            return fr;
        }

        if (response.statusCode === 401 && response.message === "Unauthorized. Access token is missing or invalid." && count < 1) {
            ++count;
            await SetToken(); return await CallOSDUIndexSearchAPI(settings);
        }
        else
            return null;
    } catch (e) {
        return false;
    }

}


/**

* @brief

* This method calls the OSDU Index search API with the given paramters
* @Returs

 * returns the response on success , null  on no data

*/
async function CallOSDUIndexSearchAPI(settings) {
    try {
        const fetchResponse = await fetch(osdu_search_url, settings);
        let response = await fetchResponse.json();
        return response;
    } catch (e) {
        return null;
    }

}

/**

* @brief

* This method calls any API with the given settings
* @Returs

 * returns the response on success , null  on no data

*/

async function callOSDUAPI(settings, url) {
    try {
        const fetchResponse = await fetch(url, settings);
        let response = await fetchResponse.json();
        return response;
    } catch (e) {
        return null;
    }

}


/**

* @brief

* This method lists all the files for a given SRN
* @Returs

 * returns the list of files on success , null  on no data

*/

const ListOfFilesToDownload = async (fileName) => {

    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            SRNS: fileName
        }).replace(/\\n/g, "\\n")
            .replace(/\\'/g, "\\'")
            .replace(/\\"/g, '\\"')
            .replace(/\\&/g, "\\&")
            .replace(/\\r/g, "\\r")
            .replace(/\\t/g, "\\t")
            .replace(/\\b/g, "\\b")
            .replace(/\\f/g, "\\f"),
    };

    try {
        let response = await callOSDUAPI(settings, osdu_getResources_url);
        let fr = [];
        if (response.Result) {
            return response.Result[0].Data.GroupTypeProperties.Files


        }

        if (response.statusCode === 401 && response.message === "Unauthorized. Access token is missing or invalid." && count < 1) {
            ++count;
            await SetToken(); return await callOSDUAPI(settings, osdu_getResources_url);
        }
        else
            return null;
    } catch (e) {
        return false;
    }

};


/**

* @brief

* This method gets the azure blob url given the filename
* @Returs

 * returns azure blob URL on success , null  on no data

*/


const UrlToDownLoad = async (fileName) => {
    const settings = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        },
        body: JSON.stringify({
            SRNS: fileName
        }),
    };

    try {
        let response = await callOSDUAPI(settings, osdu_getResources_url);
        let fr = [];
        if (response.Result) {

            const endPoint = response.Result[0].FileLocation.EndPoint;
            const bucket = response.Result[0].FileLocation.Bucket;
            const key = response.Result[0].FileLocation.Key;
            const sas = response.Result[0].FileLocation.TemporaryCredentials.SAS
            const downloadLink = endPoint + bucket + "/" + key + "?" + sas;

            return downloadLink;

        }

        if (response.statusCode === 401 && response.message === "Unauthorized. Access token is missing or invalid." && count < 1) {
            ++count;
            await SetToken(); return await callOSDUAPI(settings, osdu_getResources_url);
        }
        else
            return null;
    } catch (e) {
        return false;
    }

};


