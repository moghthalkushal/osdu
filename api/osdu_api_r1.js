const qs = require("querystring");
const axios = require("axios");
const supported_versions = require("../api/osdu_api").supported_versions;
const OsduDetails = require("../api/osdu_api").osdu_configurations;

/**
 * Fetches discovery details of r1
 * POST 
 * {
 *  version : 1 
 * }
 *
 * Response
 * {
 *  "version": 1,
    token: server_in_req/token,
    indexSearch: process.env.PG_OSDU_SEARCH_URL,
    getResources: process.env.PG_OSDU_RESOURCES_URL,
    osdu_instance_version: process.env.PG_OSDU_VERSION,
    osdu_instance_platform: process.env.PG_OSDU_TARGET_PLATFORM
 * }
 * 
 */
const FetchDiscoveryDetails = async (req, res) => {
  const version = "r" + req.body.version;
  const server_details = req.protocol + "://" + req.get("host");
  if (supported_versions[version] && version == process.env.PG_OSDU_VERSION) {
    const discovery_details = {
      version: req.body.version,
      token: server_details + "/token",
      indexSearch: process.env.PG_OSDU_SEARCH_URL,
      getResources: process.env.PG_OSDU_RESOURCES_URL,
      osdu_instance_version: process.env.PG_OSDU_VERSION,
      osdu_instance_platform: process.env.PG_OSDU_TARGET_PLATFORM,
    };
    res.status(200).send(discovery_details);
  } else {
    res.status(404).send("version not supported");
  }
};
/**
 * Fetches Bearer token 
 * Response 
 * 
 * {
    "token_type": "Bearer",
    "expires_in": 3599,
    "ext_expires_in": 3599,
    "access_token": "",
    "osdu_search_url": "OSDU_SEARCH_URL",
    "osdu_getResources_url": "OSDU_GET_RESOURCE_URL","
}
 */
const GetBearerToken = async (req, res) => {
  try {
    const response = await OSDU_API.GetBearerToken(req, res);
    if (response) {
      res.setHeader("Cache-Control", "public, max-age=3599");
      res.setHeader("Expires", new Date(Date.now() + 3599).toUTCString());
      res.status(200).send(response);
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

/**
 * OSDU R1 Index Search Going through our server
 * Request : Authorization mandatory in the header
 * POST BODY : Accepts all the standard OSDU R1 body
 * Response : OSDU R1 Response  
 * */

const IndexSearch = async (req, res) => {
  try {
    if (req.body && req.get("Authorization")) {
      const response = await OSDU_API.IndexSearch(
        req.body,
        req.get("Authorization")
      );
      if (response.status == 200) {
        res.status(200).send(response.data);
      }
    } else {
      res
        .status(403)
        .send("post body or authorization header missing or contact admin");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

/**
 * OSDU R1 GetResources going through our server
 * Request : Authorization mandatory in the header
 * POST BODY : Accepts all the standard OSDU R1 body
 * Response : OSDU R1 Response  
 * */
const GetResources = async (req, res) => {
  try {
    if (req.body && req.get("Authorization")) {
      const response = await OSDU_API.GetResources(
        req.body,
        req.get("Authorization")
      );
      if (response.status == 200) {
        res.status(200).send(response.data);
      }
    } else {
      res
        .status(403)
        .send("post body or authorization header missing or contact admin");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

/**
 * OSDU_API is helps to call the OSDU APIs IndexSearch,GetBearerToken,GetResources
 * OSDU_API methods are called from the routes
 */
class OSDU_API {
  static async GetResources(post_details, authorization) {
    const header = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cache: "default",
        Authorization: authorization,
      },
    };
    try {
      const response = await axios.post(
        OsduDetails.osdu_getResources_url,
        post_details,
        header
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  static async IndexSearch(post_details, authorization) {
    const header = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        cache: "default",
        Authorization: authorization,
      },
    };

    try {
      const response = await axios.post(
        OsduDetails.osdu_search_url,
        post_details,
        header
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  static async GetBearerToken(req, res) {
    const appDetails = OsduDetails;
    const url = appDetails.url;
    const post_body = appDetails.post_body;
    const header = appDetails.header;
    const userName = req.query.userName;
    const osdu_search_url = appDetails.osdu_search_url;
    const osdu_getResources_url = appDetails.osdu_getResources_url;
    post_body.scope = "https://graph.windows.net/.default";

    if (
      !appDetails ||
      !url ||
      !post_body ||
      !osdu_search_url ||
      !osdu_getResources_url ||
      !header
    )
      res.status(403).send("Contact admin , bad request , appId is invalid");

    try {
      const body = qs.stringify(post_body);
      axios
        .post(url, body, header)
        .then(function (response) {
          response.data.osdu_search_url = osdu_search_url;
          response.data.osdu_getResources_url = osdu_getResources_url;
          res.setHeader("Cache-Control", "public, max-age=3599");
          res.setHeader("Expires", new Date(Date.now() + 3599).toUTCString());
          res.status(200).send(response.data);
        })
        .catch(function (error) {
          res.status(500).send("Contact admin , internal server error");
        });
    } catch (e) {
      res.status(500).send("Contact admin , internal server error");
      app_Insights.trackException("exception in GetBearerToken() " + e.message);
    }
  }
}

module.exports.Init = (app) => {
  app.get("/token", GetBearerToken);
  app.get("/osdu/token", GetBearerToken);
  app.post("/r1/indexSearch", IndexSearch);
  app.post("/r1/getResources", GetResources);
  app.post("/discovery", FetchDiscoveryDetails);
};
