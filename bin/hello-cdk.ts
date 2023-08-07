#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { HelloCdkStack } from "../lib/hello-cdk-stack";
import { getAccountUniqueName, getDevAccount } from "../lib/config/accounts";
import * as os from "os";

const app = new cdk.App();

let userName = os.userInfo().username;
const devAccount = getDevAccount(userName);

if (devAccount !== undefined) {
  new HelloCdkStack(app, `${getAccountUniqueName(devAccount)}`, {
    env: devAccount,
    context: devAccount,
  });
}

app.synth();
