const express = require("express");
const bodyParser = require("body-parser");
const expressStaticGzip = require("express-static-gzip");
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
const port = 2221;

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})


app.post("/token", async (req, res) => {
  const server_details = req.protocol + "://" + req.get("host");
  res.status(200).send({
    token_type: 'Bearer',
    scope: 'email Mail.Read openid profile User.Read',
    expires_in: 3599,
    ext_expires_in: 3599,
    access_token: 'eyJ0eXAiOiJKV1QiLCJub25jZSI6IlEwUFRTNFpWWDBIUVEzTGs3azBOMEl0SVJiNUV0VUduNjI0LXJJQ0lDUU0iLCJhbGciOiJSUzI1NiIsIng1dCI6ImppYk5ia0ZTU2JteFBZck45Q0ZxUms0SzRndyIsImtpZCI6ImppYk5ia0ZTU2JteFBZck45Q0ZxUms0SzRndyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC81ODk3NWZkMy00OTc3LTQ0ZDAtYmVhOC0zN2FmMGJhYWMxMDAvIiwiaWF0IjoxNjAwODM0MDM1LCJuYmYiOjE2MDA4MzQwMzUsImV4cCI6MTYwMDgzNzkzNSwiYWNjdCI6MSwiYWNyIjoiMSIsImFpbyI6IkFVUUF1LzhRQUFBQXI1RWRLaWJaUm5SWFcrRndyTUxtVmMxYUlMQ2NWU0hIREE2QjZ3bnRhWXZ6VEJMVGhiWHEyeE9zTDhpcG0xckkrbldLNkFXMlI5dmxLenFLMXVOejl3PT0iLCJhbHRzZWNpZCI6IjU6OjEwMDMyMDAwN0Y1QzA2NzgiLCJhbXIiOlsicHdkIl0sImFwcF9kaXNwbGF5bmFtZSI6ImFkby1wcm9kLWpud2lqdmZnLW9zZHUtcjItYWQtYXBwIiwiYXBwaWQiOiI3MDAxMDU3Yi02MWQ3LTQ5ZmQtOTdkYS1lYWYyYWY4MjAyMjgiLCJhcHBpZGFjciI6IjEiLCJlbWFpbCI6Imt1c2hhbC5rdW1hckBlbWVyc29uLmNvbSIsImlkcCI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0L2ViMDY5ODVkLTA2Y2EtNGExNy04MWRhLTYyOWFiOTlmNjUwNS8iLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiIxMDMuMTExLjE3OS4xNjAiLCJuYW1lIjoiS3VtYXIsIEt1c2hhbCIsIm9pZCI6IjMzNzBhZTNmLWU5ZDUtNDc5ZS1iOTY1LTVhODdlMjA3MjQ5NiIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwMEMxNjdDNkM5IiwicmgiOiIwLkFUY0EwMS1YV0hkSjBFUy1xRGV2QzZyQkFIc0ZBWERYWWYxSmw5cnE4cS1DQWlnM0FDay4iLCJzY3AiOiJlbWFpbCBNYWlsLlJlYWQgb3BlbmlkIHByb2ZpbGUgVXNlci5SZWFkIiwic2lnbmluX3N0YXRlIjpbImttc2kiXSwic3ViIjoiOS1hcFRtcFFHZ1pnQ3JMSVFMZG9fRkYtUm1mQmExZzRrWFFsREtteXZ5dyIsInRlbmFudF9yZWdpb25fc2NvcGUiOiJOQSIsInRpZCI6IjU4OTc1ZmQzLTQ5NzctNDRkMC1iZWE4LTM3YWYwYmFhYzEwMCIsInVuaXF1ZV9uYW1lIjoia3VzaGFsLmt1bWFyQGVtZXJzb24uY29tIiwidXRpIjoiQkpCQmhEdjFBMENGUFpMMDBtb19BQSIsInZlciI6IjEuMCIsIndpZHMiOlsiMTNiZDFjNzItNmY0YS00ZGNmLTk4NWYtMThkM2I4MGYyMDhhIl0sInhtc19zdCI6eyJzdWIiOiIxeGxzZVA1cXJSczk5TGZmTG96R0VYbmFfTmRHR2ZyLUhRbm1TMzBCYWpVIn0sInhtc190Y2R0IjoxNTcwODA0MjY5fQ.h5SutSuf9-LA-DIp2MbXGwWFWCSzYXpBEw5MmX-6z0xVMws7o30BN1Apf9r-x8_C9PEafVBbJqk31Sls-L8EzYUGT9uqK_xTV6c5F9-uppgf8x5cDBtjSHwNtNGNfJe9mSg6CrInEeqGJgC7PlNCruY222daOq-gJEh6HLtHoViuIX80sCfbhxa7Kj_4UA34Eq4vuIATjCRxK_69QfveNG1aTV_tupduUN68eQQtwwd5DkNNs_6DSFw0jIyrb6dCNgKNLuCaZPH22-Ftde5vElQxSRdeeuJ-kOQzw7-_6wGnJFDw9QKCU_BRV9nAvOs_lRSeLksR_51wsxdu81d29g',
    refresh_token: '0.ATcA01-XWHdJ0ES-qDevC6rBAHsFAXDXYf1Jl9rq8q-CAig3ACk.AgABAAAAAAAGV_bv21oQQ4ROqh0_1-tAAQDs_wIA9P9O3PBDSCKNVb6DeG4E0FzZ14RzPgvNrc3tbAACrsPumr4nBlQi397UtoYo9qS1KLeWlLrRAa5Hkw7ZzTTJ7dVUh-sl4Ios4K6cEZ-nmsMmqYDq2WcefK81uwHsybAtZHdfoACWmK9fzLrKX4brHNNQcDsPfYohpgrJC02o5kTmwAaQBFnxpUbI6sQwFcU6ka-h7qWdBelVi8SCYrI2UoU9BmqmUGrCeqrgva7XGKfxuWt1u3B1os0AvvMWJEYRTPUMJMRYSeIbntw13eNIeMwbMuWkFeXEK4Hq38YrsuM5HBXk7hhCT7CB8SPfMaAz-ox_E8Hbmvg7vtmNB4QfE_tQHjIWpjzckHm9lLUvRIbeAL2XIwsf2TJmhhvWnO33ik1h9Jar0QwcQnyv6-mn0cAWu2C6QzomqDuDnVOv23kUe5CePzkA_c9NAoBR86Qh1IachtvJiKtk4QZm6yFk8S08kRaasepbNQ7MElcuY5HZyJY16c5ILZNu8kfwe0KQZAI1h7cTYyGbrE97lT60oIkKyLFqvYAyXK6FHmowWx4AWkJyCXYX7znn-ZmRZQmUcUISE92ZSCJ8RMAolHkEoXTgwnXZFd-KshleuqIuibVnv_e0QJphfpKbOpZH6GGvquorEzoAdqTt0sXYpOOja9Qb3dCdNYT5xCiVzH7pY6MPKt-xoLRw6Fh7gwrUV3iemzCk1c_MjVhQiNlnimMQJpuQ_dhjOITqJtbTw5FV1WPVKbcJgx-P5Z-D9sJfjDwyndYBjMUn5xcgrgZja709l0JFrTOIyS2sDRI8oi4AJF7Pc8Y16AqgaFtaosmUR1yRbs1rwIYosQuRn59rRSKfa8vjYn2FlMF7dt8oXQmK4BBh0HbWNaLHwojGWjd-VaJaLsZusHypqkdiNLkpF_Rvvuhi5oDFXgmvrI_YdNyzMavQUJ47JoxYISPb442kFuMs-PmCXluBMATiV8vx_q3i3yptOoyHeUGVihbJL_sivURewF7qZPeiBI9hDDM9pIM01iGhNmJMYI-mp_D9G1U3qVG9AstHw8eY5ZJXOGOpfSAd6PJ0NMocxIxBH4zBDUULtT4iUdF8pbQkbKOLjuDl87-GT08ivQ87JvwcSf3QjUmD_mcuuQ',
    id_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImppYk5ia0ZTU2JteFBZck45Q0ZxUms0SzRndyJ9.eyJhdWQiOiI3MDAxMDU3Yi02MWQ3LTQ5ZmQtOTdkYS1lYWYyYWY4MjAyMjgiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNTg5NzVmZDMtNDk3Ny00NGQwLWJlYTgtMzdhZjBiYWFjMTAwL3YyLjAiLCJpYXQiOjE2MDA4MzQwMzUsIm5iZiI6MTYwMDgzNDAzNSwiZXhwIjoxNjAwODM3OTM1LCJhaW8iOiJBVVFBdS84UUFBQUFHK2tYcDNCaHJoVVdsbDJoU2h0R2M4YW9YcmwwUm94RGFXVE92VitHMVNtaEFrUFUrSG5WVkJ0aVQ0MHB4VENEaEJ1VXM2LzkzUys3MXAxY3hnVCt6Zz09IiwiZW1haWwiOiJrdXNoYWwua3VtYXJAZW1lcnNvbi5jb20iLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC9lYjA2OTg1ZC0wNmNhLTRhMTctODFkYS02MjlhYjk5ZjY1MDUvIiwibmFtZSI6Ikt1bWFyLCBLdXNoYWwiLCJvaWQiOiIzMzcwYWUzZi1lOWQ1LTQ3OWUtYjk2NS01YTg3ZTIwNzI0OTYiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJLdXNoYWwuS3VtYXJARW1lcnNvbi5jb20iLCJyaCI6IjAuQVRjQTAxLVhXSGRKMEVTLXFEZXZDNnJCQUhzRkFYRFhZZjFKbDlycThxLUNBaWczQUNrLiIsInN1YiI6IjF4bHNlUDVxclJzOTlMZmZMb3pHRVhuYV9OZEdHZnItSFFubVMzMEJhalUiLCJ0aWQiOiI1ODk3NWZkMy00OTc3LTQ0ZDAtYmVhOC0zN2FmMGJhYWMxMDAiLCJ1dGkiOiJCSkJCaER2MUEwQ0ZQWkwwMG1vX0FBIiwidmVyIjoiMi4wIn0.Y-gSxa-JLetKHYtPc0Po_RpVe3z6V5OmKEO1L1MNfMS2HB4Dx-WlUC_l9akSgDxrfB7AOqsm0s05uVsvVByHqJFXwa8yXAb7za3vc3iv-Q7kpepZksNtWns3VLfXMchTZ5weNB187iKEEWlFufXN_qNSAGrshq5mapSdMiqa7c02RzuUCjFNP7evtbdfFjpz-OKbQ51egUOcxmDNM_59LRFuU5ElZL0D_OLLS95noeWWQ0RPQIn8oNNKro6IM4qw5GnbUzO6T6w9HRaJrTf3ED2EnEnHfiXWvrkbtxdO4iONACROAsMe2lSwbc1qG8op02Wpcz6FFidcsyX2kNQMKA',
    osdu_search_url: server_details+'/query',
    osdu_getResources_url: server_details+'/GetFileSignedURL'
  });
});
const query = async(req,res)=>{
  const first_req = {
    "kind": "opendes:osdu:well-master:0.2.1",
    "query": "*",
    "limit": 1,
    "sort": {
      "field": [
        "Data.IndividualTypeProperties.FacilityName"
      ],
      "order": [
        "ASC"
      ]
    },
    "returnedFields": [
      "data.GeoLocation"
    ]
  }
  const second_req = {
    "kind": "opendes:osdu:well-master:0.2.1",
    "limit": 1,
    "aggregateBy": "kind",
    "returnedFields": [
      "totalcount"
    ]
  }

  const thrid_req = {
    "kind": "opendes:osdu:well-master:0.2.1",
    "query": "*",
    "offset": "0",
    "limit": "750",
    "sort": {
      "field": [
        "Data.IndividualTypeProperties.FacilityName"
      ],
      "order": [
        "ASC"
      ]
    },
    "returnedFields": [
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
      "data.Data.IndividualTypeProperties.CountryID"
    ]
  }
 if( CompareTwoObjects(req.body,first_req))
 {
   res.status(200).send({
    "results": [
      {
        "data": {
          "GeoLocation": {
            "lon": 6.691745,
            "lat": 53.032108
          }
        }
      }
    ],
    "aggregations": null,
    "totalCount": 5
  })
 }
 else if(CompareTwoObjects(second_req, req.body))
 {
   res.status(200).send({
    "results": [
      {}
    ],
    "aggregations": [
      {
        "key": "opendes:osdu:well-master:0.2.1",
        "count": 5
      }
    ],
    "totalCount": 5
  })
 }

 else if(CompareTwoObjects(thrid_req,req.body)){
   res.status(200).send(
    {
      "results": [
        {
          "data": {
            "Data.IndividualTypeProperties.DataSourceOrganisationID": "srn:master-data/Organisation:TNO:",
            "Data.IndividualTypeProperties.FacilityName": "ANL-01",
            "WellName": "ANL-01",
            "Data.IndividualTypeProperties.CountryID": "srn:master-data/GeopoliticalEntity:Netherlands:",
            "ResourceID": "srn:master-data/Well:1057:",
            "UWI": "1057",
            "Data.IndividualTypeProperties.StateProvinceID": "srn:master-data/GeopoliticalEntity:Drenthe:",
            "ResourceTypeID": "srn:type:master-data/Well:",
            "FacilityEvent": [
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:SPUD:', EffectiveDateTime='1964-10-23T00:00:00'",
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:DRILLING FINISH:', EffectiveDateTime='1965-01-26T00:00:00'"
            ],
            "GeoLocation": {
              "lon": 6.691745,
              "lat": 53.032108
            },
            "SpudDate": "1964-10-23T00:00:00+0000"
          }
        },
        {
          "data": {
            "Data.IndividualTypeProperties.DataSourceOrganisationID": "srn:master-data/Organisation:TNO:",
            "Data.IndividualTypeProperties.FacilityName": "AND-02",
            "WellName": "AND-02",
            "Data.IndividualTypeProperties.CountryID": "srn:master-data/GeopoliticalEntity:Netherlands:",
            "ResourceID": "srn:master-data/Well:1053:",
            "UWI": "1053",
            "Data.IndividualTypeProperties.StateProvinceID": "srn:master-data/GeopoliticalEntity:Noord-Brabant:",
            "ResourceTypeID": "srn:type:master-data/Well:",
            "FacilityEvent": [
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:SPUD:', EffectiveDateTime='1953-01-08T00:00:00'",
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:DRILLING FINISH:', EffectiveDateTime='1954-05-27T00:00:00'"
            ],
            "GeoLocation": {
              "lon": 5.074358,
              "lat": 51.763095
            },
            "SpudDate": "1953-01-08T00:00:00+0000"
          }
        },
        {
          "data": {
            "Data.IndividualTypeProperties.DataSourceOrganisationID": "srn:master-data/Organisation:TNO:",
            "Data.IndividualTypeProperties.FacilityName": "AST-01",
            "WellName": "AST-01",
            "Data.IndividualTypeProperties.CountryID": "srn:master-data/GeopoliticalEntity:Netherlands:",
            "ResourceID": "srn:master-data/Well:1069:",
            "UWI": "1069",
            "Data.IndividualTypeProperties.StateProvinceID": "srn:master-data/GeopoliticalEntity:Noord-Brabant:",
            "ResourceTypeID": "srn:type:master-data/Well:",
            "FacilityEvent": [
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:SPUD:', EffectiveDateTime='1953-06-14T00:00:00'",
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:DRILLING FINISH:', EffectiveDateTime='1953-10-25T00:00:00'"
            ],
            "GeoLocation": {
              "lon": 5.789685,
              "lat": 51.395795
            },
            "SpudDate": "1953-06-14T00:00:00+0000"
          }
        },
        {
          "data": {
            "Data.IndividualTypeProperties.DataSourceOrganisationID": "srn:master-data/Organisation:TNO:",
            "Data.IndividualTypeProperties.FacilityName": "BDM-01",
            "WellName": "BDM-01",
            "Data.IndividualTypeProperties.CountryID": "srn:master-data/GeopoliticalEntity:Netherlands:",
            "ResourceID": "srn:master-data/Well:1076:",
            "UWI": "1076",
            "Data.IndividualTypeProperties.StateProvinceID": "srn:master-data/GeopoliticalEntity:Groningen:",
            "ResourceTypeID": "srn:type:master-data/Well:",
            "FacilityEvent": [
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:SPUD:', EffectiveDateTime='1977-03-07T00:00:00'",
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:DRILLING FINISH:', EffectiveDateTime='1977-05-13T00:00:00'"
            ],
            "GeoLocation": {
              "lon": 6.565899,
              "lat": 53.300404
            },
            "SpudDate": "1977-03-07T00:00:00+0000"
          }
        },
        {
          "data": {
            "Data.IndividualTypeProperties.DataSourceOrganisationID": "srn:master-data/Organisation:TNO:",
            "Data.IndividualTypeProperties.FacilityName": "BAR-NE-02-B",
            "WellName": "BAR-NE-02-B",
            "Data.IndividualTypeProperties.CountryID": "srn:master-data/GeopoliticalEntity:Netherlands:",
            "ResourceID": "srn:master-data/Well:1074:",
            "UWI": "1074",
            "Data.IndividualTypeProperties.StateProvinceID": "srn:master-data/GeopoliticalEntity:Friesland:",
            "ResourceTypeID": "srn:type:master-data/Well:",
            "FacilityEvent": [
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:SPUD:', EffectiveDateTime='1970-06-27T00:00:00'",
              "FacilityEventTypeID='srn:reference-data/FacilityEventType:DRILLING FINISH:', EffectiveDateTime='1970-09-30T00:00:00'"
            ],
            "GeoLocation": {
              "lon": 5.527229,
              "lat": 53.241859
            },
            "SpudDate": "1970-06-27T00:00:00+0000"
          }
        },    
      ],
      "aggregations": null,
      "totalCount": 5
    
    }
   )
 }
 else {
   res.status(200).send({
    "results": [
      {
        "data": {
          "Data.IndividualTypeProperties.WellboreID": "srn:master-data/Wellbore:1057:",
          "Data.GroupTypeProperties.Files": [
            "srn:file/csv:281818440176162626:"
          ],
          "UWI": "1057",
          "Data.IndividualTypeProperties.Description": "Wellbore Trajectory",
          "Data.IndividualTypeProperties.Name": "1057.csv"
        }
      },
      {
        "data": {
          "Data.IndividualTypeProperties.WellboreID": "srn:master-data/Wellbore:1057:",
          "Data.GroupTypeProperties.Files": [
            "srn:file/csv:310789948571696851:"
          ],
          "UWI": "1057",
          "Data.IndividualTypeProperties.Description": "Wellbore Marker",
          "Data.IndividualTypeProperties.Name": "1057.csv"
        }
      },
      {
        "data": {
          "Data.IndividualTypeProperties.WellboreID": "srn:master-data/Wellbore:1057:",
          "Data.GroupTypeProperties.Files": [
            "srn:file/las2:0062430484635524009:"
          ],
          "UWI": "1057",
          "Data.IndividualTypeProperties.Description": "Well Log",
          "Data.IndividualTypeProperties.Name": "ANL-01 LOG"
        }
      }
    ],
    "aggregations": null,
    "totalCount": 3
  })
 }
}

