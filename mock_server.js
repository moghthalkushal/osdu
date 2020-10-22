const express = require("express");
const bodyParser = require("body-parser");
const expressStaticGzip = require("express-static-gzip");
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
const port = 2222;

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})

const wellbore_details = [
  {
    WellCommonName: "AST-06",
    CurrentOperator: "TNO",
    file: "srn:file/csv:81501414180758687451842:",
    ResourceType: "Wellbore Marker",
    SRN: "srn:master-data/Well:1069:",
    WellboreSRN: "srn:master-data/Wellbore:1069:",
  },
  {
    WellCommonName: "BAR-NE-02-B",
    CurrentOperator: "TNO",
    file: "srn:file/csv:84158184939199:",
    ResourceType: "Wellbore Marker",
    SRN: "srn:master-data/Well:1074:",
    WellboreSRN: "srn:master-data/Wellbore:1074:",
  },
  {
    WellCommonName: "BDM-01",
    CurrentOperator: "TNO",
    file: "srn:file/csv:2794196194492665345256:",
    ResourceType: "Wellbore Marker",
    SRN: "srn:master-data/Well:1076:",
    WellboreSRN: "srn:master-data/Wellbore:1076:",
  },
  {
    WellCommonName: "ANL-01",
    CurrentOperator: "TNO",
    file: "srn:file/csv:37155354044390035065:",
    ResourceType: "Wellbore Marker",
    SRN: "srn:master-data/Well:1057:",
    WellboreSRN: "srn:master-data/Wellbore:1057:",
  },
  {
    WellCommonName: "AND-02",
    CurrentOperator: "TNO",
    file: "srn:file/csv:392060446319890270674:",
    ResourceType: "Wellbore Marker",
    SRN: "srn:master-data/Well:1053:",
    WellboreSRN: "srn:master-data/Wellbore:1053:",
  },
  {
    WellCommonName: "AND-02",
    CurrentOperator: "TNO",
    file: "srn:file/csv:8039015394431599698:",
    ResourceType: "Wellbore Trajectory",
    SRN: "srn:master-data/Well:1053:",
    WellboreSRN: "srn:master-data/Wellbore:1053:",
  },
  {
    WellCommonName: "ANL-01",
    CurrentOperator: "TNO",
    file: "srn:file/csv:98502015496464612:",
    ResourceType: "Wellbore Trajectory",
    SRN: "srn:master-data/Well:1057:",
    WellboreSRN: "srn:master-data/Wellbore:1057:",
  },
  {
    WellCommonName: "AST-06",
    CurrentOperator: "TNO",
    file: "srn:file/csv:06842394972993898326:",
    ResourceType: "Wellbore Trajectory",
    SRN: "srn:master-data/Well:1069:",
    WellboreSRN: "srn:master-data/Wellbore:1069:",
  },
  {
    WellCommonName: "BDM-01",
    CurrentOperator: "TNO",
    file: "srn:file/csv:19215813464327307473888:",
    ResourceType: "Wellbore Trajectory",
    SRN: "srn:master-data/Well:1076:",
    WellboreSRN: "srn:master-data/Wellbore:1076:",
  },
  {
    WellCommonName: "BAR-NE-02-B",
    CurrentOperator: "TNO",
    file: "srn:file/csv:79774221348893529320:",
    ResourceType: "Wellbore Trajectory",
    SRN: "srn:master-data/Well:1074:",
    WellboreSRN: "srn:master-data/Wellbore:1074:",
  },
  {
    WellCommonName: "ANL-01",
    CurrentOperator: "TNO",
    file: "srn:file/las2:71637944791928688486:",
    ResourceType: "Well Log",
    SRN: "srn:master-data/Well:1057:",
    WellboreSRN: "srn:master-data/Wellbore:1057:",
  },
];
const well_details = {
  results: [
    {
      CommonName: "ANL-01",
      CurrentOperator: "srn:master-data/Organisation:TNO:",
      GeoLocation: {
        coordinates: [6.691745, 53.032108],
        type: "point",
      },
      SRN: "srn:master-data/Well:1057:",
      SpudDate: "1964-10-23T00:00:00+0000",
      UWI: "1057",
      WellCommonName: "ANL-01",
      WellLogCount: 1,
      WellSRN: "srn:master-data/Well:1057:",
      WellUWI: "1057",
    },
    {
      CommonName: "AND-02",
      CurrentOperator: "srn:master-data/Organisation:TNO:",
      GeoLocation: {
        coordinates: [5.074358, 51.763095],
        type: "point",
      },
      SRN: "srn:master-data/Well:1053:",
      SpudDate: "1953-01-08T00:00:00+0000",
      UWI: "1053",
      WellCommonName: "AND-02",
      WellLogCount: 1,
      WellSRN: "srn:master-data/Well:1053:",
      WellUWI: "1053",
    },
    {
      CommonName: "AST-01",
      CurrentOperator: "srn:master-data/Organisation:TNO:",
      GeoLocation: {
        coordinates: [5.789685, 51.395795],
        type: "point",
      },
      SRN: "srn:master-data/Well:1069:",
      SpudDate: "1953-06-14T00:00:00+0000",
      UWI: "1069",
      WellCommonName: "AST-01",
      WellLogCount: 1,
      WellSRN: "srn:master-data/Well:1069:",
      WellUWI: "1069",
    },
    {
      CommonName: "BDM-01",
      CurrentOperator: "srn:master-data/Organisation:TNO:",
      GeoLocation: {
        coordinates: [6.565899, 53.300404],
        type: "point",
      },
      SRN: "srn:master-data/Well:1076:",
      SpudDate: "1977-03-07T00:00:00+0000",
      UWI: "1076",
      WellCommonName: "BDM-01",
      WellLogCount: 1,
      WellSRN: "srn:master-data/Well:1076:",
      WellUWI: "1076",
    },
    {
      CommonName: "BAR-NE-02-B",
      CurrentOperator: "srn:master-data/Organisation:TNO:",
      GeoLocation: {
        coordinates: [5.527229, 53.241859],
        type: "point",
      },
      SRN: "srn:master-data/Well:1074:",
      SpudDate: "1970-06-27T00:00:00+0000",
      UWI: "1074",
      WellCommonName: "BAR-NE-02-B",
      WellLogCount: 1,
      WellSRN: "srn:master-data/Well:1074:",
      WellUWI: "1074",
    },
  ],
};
const get_resources_results = {
  UnprocessedSRNs: [],
  Result: [
    {
      Data: {
        GroupTypeProperties: {
          Artefacts: [],
          Files: ["srn:file/las2:8720652654999324723:"],
        },
        IndividualTypeProperties: {
          Description: "Well Log",
          WellboreID: "srn:master-data/Wellbore:7001:",
          BottomMeasuredDepth: {
            UnitOfMeasure: "srn:reference-data/UnitOfMeasure:M:",
            Depth: 2819.5,
          },
          TopMeasuredDepth: {
            UnitOfMeasure: "srn:reference-data/UnitOfMeasure:M:",
            Depth: 2002.7,
          },
          Name: "A12-01 LOG",
          Curves: [
            {
              Mnemonic: "'DEPT'",
              " TopDepth": "2002.7",
              " BaseDepth": "2819.5",
              " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
              " CurveUnit": "'srn:reference-data/UnitOfMeasure:M:'",
            },
            {
              Mnemonic: "'GR'",
              " TopDepth": "2002.7",
              " BaseDepth": "2819.5",
              " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
              " CurveUnit": "'srn:reference-data/UnitOfMeasure:GAPI:'",
            },
            {
              Mnemonic: "'DT'",
              " TopDepth": "2002.7",
              " BaseDepth": "2819.5",
              " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
              " CurveUnit": "'srn:reference-data/UnitOfMeasure:US/F:'",
            },
            {
              Mnemonic: "'RHOB'",
              " TopDepth": "2002.7",
              " BaseDepth": "2819.5",
              " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
              " CurveUnit": "'srn:reference-data/UnitOfMeasure:G/C3:'",
            },
            {
              Mnemonic: "'DRHO'",
              " TopDepth": "2002.7",
              " BaseDepth": "2819.5",
              " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
              " CurveUnit": "'srn:reference-data/UnitOfMeasure:G/C3:'",
            },
            {
              Mnemonic: "'NPHI'",
              " TopDepth": "2002.7",
              " BaseDepth": "2819.5",
              " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
              " CurveUnit": "'srn:reference-data/UnitOfMeasure:V/V:'",
            },
          ],
        },
        ExtensionProperties: {},
      },
      SRN: "srn:work-product-component/WellLog:43877544599900904:",
    },
  ],
};

