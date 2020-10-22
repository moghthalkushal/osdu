
/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */

/*
 * variables 
 */

 /*
 * Ensure you update supported versions if you are supporting a new version
 */
const supported_versions = {
  r1: true,
  r2: true,
};

/*
 * Reads all the env variables required for the server
 */
const osdu_configurations = {
url: process.env.PG_OSDU_TOKEN_URL,
post_body: {
  grant_type: process.env.PG_OSDU_GRANT_TYPE ,
  client_id: process.env.PG_OSDU_CLIENT_ID, 
  client_secret: process.env.PG_OSDU_SECRET,
},
header: { "Content-Type": " application/x-www-form-urlencoded" },
data_partition_id: process.env.PG_OSDU_DATA_PARTITION_ID || "opendes",
osdu_search_url: process.env.PG_OSDU_SEARCH_URL, 
osdu_getResources_url: process.env.PG_OSDU_RESOURCES_URL, 
};

/**
 * Initialization of the application
 *
 */

function Init (app) {
 if(app && app!=null) 
 {
  Config_Check();
  const version = process.env.PG_OSDU_VERSION;
  const expressStaticGzip = require("express-static-gzip");
  const osdu_api_r1 = require("./osdu_api_r1");
  const osdu_api_r2 = require("./osdu_api_r2");
  const ui = require("../ui/geolog_osdu_ui");

  // Initialize the required server version
  if ( version == "r1" ) {
    osdu_api_r1.Init ( app );
  } else if ( version == "r2" ) {
    osdu_api_r2.Init ( app );
  } else {
     console.log ( "Bad version configuration (" + version +")" );
     process.exit ( 22 );
  }
  ui.Init(app, expressStaticGzip);
}
else
{
  console.log("express not initialized")
  process.exit ( 22 );
}
};

/**
 * Check if all the environment variables are set properly and the necessary configuration
 *
 */
function Config_Check(){
  if (process.env.PG_OSDU_VERSION && supported_versions[process.env.PG_OSDU_VERSION]) {
    if (
      osdu_configurations.url &&
      osdu_configurations.post_body &&
      osdu_configurations.post_body.grant_type &&
      osdu_configurations.post_body.client_id &&
      osdu_configurations.post_body.client_secret &&
      osdu_configurations.data_partition_id &&
      osdu_configurations.osdu_search_url &&
      osdu_configurations.osdu_getResources_url
    ) {
      console.log(
        `started express with  ${process.env.PG_OSDU_TARGET_PLATFORM}  ${process.env.PG_OSDU_VERSION} configuration `
      );
      return osdu_configurations;
    } else {
      console.log("please check your server configuration , ensure nothing is undefined , exiting ......")
      console.log("                                                                                     ")
      console.log(osdu_configurations);
      return process.exit(22);
    }
  } else {
    const version = (process.env.PG_OSDU_VERSION) ? process.env.PG_OSDU_VERSION  + " not supported" : "PG_OSDU_VERSION env not set , please check your serverconfiguration"
    console.log(version);
    console.log("List of Supported Versions");
    console.log(supported_versions);
    process.exit(22);
  }
};

module.exports.Init = Init;
module.exports.supported_versions = supported_versions;
module.exports.osdu_configurations = osdu_configurations
