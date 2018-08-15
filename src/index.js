const util = require("util");
const execAsync = util.promisify(require("child_process").exec);
const fs = require("fs");
const AWS = require("aws-sdk");

exports.handler = async (event, context, callback) => {
  console.log("Creating CSR for parameters:", event);
  const {
    commonName,
    organizationUnit,
    organization,
    location,
    state,
    country
  } = event;

  if (
    !(
      commonName &&
      organizationUnit &&
      organization &&
      location &&
      state &&
      country
    )
  ) {
    return callback(
      new Error(
        "Invalid payload parameters. Please specify: commonName, organizationUnit, organization, location, state, country"
      )
    );
  }

  const command = `mkdir -p /tmp/${commonName}/ && openssl req -new -sha256 -newkey rsa:2048 -nodes \
  -keyout /tmp/${commonName}/${commonName}.key -out /tmp/${commonName}/${commonName}.csr \
  -subj "/CN=${commonName}/OU=${organizationUnit}/O=${organization}/L=${location}/ST=${state}/C=${country}"`;

  await execAsync(command);

  const keyContent = fs.readFileSync(
    `/tmp/${commonName}/${commonName}.key`,
    "utf8"
  );

  const csrContent = fs.readFileSync(
    `/tmp/${commonName}/${commonName}.csr`,
    "utf8"
  );

  const ssm = new AWS.SSM();
  const isoDate = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  // Store the private key in SSM
  await ssm
    .putParameter({
      Name: `${commonName}.${isoDate}.key`,
      Type: "SecureString",
      Value: keyContent
    })
    .promise();

  // Store the CSR in SSM
  await ssm
    .putParameter({
      Name: `${commonName}.${isoDate}.csr`,
      Type: "String",
      Value: csrContent
    })
    .promise();

  // Remove tmp files
  fs.unlinkSync(`/tmp/${commonName}/${commonName}.key`);
  fs.unlinkSync(`/tmp/${commonName}/${commonName}.csr`);

  // Respond with the CSR
  callback(null, csrContent);
};
