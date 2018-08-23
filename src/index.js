const util = require("util");
const exec = require("child_process").exec;
const fs = require("fs");
const AWS = require("aws-sdk");

function execPromise(command) {
  return new Promise(function(resolve, reject) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }

      resolve(stdout.trim());
    });
  });
}

exports.handler = async (event, context, callback) => {
  if (!process.env.KMS_KEY_ID) {
    throw new ReferenceError("Missing environment variable KMS_KEY_ID");
  }
  const kmsKeyId = process.env.KMS_KEY_ID;

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

  const version = await execPromise("openssl version");
  console.log("openssl version:", version);

  const command = `mkdir -p /tmp/${commonName}/ && openssl req -new -sha256 -newkey rsa:2048 -nodes \
  -keyout /tmp/${commonName}/${commonName}.key -out /tmp/${commonName}/${commonName}.csr \
  -subj "/CN=${commonName}/OU=${organizationUnit}/O=${organization}/L=${location}/ST=${state}/C=${country}"`;

  await execPromise(command);

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

  try {
    // Store the private key in SSM
    await ssm
      .putParameter({
        Name: `${commonName}.${isoDate}.key`,
        Type: "SecureString",
        Value: keyContent,
        KeyId: kmsKeyId
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
  } catch (err) {
    console.error("Error while storing SSL artifacts in SSM", err);
    throw err; // raise error so that Lambda fails
  } finally {
    try {
      // Remove tmp files
      fs.unlinkSync(`/tmp/${commonName}/${commonName}.key`);
      fs.unlinkSync(`/tmp/${commonName}/${commonName}.csr`);
    } catch (err) {}
  }

  // Respond with the CSR
  callback(null, csrContent);
};
