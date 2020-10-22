
if (process.env.PG_TESTING_TYPE == "UI") {

  const { spawn } = require("child_process");
  console.log("Staring mock_server ...");

  const mock_server_ui = spawn("node", ["mock_server.js"]);
  const PG_CYPRESS_PATH = process.env.PG_CYPRESS_PATH;

  mock_server_ui.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);
    console.log("starting tests . . . ");
    const child = require("child_process").exec;
    child(`${PG_CYPRESS_PATH} run`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        console.log(`stderr: ${stderr}`);
        console.log(`stdout: ${stdout}`);
        process.exit(0);
      }
      console.log(`stdout: ${stdout}`);
      console.error(`Tests Complete`);
      mock_server_ui.kill();
      process.exit(0);
    });
  });

  mock_server_ui.on("close", (code) => {
    console.log(`child process close all stdio with code ${code}`);
  });

  mock_server_ui.on("exit", (code) => {
    console.log(`child process exited with code ${code}`);
  });
  
} else {
  
  const { spawn } = require("child_process");
  const mock_server = spawn("node", ["mock_osdu_server"]);
  const geolog_server = spawn(
    /^win/.test(process.platform) ? "npm.cmd" : "npm",
    ["run", "mock_geolog"]
  );

  const PG_CYPRESS_PATH = process.env.PG_CYPRESS_PATH;

  mock_server.stdout.on("data", (data) => {
    console.log(`stdout: ${data}`);

    geolog_server.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);

      console.log("starting tests . . . ");
      const child = require("child_process").exec;
      child(`${PG_CYPRESS_PATH} run`, (error, stdout, stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          console.log(`stderr: ${stderr}`);
          console.log(`stdout: ${stdout}`);
          process.exit(0);
        }
        console.log(`stdout: ${stdout}`);

        console.error(`Tests Complete`);
        geolog_server.kill();
        mock_server.kill();
        process.exit(0);
      });
    });

    geolog_server.on("close", (code) => {
      console.log(`geolog_server-started successfully ${code}`);
    });

    geolog_server.on("exit", (code) => {
      console.log(`geolog_server ready ${code}`);
    });
  });

  mock_server.on("close", (code) => {
    console.log(`mock_server-started successfully ${code}`);
  });

  mock_server.on("exit", (code) => {
    console.log(`exit:mock_server running ${code}`);
  });
  
}
