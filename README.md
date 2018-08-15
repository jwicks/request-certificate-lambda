# Request Certificate Lambda

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
