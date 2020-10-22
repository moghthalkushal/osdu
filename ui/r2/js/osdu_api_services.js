/** @file osdu_api_services.js handles all osdu api operations
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */


/*
 * variables
 */

const osdu_token_url = window.location.href.replace("#", "") + "token";
var osdu_search_url;
var osdu_getResources_url;
var completeMAPData;
var bearerToken = "Bearer " +localStorage.getItem("osdu_access_token");
var first_login = new Date(localStorage.getItem("first_login"));
var countOfRestore = 0;


/*
 * functions
 */

async function GetToken(){
    if (!localStorage.getItem("osdu_user_access_token")  || !localStorage.getItem("osdu_refresh_token")) {        
        window.location.replace(`${window.location.origin}/login`);
    }
    
    const now = new Date();
    const diff = Math.round((now.getTime() - first_login.getTime()) / 60000);

    if (diff > 58) {
        return await SetToken();        
    }
    else
        return bearerToken;

}


const  GetGeologURL = async ()=>{
    bearerToken = await GetToken();
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",            
            Authorization: localStorage.getItem('osdu_access_token'),
            UserAuthorization : localStorage.getItem('osdu_user_access_token'),
            "userName":localStorage.getItem('user_name')
        },
    };
    try {

        const fetchResponse = await fetch(window.location.href.replace("#", "") + "link", settings);
        let data = await fetchResponse.text();
        prompt("link valid for 45 mins only \n" + window.location.href.replace("#", "") + data , window.location.href.replace("#", "") + data );

    } catch (e) {

        return null;
    }

}


/**

* @brief

* This method sets the bearer token , so we can communicate to OSDU Servers


*/
const SetToken = async () => {
    //let tokenResponse = await myMSALObj.acquireTokenSilent(requestObj);
    // let userName = myMSALObj.account.userName;
    if (!localStorage.getItem("osdu_user_access_token")  || !localStorage.getItem("osdu_refresh_token")) {        
        window.location.replace(`${window.location.origin}/login`);
    }
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            refresh_token : localStorage.getItem('osdu_refresh_token'),
            
            //Authorization: "Bearer " + tokenResponse.accessToken
        }
    };
    let response = await fetch(osdu_token_url, settings);
   // window.appInsights.trackEvent("Geolog-OSDU", { apiRoute: "GET osdu/token", user_Id: getEmailId() });
    if (response.ok) {
        let json = await response.json();
        bearerToken = "Bearer " + json.access_token;
        localStorage.setItem("osdu_access_token",json.access_token);
        osdu_search_url = json.osdu_search_url;
        osdu_getResources_url = json.osdu_getResources_url;
        return true
    }
    else if (response.status == 403) {
        alert('Contact admin , enviroment vairables not set')
        //window.appInsights.trackEvent("Geolog-OSDU", { apiRoute: "GET osdu/token", error: "enviromnent variables not set" });
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
const GetMapDataforTheCurrentRange = async (start, end) => {
    bearerToken = await GetToken();
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            Authorization: bearerToken
        }
    };
    try {
        var url = new URL(window.location.href.replace("#", "") + "WellDetails")

        var params = {
            "start": start, "end": end
        }
        url.search = new URLSearchParams(params).toString();
        const fetchResponse = await fetch(url, settings);
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
    bearerToken = await GetToken();
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        },
    };
    try {

        const fetchResponse = await fetch(window.location.href.replace("#", "") + "initialMapData", settings);
        let data = await fetchResponse.json();
        if (data.statusCode === 401 && data.message === "Unauthorized. Access token is missing or invalid." && countOfRestore < 1) {
            ++countOfRestore;
            await SetToken(); await GetInitialMapPosition();
        }
        else if (countOfRestore > 1) {
            return null;
        }

        return data;

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
    bearerToken = await GetToken();
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
    bearerToken = await GetToken();
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

const GetSelectedSRNData = async (arrayOfSelectedSRNs, well_details) => {
    let count = 0;
    bearerToken = await GetToken();
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

            "well_details": well_details,
            "well_list": arrayOfSelectedSRNs

        }),
    };
    try {
        let response = await callOSDUAPI(settings, window.location.href.replace("#", "") + "WellBoreDetails");
        let fr = [];
        if (response) {
            let data = [];
            response.forEach((item) => {
                fr.push({
                    WellCommonName: item.WellCommonName,
                    CurrentOperator: item.CurrentOperator,
                    ResourceType: item.ResourceType,
                    SRN: item.SRN,
                    WellboreSRN: item.WellboreSRN,
                    fileName: item.file
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
    bearerToken = await GetToken();
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
    bearerToken = await GetToken();
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


const Download = async (file) => {
    bearerToken = await GetToken();
    const settings = {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            cache: "default",
            "Accept-Encoding": "gzip, deflate, br",
            Connection: "keep-alive",
            Authorization: bearerToken
        }
    };

    try {
        //let response = await fetch(window.location.origin + "osdu/DownloadLinks?fileSRN=" + file, settings);
        const response = await fetch(window.location.href.replace("#", "") + "InitiateDownload?fileSRN=" + file, settings);


        //const s = await response.blob();        
        let fr = [];
        if (response) {

            return await response.json();

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


