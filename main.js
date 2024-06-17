// @ts-check

import core from "@actions/core";
import { createAppAuth } from "@octokit/auth-app";

import { main } from "./lib/main.js";
import request from "./lib/request.js";

if (!process.env.GITHUB_REPOSITORY) {
  throw new Error("GITHUB_REPOSITORY missing, must be set to '<owner>/<repo>'");
}

if (!process.env.GITHUB_REPOSITORY_OWNER) {
  throw new Error("GITHUB_REPOSITORY_OWNER missing, must be set to '<owner>'");
}

const appId = core.getInput("app-id") || core.getInput("app_id");
if (!appId) {
  // The 'app_id' input was previously required, but it and 'app-id' are both optional now, until the former is removed. Still, we want to ensure that at least one of them is set.
  throw new Error("Input required and not supplied: app-id");
}

var privateKey = core.getInput("private-key") || core.getInput("private_key");

const checkBase64 = core.getInput("check-base64");

if (checkBase64 == 'true') {
  const base64Regex = new RegExp('^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$');
  if (base64Regex.test(privateKey)) {
    core.info(
      `Base64 Detected, decoding private key`
    );
    privateKey = Buffer.from(privateKey, 'base64').toString('utf-8')
  }
}

if (!privateKey) {
  // The 'private_key' input was previously required, but it and 'private-key' are both optional now, until the former is removed. Still, we want to ensure that at least one of them is set.
  throw new Error("Input required and not supplied: private-key");
}



const owner = core.getInput("owner");
const repositories = core.getInput("repositories");

const skipTokenRevoke = Boolean(
  core.getInput("skip-token-revoke") || core.getInput("skip_token_revoke")
);

main(
  appId,
  privateKey,
  owner,
  repositories,
  core,
  createAppAuth,
  request,
  skipTokenRevoke
).catch((error) => {
  /* c8 ignore next 3 */
  console.error(error);
  core.setFailed(error.message);
});
