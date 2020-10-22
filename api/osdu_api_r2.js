const axios = require("axios");
const qs = require("querystring");

const supported_versions = require("../api/osdu_api").supported_versions;
const OsduDetails = require("../api/osdu_api").osdu_configurations;
const helper = require("../api/util");
const auth_scopes = process.env.PG_OSDU_AUTH_SCOPES;
const osdu_target_platform = process.env.PG_OSDU_TARGET_PLATFORM;
const url = require("url");

/**
 * OSDU_API Class has methods to handle HTTP Calls to OSDU R2 APIs
 */
class OSDU_API {
  /**
   * 
   * @param {*} url - gcp/azure/aws OAuth userInfo End point
   * @param {*} authorization - Bearer Token
   * returns for Azure
   * {
    "sub": "",
    "name": "",
    "picture": "",
    "email": ""
    }
    returns these extra fields for gcp
    {  
    "given_name": "OSDU",
    "family_name": "Community",  
    "email_verified": true,
    "locale": "en",
    "hd": "common.osdu.joonix.net"
}
   * 
   */
  static async GetUserDetails(url, authorization) {
    const header = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cache: "default",
        Authorization: authorization,
      },
    };
    try {
      const response = await axios.get(url, header);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * 
   * @param {*} post_details - array of SRNS {	"srns": [] }
   * @param {*} authorization -Bearer token 
   * response file link 
   * eg
   * {
   * "unprocessed": [],
    "processed": [
        "srn:file/csv::" : {
            "signedUrl": 
            "unsignedUrl": 
            "kind": 
        }  
    ],
    
}
   */
  static async GetSignedURL(post_details, authorization) {
    const header = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cache: "default",
        Authorization: authorization,
        "data-partition-id": OsduDetails.data_partition_id,
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

  /**
   * OSDU R2 Index Search
   * @param {*} post_details
   * @param {*} authorization
   * Mandatory Headers : Authorization , data-partition-id
   * Post Body : standard osdu syntax
   * This function uses axios to make the actual http call OSDU_R2 api registered during the server startup
   */
  static async Search(post_details, authorization) {
    const header = {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        cache: "default",
        Authorization: authorization,
        "data-partition-id": OsduDetails.data_partition_id,
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

  /**
   *  Gets OSDU Bearer token from token URL 
   *  If scope are passed in the header , it gets user access token for azure else normal beaer token
   * @param {*} req 
   * @param {*} res       
   * 
   * This function uses axios to make the actual http call OSDU_R2 Token generation api
   */
  static async GetBearerToken(req, res) {
    let appDetails = OsduDetails;
    appDetails.post_body.refresh_token = req.get("refresh_token");
    if (req.get("scope")) appDetails.post_body.scope = req.get("scope");

    const url = appDetails.url;
    const post_body = appDetails.post_body;

    const header = appDetails.header;
    const userName = req.query.userName;
    const osdu_search_url = appDetails.osdu_search_url;
    const osdu_getResources_url = appDetails.osdu_getResources_url;

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

      const response = await axios.post(url, body, header);
      response.data.osdu_search_url = osdu_search_url;
      response.data.osdu_getResources_url = osdu_getResources_url;
      return response.data;
    } catch (e) {
      //app_Insights.trackException("exception in GetBearerToken() " + e.message);
      throw e;
    }
  }
}
/**
 * This Mapper helps in converting a request from 
 * r1 to r2 understandble format 
 * when our node server is connected to r2 instance
 */
const r1_req_to_r2_req_mapper = {
  /*
   ** This method downloads the file
   ** from the URL specified in the
   ** parameters
   */
  //Maps all r1 requests related to index search from r1 to r2
  IndexSearchMapper: async (auth, body) => {
    try {
      const resourceType = body.metadata.ResourceType[0];
      const bearerToken = auth;

      //Check if its a request to get just count of the wells
      if (initial_request_post_body_equal_check(body)) {
        const intial_map_data = await r2_resp_to_r1_resp_mapper.GetMapDataAsR1(
          bearerToken
        );
        if (intial_map_data) return IntialRequestResponseR1(intial_map_data[2]);
        else return initial_requests_response(0);
      }
      //Check if its the second request , i.e getting count for the applied applying filters 
      else if (CountCheck(body) && !body.metadata.SRN) {
        const kind = Get_R2_ResouceType_From_R1(body);
        const query = Query_Generator(body);
        const count = await r2_resp_to_r1_resp_mapper.GetTotalCountAsR1(
          kind,
          bearerToken,
          query
        );
        return count;
      }
      //Check if its the third request , i.e all the matched well logs for the matched filter above
      else if (!CountCheck(body) && !body.metadata.SRN) {
        const query = Query_Generator(body);
        const start = body.start;
        const kind = Get_R2_ResouceType_From_R1(body);
        const end = body.count;
        const response = await r2_resp_to_r1_resp_mapper.GetWellogResponseAsR1(
          kind,
          start,
          end,
          query,
          bearerToken
        );
        return response;
      }
      //Check if its the fourth request , i.e get the selected details of selected SRN after the filters applied
      else if (SearchBySRNCheck(body)) {
        const query = 'data.ResourceID:("' + body.metadata.SRN + '")';
        const start = 0;
        const kind = Get_R2_ResouceType_From_R1(body);
        const end = 1;
        const response = await r2_resp_to_r1_resp_mapper.GetWellogResponseAsR1(
          kind,
          start,
          end,
          query,
          bearerToken
        );
        return response;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
//Maps all r1 requests related to get resources from r1 to r2
  GetResourcesMapper: async (auth, body) => {
    try {
      const bearerToken = auth;

      if (body.SRNS[0].includes("srn:work-product-component/WellLog")) {
        const kind = "opendes:osdu:welllog-wpc:0.2.1";
        const query = 'data.ResourceID:("' + body.SRNS[0] + '")';
        const result = await r2_resp_to_r1_resp_mapper.GetResourcesResponseAsR1_For_WellLog_SRN(
          query,
          bearerToken
        );
        return result;
      } else {
        const result = await r2_resp_to_r1_resp_mapper.GetSignedURLForDownload(
          body.SRNS[0],
          bearerToken
        );
        return result;
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

/**
 * response mapper helps to translate a r2 response to a r1 response
 * when the client is R1 but our node server is running r2 instance of osdu
 */
const r2_resp_to_r1_resp_mapper = {

  /**
   * Helps mapping the first call from the UI app ( which speaks almost r1) - transforms r2 response as r1 
   */
  GetMapDataAsR1: async (token) => {
    try {
    } catch (e) {
      console.error(e);
      throw e;
    }
    const authorization = token;
    const post_details = {
      kind: "opendes:osdu:well-master:0.2.1",
      query: "*",
      limit: 1,
      sort: {
        field: ["Data.IndividualTypeProperties.FacilityName"],
        order: ["ASC"],
      },
      returnedFields: ["data.GeoLocation"],
    };

    const post_details_total_well_count = {
      kind: "opendes:osdu:well-master:0.2.1",
      limit: 1,
      aggregateBy: "kind",
      returnedFields: ["totalcount"],
    };
    const coordinates = await OSDU_API.Search(post_details, authorization);
    const longitutde = coordinates.data.results[0].data["GeoLocation"].lon;
    const lattitude = coordinates.data.results[0].data["GeoLocation"].lat;
    const total_well_count = await OSDU_API.Search(
      post_details_total_well_count,
      authorization
    );
    const inital_map_data = [
      {
        longitude: longitutde,
        latitude: lattitude,
      },
      35,
      total_well_count.data.totalCount,
    ];

    return inital_map_data;
  },

  // Helps getting well data as r1 response from a server running with osdu r2 instance
  
  GetWellDataAsR1: async (authorization, start, end, query) => {
    try {
      const post_details = {
        kind: "opendes:osdu:well-master:0.2.1",
        query: query,
        offset: start,
        limit: end,
        sort: {
          field: ["Data.IndividualTypeProperties.FacilityName"],
          order: ["ASC"],
        },
        returnedFields: [
          "data.ResourceTypeID",
          "data.WellName",
          "data.SpudDate",
          "data.Data.IndividualTypeProperties.DataSourceOrganisationID",
          "data.ResourceID",
          "data.GeoLocation",
          "data.Data.IndividualTypeProperties.FacilityName",
          "data.UWI",
          "data.ResourceID",
          "data.FacilityEvent",
          "data.Data.IndividualTypeProperties.StateProvinceID",
          "data.Data.IndividualTypeProperties.CountryID",
        ],
      };

      let wellDetails = { results: [] };
      const well_details = await OSDU_API.Search(post_details, authorization);
      well_details.data.results.forEach((well) => {
        wellDetails.results.push({
          CommonName: well.data.WellName,
          CurrentOperator:
            well.data["Data.IndividualTypeProperties.DataSourceOrganisationID"],
          GeoLocation: {
            coordinates: [well.data.GeoLocation.lon, well.data.GeoLocation.lat],
            type: "point",
          },
          ResourceType: well.ResourceTypeID,
          SRN: well.data.ResourceID,
          SpudDate: well.data.SpudDate,
          UWI: well.data.UWI,
          WellCommonName: well.data.WellName,
          WellLogCount: 1,
          WellSRN: well.data.ResourceID,
          WellUWI: well.data.UWI,
        });
      });
      return wellDetails;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // This function is used in the UI , the very first call to get the total count of wells available 
  // so it can be fetched asynchronously
  GetTotalCountAsR1: async (kind, authorization, query) => {
    try {
      const post_details = {
        kind: kind,
        query: query,
        limit: 1,
        aggregateBy: "kind",
        returnedFields: ["totalCount"],
      };
      const response = await OSDU_API.Search(post_details, authorization);
      const total_hits = response.data.totalCount
        ? response.data.totalCount
        : 0;
      const r1_response = {
        results: [],
        total_hits: total_hits,
        facets: {},
        start: 0,
        count: 0,
      };
      return r1_response;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // Gets well log details in a R1 understandable format for the UI
  GetWellogResponseAsR1: async (kind, start, end, query, authorization) => {
    try {
      const post_details = {
        kind: kind,
        query: query,
        offset: start,
        limit: end,
        returnedFields: [
          "data.Data.GroupTypeProperties.Files",
          "data.Data.IndividualTypeProperties.Name",
          "data.ResourceID",
          "data.UWI",
          "data.UWBI",
          "data.Curves.Data",
          "totalCount",
        ],
      };
      const response = await OSDU_API.Search(post_details, authorization);
      const total_hits = response.data.totalCount
        ? response.data.totalCount
        : 0;

      var logs_as_r1 = [];
      response.data.results.forEach((well_log) => {
        logs_as_r1.push({
          SRN: well_log.data.ResourceID,
          WellUWI: well_log.data.UWI,
          WellCommonName: well_log.data[
            "Data.IndividualTypeProperties.Name"
          ].replace("LOG", ""),
          Description: "Well Log",
          WellboreCommonName: well_log.data[
            "Data.IndividualTypeProperties.Name"
          ].replace("LOG", ""),
          SRN: well_log.data.ResourceID,
          Name: well_log.data["Data.IndividualTypeProperties.Name"],
          WellUWBI: well_log.data.UWBI,
          Curves: CurvesObjectCreator(well_log.data["Curves.Data"]),
        });
      });

      return {
        results: logs_as_r1,
        total_hits: total_hits,
        facets: {},
        start: 0,
        count: total_hits,
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
// Trajectory , Markers , LAS file downloader helper
  GetResourcesResponseAsR1_For_WellLog_SRN: async (query, authorization) => {
    try {
      const post_details = {
        kind: "opendes:osdu:welllog-wpc:0.2.1",
        query: query,
      };
      const response = await OSDU_API.Search(post_details, authorization);
      if (response.data.results.length >= 1)
      {
        const data =response.data.results[0].data;
        return (r1_response = {
          UnprocessedSRNs: [],
          Result: [
            {
              Data: {
                GroupTypeProperties: {
                  Artefacts: [],
                  Files: [data["Data.GroupTypeProperties.Files"][0]],
                },
                IndividualTypeProperties: {
                  Description: "Well Log",
                  WellboreID: data["Data.IndividualTypeProperties.WellboreID"],
                  BottomMeasuredDepth: {
                    UnitOfMeasure:
                   data[
                        "Data.IndividualTypeProperties.BottomMeasuredDepth.UnitOfMeasure"
                      ],
                    Depth:
                    data[
                        "Data.IndividualTypeProperties.BottomMeasuredDepth.Depth"
                      ],
                  },
                  TopMeasuredDepth: {
                    UnitOfMeasure:
                      data[
                        "Data.IndividualTypeProperties.TopMeasuredDepth.UnitOfMeasure"
                      ],
                    Depth:
                    data[
                        "Data.IndividualTypeProperties.TopMeasuredDepth.Depth"
                      ],
                  },
                  Name:data["Data.IndividualTypeProperties.Name"],
                  Curves: CurvesObjectCreator(data["Curves.Data"]),
                },
                ExtensionProperties: {},
              },
              SRN: data.ResourceID,
            },
          ],
        });
      }
        
      else return null;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  // Trajectory , Markers , LAS file downloader
  GetSignedURLForDownload: async (srn, authorization) => {
    try {
      const post_details = {
        srns: [srn],
      };
      const download_detail = await OSDU_API.GetSignedURL(
        post_details,
        authorization
      );
      const signedUrl = download_detail.data.processed[srn].signedUrl;
      const myURL = new url.URL(signedUrl);
      const endpoint = myURL.origin;
      const SAS = signedUrl.split("?");
      const response = {
        UnprocessedSRNs: [],
        Result: [
          {
            FileLocation: {
              Bucket: "",
              TemporaryCredentials: {
                SAS: SAS[1],
              },
              EndPoint: endpoint,
              Key: url.parse(signedUrl).pathname.substr(1),
            },
            Data: {
              GroupTypeProperties: {
                FileSource: "",
              },
              IndividualTypeProperties: {},
              ExtensionProperties: {},
            },
            SRN: srn,
          },
        ],
      };
      return response;
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

const initial_request_post_body = {
  fulltext: "*",
  start: 0,
  count: 0,
  full_results: false,
  map_aggregates: true,
  metadata: {
    ResourceType: ["master-data/well"],
  },
};

// Designed mainly for geolog , helps to check initial get count request from geolog
const initial_request_post_body_equal_check = function(item){
if(
  initial_request_post_body.fulltext==item.fulltext
  &&initial_request_post_body.start==item.start
  &&initial_request_post_body.count==item.count
  &&initial_request_post_body.full_results==item.full_results
  &&initial_request_post_body.map_aggregates==item.map_aggregates
  &&initial_request_post_body.metadata
  &&initial_request_post_body.metadata.ResourceType==item.metadata.ResourceType
){
  return true;
}
else{
  return false;
}

}

// R2 to R1 curves
const CurvesObjectCreator = (curves_string) => {
  try {
    let curves = [];
    curves_string.forEach((curve) => {
      const split_curve_by_commas = curve.split(",");
      let obj = {};
      split_curve_by_commas.forEach((element) => {
        const split_element_by_equals = element.split("=");

        obj[split_element_by_equals[0]] = split_element_by_equals[1];
      });
      curves.push(obj);
    });

    return curves;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// Check if the search is by SRN
const SearchBySRNCheck = (body) => {
  try {
    if (
      Object.keys(body).length == 5 &&
      body.fulltext == "*" &&
      body.start == 0 &&
      body.count == 1 &&
      body.metadata.SRN &&
      body.metadata.ResourceType == "work-product-component/welllog"
    )
      return true;
    else false;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// Check if the body is formulated for get count
const CountCheck = (body) => {
  try {
    if (body && body.start == 0 && body.count == 0) return true;
    else false;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

//R2 query generator
const Query_Generator = (body) => {
  try {
    let query = [];
    const name_part_query =
      body.metadata.WellCommonName ||
      body.metadata.Name ||
      body.metadata.WellboreCommonName ||
      "";
    name_part_query != ""
      ? query.push(
          "data.Data.IndividualTypeProperties.Name:(" + name_part_query + ")"
        )
      : "";
    const UWI_part_query = body.metadata.WellUWI || "";
    UWI_part_query != "" ? query.push("data.UWI:(" + UWI_part_query + ")") : "";

    const UBWI_part_query = body.metadata.WellUWBI || "";
    UBWI_part_query != ""
      ? query.push("data.UWBI:(" + UBWI_part_query + ")")
      : "";

    const final_query = query.join(" AND ");
    // console.log(final_query);
    return final_query != "" ? final_query : "*";
  } catch (e) {
    console.error(e);
    throw e;
  }
};
// Resource Type Mapper
const Get_R2_ResouceType_From_R1 = (body) => {
  try {
    if (body && body.metadata && body.metadata.ResourceType[0]) {
      switch (body.metadata.ResourceType[0]) {
        case "master-data/well":
          return "opendes:osdu:well-master:0.2.1";
        case "work-product-component/welllog":
          return "opendes:osdu:welllog-wpc:0.2.1";
      }
    }
  } catch (e) {
    console.error(e);
    throw e;
  }
};

// Initial Request 
const IntialRequestResponseR1 = (total_hits) => {
  return {
    results: [],
    total_hits: total_hits,
    facets: {
      geo_aggregates: [
        {
          key: "u",
          doc_count: total_hits,
          cell: {
            bounds: {
              top_left: {
                lat: 55.68101424258202,
                lon: 2.8221196588128805,
              },
              bottom_right: {
                lat: 50.7586526311934,
                lon: 7.20198467373848,
              },
            },
          },
          resource_types: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              {
                key: "master-data/well",
                doc_count: total_hits,
              },
            ],
          },
        },
      ],
    },
    start: 0,
    count: 0,
  };
};
/**
 * Fetches discovery details 
 * @param {*} req 
 * @param {*} res 
 * req.body.version==1
 *  * Response
 * {
 *  "version": 1,
    token: server_in_req/token,
    login: server_in_req/login,
    indexSearch: server_in_req/r1/indexSearch,
    getResources: server_in_req/r1/indexSearch,
    osdu_instance_version: process.env.PG_OSDU_VERSION,
    osdu_instance_platform: process.env.PG_OSDU_TARGET_PLATFORM
 * }
 req.body.version==2
* {
  *  "version": 2,
     token: server_in_req/token,
     login: server_in_req/login,
    indexSearch: process.env.PG_OSDU_SEARCH_URL,
    getResources: process.env.PG_OSDU_RESOURCES_URL,
    osdu_instance_version: process.env.PG_OSDU_VERSION,
    osdu_instance_platform: process.env.PG_OSDU_TARGET_PLATFORM
  * }
  */
const FetchDiscoveryDetails = async (req, res) => {
  const version = "r" + req.body.version;
  const server_details = req.protocol + "://" + req.get("host");

  if (supported_versions[version] && version < process.env.PG_OSDU_VERSION) {
    const discovery_details = {
      version: req.body.version,
      token: server_details + "/token",
      login: server_details + "/login/geolog",
      indexSearch: `${server_details}/${version}/indexSearch`,
      getResources: `${server_details}/${version}/getResources`,
      osdu_instance_version: process.env.PG_OSDU_VERSION,
      osdu_instance_platform: process.env.PG_OSDU_TARGET_PLATFORM,
    };

    res.status(200).send(discovery_details);
  } else if (
    supported_versions[version] &&
    version == process.env.PG_OSDU_VERSION
  ) {
    const discovery_details = {
      version: req.body.version,
      token: server_details + "/token",
      login: server_details + "/login/geolog",
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
// Geolog Login : Marker for login to say login was triggered from geolog and continue the call back flow for geolog
const LoginGeolog = async (req, res) => {
  const port = req.query.port ? req.query.port : 0;
  res.send(`
  <!DOCTYPE html>
  <html>
  <body>
  Signing in .....
  </body>
  <script type="text/javascript">
      window.localStorage.setItem("geolog_login", 'true')       
      window.localStorage.setItem("geolog_port", '${port}')    
      window.location.replace(window.location.origin+'/login');
  </script>
</html>`);
};
// Generates a unique link for the logged in user to call 
// * To be removed in future
const GetGeologLink = async (req, res) => {
  try {
    const client = await helper.clientFactory.getClient();
    const url = client.userinfo_endpoint;
    const response = await OSDU_API.GetUserDetails(
      url,
      req.get("UserAuthorization")
    );

    if (req.get("userName") == response.data.name) {
      const checkIfSameUser = await helper.GetCache(response.data.sub);
      let key = Date.now() + response.data.email;
      if (checkIfSameUser !== null) {
        helper.DeleteCache(checkIfSameUser);
        key = checkIfSameUser;
      }
      await helper.SetCache(response.data.sub, key, 3555);
      const route = key + "/r1";
      await helper.SetCache(key, req.get("Authorization"), 3555);
      console.log(route);
      res.status(200).send(route);
    } else {
      res.status(403).send("invalid user");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * When a R1 client sends search request to a r2 node app , this function helps transforming r1 requests to r2 
 */
const R1_IndexSearch_mapped_to_R2 = async (req, res) => {
  try {
    let key;
    let authorization;
    if (req.get("Authorization")) {
      authorization = req.get("Authorization");
    } else if (req.params.uuid) {
      key = req.params.uuid;
      const token = await helper.GetCache(key);
      if (token == nul) {
        res.status(403).send("Authorization token missing or invalid url ");
      } else authorization = "Bearer " + token;
    }
    const response = await r1_req_to_r2_req_mapper.IndexSearchMapper(
      authorization,
      req.body
    );
    res.status(200).send(response);
  } catch (e) {
    console.error(e);
    res.status(500).send(e);
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * When a R1 client sends get resources request to a r2 node app , this function helps transforming r1 requests to r2 
 */

const R1_GetResources_mapped_to_R2 = async (req, res) => {
  try {
    let key;
    let authorization;

    if (req.get("Authorization")) {
      authorization = req.get("Authorization");
    } else if (req.params.uuid) {
      key = req.params.uuid;
      const token = await helper.GetCache(key);
      if (token == nul) {
        res.status(403).send("Authorization token missing or invalid url ");
      } else authorization = "Bearer " + token;
    }

    const response = await r1_req_to_r2_req_mapper.GetResourcesMapper(
      authorization,
      req.body
    );
    if (response != null) res.status(200).send(response);
    else res.status(404).send("No data found");
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * OSDU R2 Index Search
 */
const IndexSearch = async (req, res) => {
  try {
    if (req.body && req.get("Authorization")) {
      const response = await OSDU_API.Search(
        req.body,
        req.get("Authorization")
      );
      if (response.status == 200) {
        res.status(200).send(response.data);
      }
    } else {
      res.status(403).send("post body or authorization header missing");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * OSDU R2 GetResources
 */
const GetResources = async (req, res) => {
  try {
    if (req.body && req.get("Authorization")) {
      const response = await OSDU_API.GetSignedURL(
        req.body,
        req.get("Authorization")
      );
      if (response.status == 200) {
        res.status(200).send(response.data);
      }
    } else {
      res.status(403).send("post body or authorization header missing");
    }
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};
const Login = async (req, res) => {
  const client = await helper.clientFactory.getClient();
  res.redirect(client.authorizationUrl({ scope: auth_scopes }));
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * Get's the User Info of the logged in user from userInfo endpoint
 * UserAuthorization Token is mandatory
 * The userAuthorization Token is set in the login process and is available in the local storage of the browser
 */
const GetUserDetails = async (req, res) => {
  if (req.get("UserAuthorization")) {
    const client = await helper.clientFactory.getClient();
    const url = client.userinfo_endpoint;
    const response = await OSDU_API.GetUserDetails(
      url,
      req.get("UserAuthorization")
    );
    res.status(200).send(response.data);
  } else {
    res.status(403).send("UserAuthorization header token missing");
  }
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 * Clears all the session and local storages
 * Clears cookies
 * Logs out of the web application 
 */
const Logout = async (req, res) => {
  res.status(200).send(`
  <!DOCTYPE html>
  <html>
		<script>
        window.localStorage.clear();        
        window.sessionStorage.clear();        
        document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
        localStorage.setItem("pageTour", "initiated");
		</script>
			<body>
            Logged out successfully ...			
            <a href="/login"> Click Here to Sign In Again</a>
			</pre>
		</body></html>`);
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * This function gets called when a sucessful login is completed
 * The route to this function is a mandatory field for our server start
 * PG_OSDU_AUTH_REDIRECT_URL is always registered to this function
 * PG_OSDU_AUTH_REDIRECT_URL - is the redirection url after a successful call back
 * The route must be registered with cloud provider , eg. http://ice/osdu/callback must be registered with the cloud provider
 */
const AuthCallback = async (req, res) => {
  try {
    const client = await helper.clientFactory.getClient();
    const params = client.callbackParams(req);
    const data = await client.callback(helper.CALLBACK_URL, params, {});
    let userAccessToken;
    let userInfo;
    if (osdu_target_platform == "azure") {
      req.headers["refresh_token"] = data.refresh_token;
      req.headers["Authorization"] = "Bearer " + data.access_token;
      req.headers["scope"] = "User.Read";
      const response = await OSDU_API.GetBearerToken(req, res);
      userAccessToken = "Bearer " + response.access_token;
      userInfo = await OSDU_API.GetUserDetails(
        client.userinfo_endpoint,
        userAccessToken
      );
      userInfo = userInfo.data;
    } else {
      userAccessToken = "Bearer " + data.access_token;
      userInfo = await client.userinfo(data.access_token);
    }

    const osdu_details = {
      refresh_token: data.refresh_token,
      access_token: data.access_token,
    };

    const encrypted_details = helper.EncryptDecrypt(
      JSON.stringify(osdu_details)
    );
    const base64_encode_encrypted_details = Buffer.from(
      encrypted_details
    ).toString("base64");

    res.render("r2/geolog_login", {
      userName: `'${userInfo.name}'`,
      email: `'${userInfo.email}'`,
      Platform: `'${osdu_target_platform}'`,
      access_token: `'${data.access_token}'`,
      refresh_token: `'${data.refresh_token}'`,
      userAccessToken: `'${userAccessToken}'`,
      osdu_details: `'${base64_encode_encrypted_details}'`,
    });
  } catch (error) {
    console.error(error);
    if (error.code == "ETIMEDOUT") {
      res.status(200).send(`
      <!DOCTYPE html>
      <html>
            <script>
            localStorage.clear();        
            sessionStorage.clear();            
            document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
            localStorage.setItem("pageTour", "initiated");
            </script>
                <body>                		
                <a href="/login">Please Click Here to Sign In Again</a>
                </pre>
            </body></html>`);
    } else
      res
        .status(500)
        .send("Contact Admin , something's not right " + error.message);
  }
};

// Gets Bearer token by calling the method in the class OSDU_API
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

// Initiate the file download process
const IntiateDownload = async (req, res) => {
  try {
    const authorization = req.get("Authorization");
    const post_details = {
      srns: [req.query.fileSRN],
    };
    const download_detail = await OSDU_API.GetSignedURL(
      post_details,
      authorization
    );
    var signedURL = download_detail.data.processed[req.query.fileSRN].signedUrl;
    const unsignedURL = download_detail.data.processed[
      req.query.fileSRN
    ].unsignedUrl.split("/");
    const fileName = unsignedURL[unsignedURL.length - 1];

    helper.SetCache(
      req.query.fileSRN,
      {
        fileName: fileName,
        downloadURL: signedURL,
      },
      600
    );
    const resp = {
      fileSRN: req.query.fileSRN,
      fileName: fileName,
    };

    res.status(200).send(resp);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

// Given a SRN download the file
const DownloadFile = async (req, res) => {
  try {
    const download_detail = await helper.GetCache(req.query.fileSRN);
    if (download_detail != null) {
      const response = await axios({
        method: "get",
        url: download_detail.downloadURL,
        responseType: "stream",
      });
      res.setHeader("content-disposition", "attachment;");
      res.setHeader("Content-Type", "application/octet-stream");
      response.data.pipe(res);
    } else
      res
        .status(403)
        .send(
          "Time Expired : " +
            download_detail.fileName +
            " not allowed to download "
        );
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

// Gets the well bore details
/**
 * 
 * @param {*} req 
 * @param {*} res
 * Response 
 *
 *  [
 * {
  WellCommonName: 
  CurrentOperator: 
  file: file
  ResourceType:          
  SRN: well.SRN,
  WellboreSRN:    
    };
  ]
 */
const GetWellBores = async (req, res) => {
  try {
    const authorization = req.get("Authorization");
    const well_list = req.body.well_list.join('" OR "');
    const selected_well_details = req.body.well_details;
    const post_details = {
      limit: req.body.well_list.length,
      kind: "opendes:osdu:wellbore-master:0.2.1",
      query: 'data.Data.IndividualTypeProperties.WellID:("' + well_list + '")',
    };
    let wellbores = "";
    const list_of_wellbore_ids = await OSDU_API.Search(
      post_details,
      authorization
    );
    list_of_wellbore_ids.data.results.forEach((wellbore) => {
      wellbores += wellbore.data.ResourceID + '" OR "';
    });

    const post_details_wellbore_details = {
      kind: "opendes:osdu:*:0.2.1",
      limit: list_of_wellbore_ids.data.results.length * 3,
      query:
        'data.Data.IndividualTypeProperties.WellboreID:("' + wellbores + '")',
      returnedFields: [
        "data.UWI",
        "data.Data.IndividualTypeProperties.WellboreID",
        "data.Data.GroupTypeProperties.Files",
        "data.Data.IndividualTypeProperties.Name",
        "data.Data.IndividualTypeProperties.Description",
      ],
    };

    const welbore_file_details = await OSDU_API.Search(
      post_details_wellbore_details,
      authorization
    );
    let wellbore_details = [];
    welbore_file_details.data.results.forEach((welbore_file_detail) => {
      const well = selected_well_details[welbore_file_detail.data.UWI];
      welbore_file_detail.data["Data.GroupTypeProperties.Files"].forEach(
        (file) => {
          const wellbore = {
            WellCommonName: well.WellCommonName,
            CurrentOperator: well.currentOperator,
            file: file,
            ResourceType:
              welbore_file_detail.data[
                "Data.IndividualTypeProperties.Description"
              ],
            SRN: well.SRN,
            WellboreSRN:
              welbore_file_detail.data[
                "Data.IndividualTypeProperties.WellboreID"
              ],
          };
          wellbore_details.push(wellbore);
        }
      );
    });
    res.status(200).send(wellbore_details);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};
/**
 * 
 * @param {*} req 
 * @param {*} res 
 * Response e.g
 {
  CommonName: "LIR-38"
  CurrentOperator: "srn:master-data/Organisation:TNO:"
  GeoLocation: {coordinates: [4.224548, 51.984561], type: "point"}
  SRN: "srn:master-data/Well:1553:"
  SpudDate: "1965-07-03T00:00:00+0000"
  UWI: "1553"
  WellCommonName: "LIR-38"
  WellLogCount: 1
  WellSRN: "srn:master-data/Well:1553:"
  WellUWI: "1553"
 }
 */
const GetWellDetails = async (req, res) => {
  try {
    const authorization = req.get("Authorization");
    const wellDetails = await r2_resp_to_r1_resp_mapper.GetWellDataAsR1(
      authorization,
      req.query.start,
      req.query.end,
      "*"
    );
    res.status(200).send(wellDetails);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};
/** 
 *  Get the initial map data when the UI loads
 * Response
 [
   {longitude: 4.224548, latitude: 51.984561}, - centre of the world
    35, -- radius
    4947 -- count
  ]
*/
const GetIntialMapData = async (req, res) => {
  try {
    const authorization = req.get("Authorization");
    const inital_map_data = await r2_resp_to_r1_resp_mapper.GetMapDataAsR1(
      authorization
    );
    res.status(200).send(inital_map_data);
  } catch (e) {
    console.error(e);
    res.status(500).send(e.message);
  }
};

module.exports.OSDU_API = OSDU_API;

//List of API routes supported by r2
module.exports.Init = (app) => {
  app.post("/r2/indexSearch", IndexSearch);
  app.post("/r2/getResources", GetResources);
  app.get("/login/userdetails", GetUserDetails);
  app.get("/login", Login);
  app.get("/logout", Logout);
  app.get("/auth/callback", AuthCallback);
  app.get("/token", GetBearerToken);
  app.get("/initialMapData", GetIntialMapData);
  app.get("/wellDetails", GetWellDetails);
  app.post("/wellboreDetails", GetWellBores);
  app.get("/initiateDownload", IntiateDownload);
  app.get("/downloadFile", DownloadFile);
  app.post("/r1/indexSearch", R1_IndexSearch_mapped_to_R2);
  app.post("/r1/GetResources", R1_GetResources_mapped_to_R2);
  app.post("/:uuid/r1/indexSearch", R1_IndexSearch_mapped_to_R2);
  app.post("/:uuid/r1/GetResources", R1_GetResources_mapped_to_R2);
  app.get("/link", GetGeologLink);
  app.get("/login/geolog", LoginGeolog);
  app.post("/discovery", FetchDiscoveryDetails);
};
