import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { getAccountUniqueName } from "../config/accounts";
import { HelloCdkStackProps } from "../hello-cdk-stack";
import { SYSTEM_NAME } from "../config/commons";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import {
  ManagedPolicy,
  Role,
  ServicePrincipal,
  CompositePrincipal,
  PolicyDocument,
  PolicyStatement,
  Effect,
} from "aws-cdk-lib/aws-iam";
import {
  RestApi,
  EndpointType,
  MethodLoggingLevel,
  LogGroupLogDestination,
  LambdaIntegration,
} from "aws-cdk-lib/aws-apigateway";
import { LogGroup } from "aws-cdk-lib/aws-logs";

export class MoneybookApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: HelloCdkStackProps) {
    super(scope, id, props);

    const lambdaRole = new Role(this, `${SYSTEM_NAME}-lambda-role`, {
      roleName: `${getAccountUniqueName(props.context)}-lambda-role`,
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("lambda.amazonaws.com")
      ),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSLambdaBasicExecutionRole"
        ),
        ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        ManagedPolicy.fromAwsManagedPolicyName("AmazonDynamoDBFullAccess"),
      ],
    });

    // index.py -> lambda_handler
    //
    const createFileFunction = new PythonFunction(
      this,
      `${SYSTEM_NAME}-create-file`,
      {
        functionName: `${getAccountUniqueName(props.context)}-create-file`,
        entry: path.join("C://Users//"USERNAME"/hello-cdk/app/backend/create-file"),//사용자
        index: "create_file.py",
        handler: "lambda_handler",
        runtime: Runtime.PYTHON_3_10,
        role: lambdaRole,
        environment: {
          BUCKET_NAME: props.s3Stack!.bucket.bucketName,
        },
      }
    );

    const addMoneybookFunction = new PythonFunction(
      this,
      `${SYSTEM_NAME}-add-moneybook-item`,
      {
        functionName: `${getAccountUniqueName(
          props.context
        )}-add-moneybook-item`,
        entry: path.join("C://Users//"USERNAME"/hello-cdk/app/backend/add-moneybook-item"), //사용자
        runtime: Runtime.PYTHON_3_10,
        role: lambdaRole,
        index: "index.py", // file name
        handler: "lambda_handler", // function name
        environment: {
          TABLE_NAME: props.dynamoStack!.moneybookTable.tableName,
        },
      }
    );

    const api = new RestApi(this, `${SYSTEM_NAME}-api`, {
      restApiName: `${getAccountUniqueName(props.context)}-moneybook-api`,
      description: "Moneybook Application API",
      deployOptions: {
        stageName: "dev",
        metricsEnabled: true,
        loggingLevel: MethodLoggingLevel.INFO,
        accessLogDestination: new LogGroupLogDestination(
          new LogGroup(
            this,
            `${getAccountUniqueName(props.context)}-api-log-group`,
            {
              logGroupName: `/API-Gateway/${getAccountUniqueName(
                props.context
              )}-moneybook-api`,
              removalPolicy: props.terminationProtection
                ? cdk.RemovalPolicy.RETAIN
                : cdk.RemovalPolicy.DESTROY,
            }
          )
        ),
      },
      endpointTypes: [EndpointType.REGIONAL],
      retainDeployments: props.terminationProtection,
      cloudWatchRole: true,
    });

    const apiKey = api.addApiKey(`${SYSTEM_NAME}-ApiKey`, {
      apiKeyName: `${getAccountUniqueName(props.context)}-ApiKey`,
      description: "Moneybook API Key",
    });

    const usagePlan = api.addUsagePlan(`${SYSTEM_NAME}-UsagePlan`, {
      name: `${getAccountUniqueName(props.context)}-UsagePlan`,
      description: "Moneybook Usage Plan",
      apiStages: [
        {
          api: api,
          stage: api.deploymentStage,
        },
      ],
    });
    usagePlan.addApiKey(apiKey);

    const methodOptions = {
      apiKeyRequired: true,
    };

    const fileResource = api.root.addResource("file");
    fileResource.addMethod(
      "POST",
      new LambdaIntegration(createFileFunction),
      methodOptions
    );

    const moneybookResource = api.root.addResource("moneybook");
    moneybookResource.addMethod(
      "POST",
      new LambdaIntegration(addMoneybookFunction),
      methodOptions
    );
  }
}