const index_search_results = {
  results: [
    {
      SRN: "srn:work-product-component/WellLog:073499484228849870876:",
      WellUWI: "1112",
      WellCommonName: "BIR-06 ",
      Description: "Well Log",
      WellboreCommonName: "BIR-06 ",
      Name: "BIR-06 LOG",
      WellUWBI: "1112",
      Curves: [
        {
          Mnemonic: "'DEPT'",
          " TopDepth": "1380.2002",
          " BaseDepth": "3062.9004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:M:'",
        },
        {
          Mnemonic: "'GR'",
          " TopDepth": "1380.6002",
          " BaseDepth": "3056.7004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:GAPI:'",
        },
        {
          Mnemonic: "'DT'",
          " TopDepth": "1550.4002",
          " BaseDepth": "3056.7004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:US/F:'",
        },
        {
          Mnemonic: "'RHOB'",
          " TopDepth": "1405.5002",
          " BaseDepth": "3062.9004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:G/C3:'",
        },
        {
          Mnemonic: "'DRHO'",
          " TopDepth": "1403.4002",
          " BaseDepth": "3062.8004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:G/C3:'",
        },
      ],
    },
    {
      SRN: "srn:work-product-component/WellLog:790923343501399028720:",
      WellUWI: "1125",
      WellCommonName: "BLF-102 ",
      Description: "Well Log",
      WellboreCommonName: "BLF-102 ",
      Name: "BLF-102 LOG",
      WellUWBI: "1125",
      Curves: [
        {
          Mnemonic: "'DEPT'",
          " TopDepth": "15.1002",
          " BaseDepth": "3447.9004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:M:'",
        },
        {
          Mnemonic: "'GR'",
          " TopDepth": "15.2002",
          " BaseDepth": "3445.8004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:GAPI:'",
        },
        {
          Mnemonic: "'DT'",
          " TopDepth": "1240.2003",
          " BaseDepth": "3439.8004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:US/F:'",
        },
        {
          Mnemonic: "'RHOB'",
          " TopDepth": "2546.1002",
          " BaseDepth": "3447.8004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:G/C3:'",
        },
        {
          Mnemonic: "'NPHI'",
          " TopDepth": "2546.1002",
          " BaseDepth": "3445.8004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:V/V:'",
        },
      ],
    },
    {
      SRN: "srn:work-product-component/WellLog:1939209428075963:",
      WellUWI: "1131",
      WellCommonName: "BOL-01 ",
      Description: "Well Log",
      WellboreCommonName: "BOL-01 ",
      Name: "BOL-01 LOG",
      WellUWBI: "1131",
      Curves: [
        {
          Mnemonic: "'DEPT'",
          " TopDepth": "0.0002",
          " BaseDepth": "2988.9004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:M:'",
        },
        {
          Mnemonic: "'GR'",
          " TopDepth": "10.6002",
          " BaseDepth": "2988.9004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:GAPI:'",
        },
        {
          Mnemonic: "'DT'",
          " TopDepth": "300.3002",
          " BaseDepth": "2988.7004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:US/F:'",
        },
        {
          Mnemonic: "'RHOB'",
          " TopDepth": "278.5002",
          " BaseDepth": "2895.4003",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:G/C3:'",
        },
        {
          Mnemonic: "'DRHO'",
          " TopDepth": "278.5002",
          " BaseDepth": "2895.3003",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:G/C3:'",
        },
      ],
    },
    {
      SRN: "srn:work-product-component/WellLog:475732924288217267:",
      WellUWI: "1106",
      WellCommonName: "BIR-01 ",
      Description: "Well Log",
      WellboreCommonName: "BIR-01 ",
      Name: "BIR-01 LOG",
      WellUWBI: "1106",
      Curves: [
        {
          Mnemonic: "'DEPT'",
          " TopDepth": "36.1002",
          " BaseDepth": "3027.9004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:M:'",
        },
        {
          Mnemonic: "'GR'",
          " TopDepth": "396.2002",
          " BaseDepth": "3027.6004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:GAPI:'",
        },
        {
          Mnemonic: "'DT'",
          " TopDepth": "400.2002",
          " BaseDepth": "3027.6004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:US/F:'",
        },
        {
          Mnemonic: "'GNT'",
          " TopDepth": "1203.1003",
          " BaseDepth": "3027.6004",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:CPS:'",
        },
      ],
    },
    {
      SRN: "srn:work-product-component/WellLog:40498805447555393467627108:",
      WellUWI: "1109",
      WellCommonName: "BIR-03 ",
      Description: "Well Log",
      WellboreCommonName: "BIR-03 ",
      Name: "BIR-03 LOG",
      WellUWBI: "1109",
      Curves: [
        {
          Mnemonic: "'DEPT'",
          " TopDepth": "0.1001",
          " BaseDepth": "3055.0",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:M:'",
        },
        {
          Mnemonic: "'GR'",
          " TopDepth": "10.5001",
          " BaseDepth": "3054.5",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:GAPI:'",
        },
        {
          Mnemonic: "'DT'",
          " TopDepth": "284.3001",
          " BaseDepth": "3054.7",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:US/F:'",
        },
        {
          Mnemonic: "'RHOB'",
          " TopDepth": "281.3001",
          " BaseDepth": "3054.5",
          " DepthUnit": "'srn:reference-data/UnitOfMeasure:M:'",
          " CurveUnit": "'srn:reference-data/UnitOfMeasure:G/C3:'",
        },
      ],
    },
  ],
  total_hits: 5,
  facets: {},
  start: 0,
  count: 5,
};

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
      return objectEquals(x[i], y[i]);
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

