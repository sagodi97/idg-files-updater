const https = require("https");
const msgBuilder = require("./messagesBuilder");

module.exports = {
  //UPLOADS NEW AND UPDATE
  upload: (options, file, dpFilePath) => {
    const req = https.request(options, res => {
      if (res.statusCode != 200) {
        res.on("data", d => {
          process.stdout.write(d);
        });
      } else {
        console.log(`Succesfully set file: ${dpFilePath}`);
      }
    });

    req.on("error", error => {
      if (error.code != "ECONNRESET") {
        console.error(error);
      }
    });

    // use its "timeout" event to abort the request
    req.on("timeout", () => {
      req.abort();
      console.error(`Request to ${options.hostname} timed out after ${options.timeout / 1000} seconds`);
    });

    req.write(msgBuilder.setFile({ base64File: Buffer.from(file).toString("base64"), dpFilePath: dpFilePath }));
    req.end();
  }
};
