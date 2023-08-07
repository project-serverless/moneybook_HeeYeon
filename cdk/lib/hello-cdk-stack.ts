import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { HelloCdkS3Stack } from "./stack/s3-stack";
import { MoneybookApiStack } from "./stack/lambda-stack";
import { HelloCdkDynamoStack } from "./stack/dynamo-stack";
import { Account } from "./config/accounts";
import { SYSTEM_NAME } from "./config/commons";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface HelloCdkStackProps extends cdk.StackProps {
  context: Account;
  s3Stack?: HelloCdkS3Stack;
  dynamoStack?: HelloCdkDynamoStack;
}

export class HelloCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HelloCdkStackProps) {
    super(scope, id, props);

    const s3Stack = new HelloCdkS3Stack(this, `${SYSTEM_NAME}-s3Stack`, props);
    props.s3Stack = s3Stack;

    const dynamoStack = new HelloCdkDynamoStack(
      this,
      `${SYSTEM_NAME}-dynamoStack`,
      props
    );
    props.dynamoStack = dynamoStack;

    new MoneybookApiStack(this, `${SYSTEM_NAME}-apiStack`, props);
  }
}
