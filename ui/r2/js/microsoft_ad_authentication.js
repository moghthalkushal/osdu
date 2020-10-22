/** @file microsoft_ad_authentication.js handles all login operations using microsoft ad apis
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */

/*
 * variables
 */
var userDetails;
var msalConfig = {
    auth: {
        clientId: "4ae99675-03c7-4a5f-9097-05ad6ecce276",//"c7de315a-bce8-4f07-8c69-95e9d3c77292",//"5c3f8f4a-2209-4407-90ff-02e13f23d61a", //"c7de315a-bce8-4f07-8c69-95e9d3c77292"
        authority: "https://login.microsoftonline.com/organizations",
        redirectURI: "https://www.google.com"
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true
    }
};

const graphConfig = {
    graphMeEndpoint: "https://graph.microsoft.com/v1.0/me"
};

const requestObj = {
    scopes: ["user.read"]
};

/*
 * functions
 */

/**

* @brief

* This method returns the microsoft al object to perform active driectory operations

*/

function getMicrosoftLoginObject() {
    return (new Msal.UserAgentApplication(msalConfig));
}

/**

* @brief

* This method is called to iniate a microsoft sign in

*/


//async function signIn() {
//    try {
//        $('#loggingInModal').modal('show');
//        myMSALObj.handleRedirectCallback(authRedirectCallBack);
//        myMSALObj.loginRedirect(requestObj);
//    } catch (error) {
//        console.error(error);
//    }
//}


/**

* @brief

* This method is called when sign in is complete and redirected to our application

*/
async function authRedirectCallBack(error, response) {
    $('#loggingInModal').modal('hide');
    if (error) {
        console.log(error);
    }
}
