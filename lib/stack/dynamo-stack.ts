import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { getAccountUniqueName, Account } from "../config/accounts";
import {
  AttributeType,
  BillingMode,
  ITable,
  Table,
} from "aws-cdk-lib/aws-dynamodb";
import { HelloCdkStackProps } from "../hello-cdk-stack";
import { SYSTEM_NAME } from "../config/commons";

export class HelloCdkDynamoStack extends cdk.Stack {
  public moneybookTable: ITable;

  constructor(scope: Construct, id: string, props: HelloCdkStackProps) {
    super(scope, id, props);

    this.moneybookTable = new Table(this, `${SYSTEM_NAME}-moneybook-table`, {
      tableName: `${getAccountUniqueName(props.context)}-moneybook-table`,
      partitionKey: {
        name: "user-id",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "time",
        type: AttributeType.NUMBER,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
    });
  }
}
