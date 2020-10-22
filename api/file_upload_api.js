/** @file osdu_server.js osdu server file , contains all the routes 
 */

/*
 * Copyright 2006-2019 Emerson Paradigm Holding LLC. All rights reserved.
 */


/*
 * variables
 */
const fs = require('fs');
const fileUpload = require('express-fileupload');
const { v4: uuidv4 } = require('uuid');
const dynamicStatic = require('express-dynamic-static')();
const fs_extra = require('fs-extra');
const FileType = require('file-type');
let app_Insights;


/*
 * functions
 */

/**

* @brief

* This method uploads the file to a specific location

* @Returs

 * returns bearer token on success , 500/internal server errorn on failure

*/

const UploadFiles = async (req, res) => {
    const dir = (uuidv4() + (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().slice(0, 19).replace(/[^0-9]/g, ""));

    try {
        let uploadPath = __dirname + '/../uploads/'

        if (!req.files || Object.keys(req.files).length === 0) {
            res.status(400).send('No files were uploaded.');
            return;
        }

        uploadPath = __dirname + '/../uploads/' + dir
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(uploadPath);
        }

        // res.status(' (200).sendfiles were uploaded.');
        if (req.files && req.files.sampleFile && req.files.sampleFile.length == undefined) {

            req.files.sampleFile.mv((uploadPath + "/" + req.files.sampleFile.name), function (err) {
                if (err) {
                    return res.status(500).send(err);
                }
                (async () => {
                    //console.log(await FileType.fromFile(req.files.sampleFile));
                    //=> {ext: 'png', mime: 'image/png'}
                })();

                res.status(200).send({
                    jobId: dir,
                    message: 'Files uploaded successfuly',
                    ingestStatus: 'running'
                });
            });

        } else if (req.files && req.files.sampleFile && req.files.sampleFile.length > 1) {
            let fileNames = [];
            req.files.sampleFile.forEach((file) => {
                file.mv((uploadPath + "/" + file.name), function (err) {
                    if (err) {
                        return res.status(500).send(err);
                    }
                    fileNames.push(file.name);


                    FileType.fromFile(file).then(function f(r) {
                        console.log(r);
                    })
                });
            })
            res.status(200).send({
                jobId: dir,
                message: 'Files uploaded successfuly',
                ingestStatus: 'running'
            });
        }
    } catch (e) {
        app_Insights.trackException("exception in GetBearerToken() " + e.message);
        res.status(500).send(e);
    }


};

/**

* @brief

* This method deletes all files from uploads folder

* @Returs

 * returns total number of directories deleted from uploads folder

*/
const DeleteFiles = async (req, res) => {
    try {
        let dir = __dirname + '/../uploads/';
        fs.readdir(dir, (err, folders) => {
            folders.forEach((folder) => {
                fs_extra.remove(dir + folder, err => {
                    if (err) return console.error(err)
                })
            })
            res.status(200).send(folders.length + " folders deleted successfully");
        });
    } catch (e) {
        app_Insights.trackException("exception in DeleteFiles() " + e.message);
        res.send(e);
    }


};


/**

* @brief

* This method deletes a specific file from uploads folder

* @Returs

 * returns deleted filename from uploads folder

*/

const DeleteFile = async (req, res) => {
    try {
        let dir = __dirname + '/../uploads/';
        if (req.query.fileName) {
            fs_extra.remove(dir + req.query.fileName, err => {
            if (err) app_Insights.trackException("exception in delete " + err);
        })
            res.status(200).send(req.query.fileName + " deleted");        
        }
        res.status(403).send("bad request , please specify the file name to delete");        
    } catch (e) {
        app_Insights.trackException("exception in DeleteFile() " + e.message);
        res.send(e);
    }


};

/*
 * exports
 */
module.exports.Init = (app, appInsights) => {

    app_Insights = appInsights;
    app.use(dynamicStatic);
    app.use(fileUpload({
        limits: { fileSize: 500 * 1024 * 1024 },
    }));
    app.get('/osdu/viewFiles', (req, res) => {
        const testFolder = __dirname + "/../uploads/" + req.query.fileName;
        const fs = require('fs');
        fs.readdir(testFolder, (err, files) => {
            res.send(files)
        });
    });

    app.post("/osdu/upload", UploadFiles);
    app.delete("/osdu/delete/all", DeleteFiles);
    app.delete("/osdu/delete", DeleteFile);
};
