/* 

IDGFilesUpdater by Santiago Gonzalez

*/

const https = require("https");
const commander = require("commander");
const path = require("path");
const fs = require("fs");
const dpMessages = require("./messages");

commander
  .option("-H, --host <host ip>", "set host")
  .option("-p, --port [port]", "specify a port", 5550)
  .option("-A, --auth <username:password>", "set the basic authentication")
  .option("-e, --endpoint [endpoint]", "set endpoint other than default (/service/mgmt/current)")
  .option("-f, --file <file>", "specify absolute path of the file to be uploaded")
  .option(
    "-D, --dpg-location [datapower path]",
    "specify location of file in datapower (default is local:/// + selected filename)",
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
var filePath = commander.file;

//var reqMessage = Buffer.from().toString("base64");

if (!host || (!hostRegex.test(host) || !ipRegex.test(host))) {
  console.log("Please specify a valid host (use -H)");
} else if (!auth) {
  console.log("Please provide valid credentials (use -A)");
} else if (!filePath) {
  console.log("Please specify a valid path for the file you want to upload (use -f)");
} else {
  //Validate path and read file
  filePath = path.normalize(filePath);
  fileName = path.parse(filePath).base;

  try {
    file = fs.readFileSync(filePath, { encoding: "utf8" });
  } catch (error) {
    console.error("Problem occured opening the file, please check the path:\n\n" + error);
    return;
  }
}

const options = {
  hostname: host,
  port: port,
  path: endpoint,
  method: "POST",
  rejectUnauthorized: false,
  headers: {
    "Content-Type": "application/xml",
    Authorization: `Basic ${Buffer.from(auth).toString("base64")}`
  }
};

fs.watch(filePath, "utf8", (event, trigger) => {
  if (event === "change") {
    console.log("\n---- FIle has changed! ----");
    console.log(trigger);
    const req = https.request(options, res => {
      if (res.statusCode != 200) {
        res.on("data", d => {
          process.stdout.write(d);
        });
      } else {
        console.log("Todo OK");
      }
    });

    req.on("error", error => {
      console.error(error);
    });

    req.write(dpMessages.setFile({ base64File: Buffer.from(file).toString("base64"), dpFilePath: dpgLocation + fileName }));
    req.end();
  }
});

/*
const req = https.request(options, res => {
  if (res.statusCode != 200) {
    res.on("data", d => {
      process.stdout.write(d);
    });
  } else {
    console.log("Todo OK");
  }
});

req.on("error", error => {
  console.error(error);
});

req.write(dpMessages.setFile({ base64File: Buffer.from(file).toString("base64"), dpFilePath: dpgLocation + fileName }));
req.end();
*/
