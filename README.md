# geolog_osdu
npm install to install all the dependancies

# New versions support
Whenever a new version is added , ensure that , the osdu_api.js supported_version is updated accordinly

# Load the saved image
docker load --input geolog_osdu_node_app.tar

# start the container with the following config

# For GCP
docker run -p  8080:8080 -d  --env-file  .\.env.gcp_r2 geolog_osdu_node_app

# For Azure
docker run -p  8080:8080 -d  --env-file  .\.env.azure_r2 geolog_osdu_node_app

# For Azure r1
docker run -p  8080:8080 -d  --env-file  .\.env.azure_r1 geolog_osdu_node_app


# Easy commands
docker build --no-cache -t  geolog_osdu_node_app .
docker save --output geolog_osdu_node_app.tar geolog_osdu_node_app
docker save --outputdocker save --output C:\Users\kushalk\Downloads\geolog_osdu_r2-ejs\install\geolog_odu_node_app.tar geolog_osdu_node_app:latestgeolog_odu_node_app.tar geolog_osdu_node_app:latest
