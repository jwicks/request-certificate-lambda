# Request Certificate Lambda

This lambda function generates an SSL Certificate Signing Request (CSR) and stores the artifacts (CSR, private key) in AWS Parameter Store. The private key is encrypted using KMS.

## Create a new KMS key

```bash
$ aws kms create-key --description "SSL Cert Requests Parameter Store"
# note the KeyId for the next step
```

## Create the following Lambda IAM Role/Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": "ssm:PutParameter",
      "Resource": "arn:aws:ssm:*:*:parameter/*"
    },
    {
      "Effect": "Allow",
      "Action": "kms:Encrypt",
      "Resource": "arn:aws:kms:*:*:key/*"
    }
  ]
}
```

## Create the Lambda

Upload index.js Lambda code using AWS console or AWS CLI using the following configuration:

- Node.js 8.10
- Define environment variable `KMS_KEY_ID` = the KMS key ID created above
- Timeout 10 sec
- Execution role: Use the IAM role created above

## Invoke Lambda using AWS CLI

```bash
$ aws lambda invoke \
--invocation-type RequestResponse \
--function-name RequestCertificate \
--region us-east-1 \
--log-type Tail \
--payload '{"commonName":"website-dev.tld.com", "organizationUnit":"Web Team", "organization":"Website Inc", "location":"Atlanta", "state":"Georgia", "country":"US"}' \
--profile website-security \
output.txt
```
