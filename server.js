/** @file server.js initial server start up file
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */

// Express configuration
const express = require("express");
const app = express();
const compression = require("compression");
const bodyParser = require("body-parser");
app.set("views",(__dirname+ "/ui"));
app.set("view engine", "ejs");
app.use(compression());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());

// Init our server
const osdu_api = require("./api/osdu_api");
osdu_api.Init(app);

// Get the express server running
const PORT = process.env.PG_PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}/`);
});
