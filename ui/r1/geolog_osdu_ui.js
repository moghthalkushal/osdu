/*
 * exports
 */

module.exports.Init = (app, express) => {
    app.use("/", express(__dirname + "/"));
};