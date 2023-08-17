import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { MoneyBookCdkS3Stack } from "./stack/s3-stack";
import { MoneybookApiStack } from "./stack/lambda-stack";
import { MoneyBookCdkDynamoStack } from "./stack/dynamo-stack";
import { Account } from "./config/accounts";
import { SYSTEM_NAME } from "./config/commons";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export interface MoneybookStackProps extends cdk.StackProps {
  context: Account;
  s3Stack?: MoneyBookCdkS3Stack;
  dynamoStack?: MoneyBookCdkDynamoStack;
}
export class MoneybookStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: MoneybookStackProps) {
    super(scope, id, props);

    const s3Stack = new MoneyBookCdkS3Stack(
      this,
      `${SYSTEM_NAME}-s3Stack`,
      props
    );
    props.s3Stack = s3Stack;

    const dynamoStack = new MoneyBookCdkDynamoStack(
      this,
      `${SYSTEM_NAME}-dynamoStack`,
      props
    );
    props.dynamoStack = dynamoStack;

    new MoneybookApiStack(this, `${SYSTEM_NAME}-apiStack`, props);
  }
}