app.get("/token", async (req, res) => {
  
    res.status(200).send({

      access_token:
        "ya29.a0AfH6SMDRg3amnUaayWJHcEB7hfynZggwUvLZZxtNYzTwJPgNw5CUlVve6uAcf5VynT-y1ikezgE5IEj5uRLKYSuPfk09mg5CC2xO94qLhLH_Pe25YzB_gU9WrJ1Jm0f7PGlG4PjkNZVqX-yahsg0kIIzbNA_qWeoRWI",
      expires_in: 3599,
      scope:
        "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      token_type: "Bearer",
      id_token:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImJjNDk1MzBlMWZmOTA4M2RkNWVlYWEwNmJlMmNlNDM3ZjQ5YzkwNWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NTMyNTkxNjkzMDgtZmFlMms1ZmUzbXJ1ZWdlbzBmdWI1cHJtY2wwcmJ2MmouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NTMyNTkxNjkzMDgtZmFlMms1ZmUzbXJ1ZWdlbzBmdWI1cHJtY2wwcmJ2MmouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTYzNDk3NDczMTYyMjE3MDk4ODUiLCJoZCI6ImNvbW1vbi5vc2R1Lmpvb25peC5uZXQiLCJlbWFpbCI6Im9zZHVfY29tbXVuaXR5QGNvbW1vbi5vc2R1Lmpvb25peC5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IlJWOTZDRW9TOUVVeE85SF9aNFlMb1EiLCJuYW1lIjoiT1NEVSBDb21tdW5pdHkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDUuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1DRWpTMVBNNWhKOC9BQUFBQUFBQUFBSS9BQUFBQUFBQUFBQS9BTVp1dWNta2xQTFhzYUlIZmdlc2dkZ3RBYndjNFZaalR3L3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJPU0RVIiwiZmFtaWx5X25hbWUiOiJDb21tdW5pdHkiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU5OTU0MTg1NiwiZXhwIjoxNTk5NTQ1NDU2fQ.MWCIs2A8WujAztuAzb4y9X7PbwqTcGgab66aAQITnZsqE8fvqdwovNDqIj3zVl-7Q1aeHy8Ew0VMlemgJAiL0_pnAneLcYudl_jhU79-JtpW1LZhnqHSKnPVm4rbmzPCmkZuAwfupEc-XcmBmrRAxRVo5m7jAgLpQJ0663KT20UyqyeGBNBODB6mH_VWwg8C_KJn3YtZkYjPm1ThBEX2Q7drwBKvZ-BOfcvWPV8_zGFouD4R9lS5lSYfvp15e2rIHOHEjnUCJyy4o6dDGt-joGUlW1-EmnLPxbRIGjWS7gRbeUJv8UGTEW7hKc5x4KOovqqOhrDSK6AGsY92ElDGLw",
      osdu_search_url:
        "https://os-search-dot-osdu-sample.appspot.com/api/search/v2/query",
      osdu_getResources_url:
        "https://os-delivery-b3m55ng4la-uc.a.run.app/api/delivery/v2/GetFileSignedUrl",
    });
  
});