const GetFileSignedURL = async(req,res)=>{
  const body = req.body.srns[0]
  
  let extension;
  if(body.includes("las"))
  extension = ".las"
  else
  extension = ".csv";
const a = `srn:file/${extension}:0062430484635524009:`
const server_details = req.protocol + "://" + req.get("host");

const processed = `{
"${body}" : {
    "signedUrl": "${server_details}/Download?fileSRN=sample${extension}",
    "unsignedUrl":  "${server_details}/sample${extension}",
    "kind": "opendes:osdu:file:0.2.0"
  }
}`
//console.log(processed)
  res.status(200).send(
    {
      "unprocessed": [],
      "processed": JSON.parse(processed)
    }
  )
}

app.get("/Download", async (req, res) => {
  let extension;
  if(req.query.fileSRN.includes("las"))
  extension = ".las"
  else
  extension = ".csv";
  
  const file = `${__dirname}/sample${extension}`;
  res.download(file); // Set disposition and send it.
});

app.post("/query",query)
app.post("/GetFileSignedURL",GetFileSignedURL)

function CompareTwoObjects(x, y) {
  "use strict";

  if (x === null || x === undefined || y === null || y === undefined) {
    return x === y;
  }
  // after this just checking type of one would be enough
  if (x.constructor !== y.constructor) {
    return false;
  }
  // if they are functions, they should exactly refer to same one (because of closures)
  if (x instanceof Function) {
    return x === y;
  }
  // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
  if (x instanceof RegExp) {
    return x === y;
  }
  if (x === y || x.valueOf() === y.valueOf()) {
    return true;
  }
  if (Array.isArray(x) && x.length !== y.length) {
    return false;
  }

  // if they are dates, they must had equal valueOf
  if (x instanceof Date) {
    return false;
  }

  // if they are strictly equal, they both need to be object at least
  if (!(x instanceof Object)) {
    return false;
  }
  if (!(y instanceof Object)) {
    return false;
  }

  // recursive object equality check
  var p = Object.keys(x);
  return (
    Object.keys(y).every(function (i) {
      return p.indexOf(i) !== -1;
    }) &&
    p.every(function (i) {
      return CompareTwoObjects(x[i], y[i]);
    })
  );
}
function EncryptDecrypt(input) {
  var key = ["P", "a", "R", "@", "d", "1", "G", "m"];
  var output = [];

  for (var i = 0; i < input.length; i++) {
    var charCode = input.charCodeAt(i) ^ key[i % key.length].charCodeAt(0);
    output.push(String.fromCharCode(charCode));
  }
  return output.join("");
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
