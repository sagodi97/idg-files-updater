/* 
*
*
*
*
IDGFilesUpdater by Santiago Gonzalez
*
*
*
*
*/

const commander = require("commander");
const fs = require("fs");
const soma = require("./soma");
const chokidar = require("chokidar");

commander
  .option("-H, --host <host ip>", "set host")
  .option("-p, --port [port]", "specify a port", 5550)
  .option("-A, --auth <username:password>", "set the basic authentication")
  .option("-e, --endpoint [endpoint]", "set endpoint other than default (/service/mgmt/current)")
  .option(
    "-D, --dpg-location [datapower path]",
    "specify location of directory to upload files in datapower (default is local:///)",
    "local:///"
  )
  .parse(process.argv);

//Host validators
const hostRegex = RegExp("^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]).)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9-]*[A-Za-z0-9])$");
const ipRegex = RegExp("^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$");

const host = commander.host;
const port = commander.port;
const endpoint = commander.endpoint ? commander.endpoint : "/service/mgmt/current";
const auth = commander.auth;
const dpgLocation = commander.dpgLocation;

if (!host || (!hostRegex.test(host) || !ipRegex.test(host))) {
  console.log("Please specify a valid host (use -H)");
  process.exit(1);
} else if (!auth) {
  console.log("Please provide valid credentials (use -A)");
  process.exit(1);
}

//TODO Verify DPG credentials when program starts

const options = {
  hostname: host,
  port: port,
  path: endpoint,
  method: "POST",
  rejectUnauthorized: false,
  headers: {
    "Content-Type": "application/xml",
    Authorization: `Basic ${Buffer.from(auth).toString("base64")}`
  },
  timeout: 3000
};

watcher = chokidar.watch(["**/*.js", "**/*.xsl", "**/*.xml"], { persistent: true, ignoreInitial: true });

watcher
  .on("add", path => {
    console.log(`Add event on ${path}`);
    try {
      file = fs.readFileSync(path, { encoding: "utf8" });
    } catch (error) {
      console.error("Problem occured opening the file:\n\n" + error);
      return;
    }
    soma.upload(options, file, dpgLocation + path);
  })
  .on("change", path => {
    console.log(`Change event on ${path}`);
    try {
      file = fs.readFileSync(path, { encoding: "utf8" });
    } catch (error) {
      console.error("Problem occured opening the file:\n\n" + error);
      return;
    }
    soma.upload(options, file, dpgLocation + path);
  })
  .on("unlink", path => {
    //TODO
    console.log(`File ${path} has been removed`);
  });