app.get("/osdu/token", async (req, res) => {
  if (
    req.get("refesh_token") ==
    "1//0f7xxgb-CoIt6CgYIARAAGA8SNwF-L9IrHaXS-JOvdJxHe45Bi1dvqf2VWhGhpuaxhw2h2ZMfBmLNkzCEBMUAEoHJlNlb2eTYnI8"
  ) {
    res.status(200).send({
      access_token:
        "ya29.a0AfH6SMDRg3amnUaayWJHcEB7hfynZggwUvLZZxtNYzTwJPgNw5CUlVve6uAcf5VynT-y1ikezgE5IEj5uRLKYSuPfk09mg5CC2xO94qLhLH_Pe25YzB_gU9WrJ1Jm0f7PGlG4PjkNZVqX-yahsg0kIIzbNA_qWeoRWI",
      expires_in: 3599,
      scope:
        "openid https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email",
      token_type: "Bearer",
      id_token:
        "eyJhbGciOiJSUzI1NiIsImtpZCI6ImJjNDk1MzBlMWZmOTA4M2RkNWVlYWEwNmJlMmNlNDM3ZjQ5YzkwNWUiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI3NTMyNTkxNjkzMDgtZmFlMms1ZmUzbXJ1ZWdlbzBmdWI1cHJtY2wwcmJ2MmouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI3NTMyNTkxNjkzMDgtZmFlMms1ZmUzbXJ1ZWdlbzBmdWI1cHJtY2wwcmJ2MmouYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTYzNDk3NDczMTYyMjE3MDk4ODUiLCJoZCI6ImNvbW1vbi5vc2R1Lmpvb25peC5uZXQiLCJlbWFpbCI6Im9zZHVfY29tbXVuaXR5QGNvbW1vbi5vc2R1Lmpvb25peC5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IlJWOTZDRW9TOUVVeE85SF9aNFlMb1EiLCJuYW1lIjoiT1NEVSBDb21tdW5pdHkiLCJwaWN0dXJlIjoiaHR0cHM6Ly9saDUuZ29vZ2xldXNlcmNvbnRlbnQuY29tLy1DRWpTMVBNNWhKOC9BQUFBQUFBQUFBSS9BQUFBQUFBQUFBQS9BTVp1dWNta2xQTFhzYUlIZmdlc2dkZ3RBYndjNFZaalR3L3M5Ni1jL3Bob3RvLmpwZyIsImdpdmVuX25hbWUiOiJPU0RVIiwiZmFtaWx5X25hbWUiOiJDb21tdW5pdHkiLCJsb2NhbGUiOiJlbiIsImlhdCI6MTU5OTU0MTg1NiwiZXhwIjoxNTk5NTQ1NDU2fQ.MWCIs2A8WujAztuAzb4y9X7PbwqTcGgab66aAQITnZsqE8fvqdwovNDqIj3zVl-7Q1aeHy8Ew0VMlemgJAiL0_pnAneLcYudl_jhU79-JtpW1LZhnqHSKnPVm4rbmzPCmkZuAwfupEc-XcmBmrRAxRVo5m7jAgLpQJ0663KT20UyqyeGBNBODB6mH_VWwg8C_KJn3YtZkYjPm1ThBEX2Q7drwBKvZ-BOfcvWPV8_zGFouD4R9lS5lSYfvp15e2rIHOHEjnUCJyy4o6dDGt-joGUlW1-EmnLPxbRIGjWS7gRbeUJv8UGTEW7hKc5x4KOovqqOhrDSK6AGsY92ElDGLw",
      osdu_search_url:
        "https://os-search-dot-osdu-sample.appspot.com/api/search/v2/query",
      osdu_getResources_url:
        "https://os-delivery-b3m55ng4la-uc.a.run.app/api/delivery/v2/GetFileSignedUrl",
    });
  }
});

