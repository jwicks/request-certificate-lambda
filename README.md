# Request Certificate Lambda

This lambda function generates an SSL Certificate Signing Request (CSR) and stores the artifacts (CSR, private key) in AWS Parameter Store. The private key is encrypted using KMS.

## Create a new KMS key

```bash
$ aws kms create-key --description "SSL Cert Requests Parameter Store"
# note the KeyId for the next step
```

## Invoke Lambda using AWS CLI

```bash
$ aws lambda invoke \
--invocation-type RequestResponse \
--function-name RequestCertificate \
--region us-east-1 \
--log-type Tail \
--payload '{"commonName":"website-dev.tld.com", "organizationUnit":"Web Team", "organization":"Website Inc", "location":"Atlanta", "state":"Georgia", "country":"US", "kmsKeyId": "abcd1234..."}' \
--profile website-security \
output.txt
```

## Required IAM Policy

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
