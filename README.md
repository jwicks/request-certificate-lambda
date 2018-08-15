# Request Certificate Lambda

This lambda function generate an SSL Certificate Signing Request (CSR) and stores the artifacts (CSR, private key) in AWS Parameter Store.

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

## Required IAM Policy

```
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
        }
    ]
}
```