app.get("/login/geolog", async (req, res) => {
  res.status(200).send({
    token_details:
      "K0MgJQJDIh44PiYvD1QpT2pDY29LASEJaFIYeCpadS5pJhEnPXgGPxEgFQFcYgkaFkweeS1DFy4qMzgXIhw1GyMzBxotfSQLGyocLhN7AwMAMgsXCloPX2VUagweZCghPwcAMhMHERkgPgUIHUslBSMRISs+WQ1ACUN+YgVSJAgjEg00C1oiA3JbcDkFA35DMVETJiwHFCAUVgFyDkYTVGQWBBUqYnUPEgJjJ1YAJDsoUAcVCV5wNQUJGQsLVSIpJBcXdBBJIFg+MiMjHFQxCAYsYQUBCANUaVQmLAAIEj4PJwAoO0EOBCA1FAQvWBJVNyY+dTZeNVRlUz5yVWB+WgkOFyE7WBclZVUzLzZwLg8jBjhyPl8sAA8xZxQGWiAoZAZgGBZ9MEB9KDw1Fmk3Jh9XOipcEzo=",
  });
});
app.get("/test", async (req, res) => {
  res.send("Mock Server");
});

app.post("/discovery", async (req, res) => {
  if (req.body.version == 1) {
    res.status(200).send({
      version: 1,
      token: "http://localhost:2222/token",
      login: "http://localhost:2222/login/geolog",
      indexSearch: "http://localhost:2222/r1/indexSearch",
      getResources: "http://localhost:2222/r1/getResources",
      osdu_instance_version: "r2",
      osdu_instance_platform: "gcp",
    });
  } else if (req.body.version == 2) {
    res.status(200).send({
      version: 1,
      token: "http://localhost:2222/token",
      login: "http://localhost:2222/login/geolog",
      indexSearch: "http://localhost:2222/api/search/v2/query",
      getResources: "http://localhost:2222/api/delivery/v2/GetFileSignedUrl",
      osdu_instance_version: "r2",
      osdu_instance_platform: "gcp",
    });
  }
});

