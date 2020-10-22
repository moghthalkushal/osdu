/*
 * exports
 */

module.exports.Init = (app, express) => {       
    app.use("/", express(__dirname + "/"+ process.env.PG_OSDU_VERSION + "/"));   
};