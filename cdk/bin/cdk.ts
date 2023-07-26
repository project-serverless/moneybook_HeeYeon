#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { HelloCdkStack } from "../lib/hello-cdk-stack";
import { getAccountUniqueName, getDevAccount } from "../lib/config/accounts";

const app = new cdk.App();

if (process.env.USER !== undefined) {
  const devAccount = getDevAccount(process.env.USER);
  if (devAccount !== undefined) {
    new HelloCdkStack(app, `${getAccountUniqueName(devAccount)}`, {
      env: devAccount,
      context: devAccount,
    });
  }
}

app.synth();