app.post("/r1/indexSearch", async (req, res) => {
  if (
    req.get("Authorization") !=
    "Bearer ya29.a0AfH6SMD7S2jwT94wVUNS2bBc1g21cVx1UUmo7XUhKKodeDtvE4txg5nSqcxeveVM3Ee9D995tld9US_FRh_pIipTFDKiU8gGl5Ror952l21Q97YoEa_iPH54aoRAibsgj2Znkm_P5TbkgE4g2XrLw--InurXpKO6hj8"
  )
    res.status(404).send("invalid token");

  const count_set = {
    results: [],
    total_hits: 5,
    facets: {},
    start: 0,
    count: 0,
  };

  if (req.body.fulltext == "*" && req.body.start == 0 && req.body.count == 0) {
    res.status(200).send(count_set);
  } else if (req.body.fulltext == "*" && req.body.count >= 1) {
    res.status(200).send(index_search_results);
  } else {
    res.status(200).send(index_search_results[0]);
  }
});

app.post("/r1/getresources", async (req, res) => {
  if (req.body["SRNS"][0].includes("srn:work-product-component/WellLog")) {
    res.status(200).send(get_resources_results);
  } else if (req.body["SRNS"][0].includes("srn:file/las")) {
    res.status(200).send({
      UnprocessedSRNs: [],
      Result: [
        {
          FileLocation: {
            Bucket: "",
            TemporaryCredentials: {
              SAS: "ada2edada-2",
            },
            EndPoint: req.protocol + "://" + req.get("host") + "/download",
            Key:
              "osdu-sample-osdu-file/r1/data/provided/well-logs/7001_a1201_1971_comp.las",
          },
          Data: {
            GroupTypeProperties: { FileSource: "" },
            IndividualTypeProperties: {},
            ExtensionProperties: {},
          },
          SRN: "srn:file/las2:8720652654999324723:",
        },
      ],
    });
  } else {
    res.status(404).send("bad request");
  }
});

