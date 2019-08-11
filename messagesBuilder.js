module.exports = {
  setFile: ({ base64File: base64File, dpFilePath: dpFilePath }) => {
    return `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
    <soapenv:Body>
    <dp:request xmlns:dp="http://www.datapower.com/schemas/management">
    <dp:set-file name="${dpFilePath}">
    ${base64File}
    </dp:set-file>
    </dp:request>
    </soapenv:Body>
    </soapenv:Envelope>`;
  },
  getFile: () => ``
};