app.get("/download/*", async (req, res) => {
  const file = `${__dirname}/sample.las`;
  res.download(file); // Set disposition and send it.
});

app.get("/initialMapData", async (req, res) => {
  res.status(200).send([{ longitude: 6.691745, latitude: 53.032108 }, 10, 5]);
});

app.get("/WellDetails", async (req, res) => {
  res.status(200).send(well_details);
});

app.get("/InitiateDownload", async (req, res) => {
  let extension;
  if(req.query.fileSRN.includes("las"))
  extension = ".las"
  else
  extension = ".csv";
  res.status(200).send(
    {"fileSRN":req.query.fileSRN,"fileName":"sample"+extension}
  );
});

app.get("/DownloadFile", async (req, res) => {
  let extension;
  if(req.query.fileSRN.includes("las"))
  extension = ".las"
  else
  extension = ".csv";
  
  const file = `${__dirname}/sample${extension}`;
  res.download(file); // Set disposition and send it.
});


app.get("/login", async (req, res) => {
  res.status(200).send(`
<!DOCTYPE html>
<html>
  <script>
      window.localStorage.clear();        
      window.sessionStorage.clear();        
      document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
      localStorage.setItem("pageTour", "initiated");
      localStorage.setItem("first_login", new Date());
      localStorage.setItem("osdu_refresh_token", "1//aad-L9IrAF6AEvuk9YjPuXfafuHaRh1z0VJcI9y8qbxtLy_HGXF4HNwLRSHeQ4JdRdYeb3oMK4I");
      localStorage.setItem("user_name", "Mock User");
      localStorage.setItem("email", "MockEmail@mockmail.com");
      localStorage.setItem("osdu_access_token", "ya29.a0AfH6SMD7S2jwT94wVUNS2bBc1g21cVx1UUmo7XUhKKodeDtvE4txg5nSqcxeveVM3Ee9D995tld9US_FRh_pIipTFDKiU8gGl5Ror952l21Q97YoEa_iPH54aoRAibsgj2Znkm_P5TbkgE4g2XrLw--InurXpKO6hj8");
      localStorage.setItem("osdu_user_access_token", "Bearer ya29.a0AfH6SMD7S2jwT94wVUNS2bBc1g21cVx1UUmo7XUhKKodeDtvE4txg5nSqcxeveVM3Ee9D995tld9US_FRh_pIipTFDKiU8gGl5Ror952l21Q97YoEa_iPH54aoRAibsgj2Znkm_P5TbkgE4g2XrLw--InurXpKO6hj8");
      localStorage.setItem("pageTour", "initiated");    
      window.location.replace(window.location.origin+'/');
  </script>
    <body>
          Signing in .......
    </pre>
  </body></html>`);

});


app.get("/logout", async (req, res) => {
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
});




app.use("/", expressStaticGzip(__dirname + "/ui/r2/"));   

app.post("/WellBoreDetails", async (req, res) => {
  const well_list = req.body.well_list;
  let response = [];
  well_list.forEach(function (well) {    
      wellbore_details.forEach((well_detail) =>{if(well_detail.SRN == well)response.push(well_detail)})    
  });
  res.status(200).send(response);
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
