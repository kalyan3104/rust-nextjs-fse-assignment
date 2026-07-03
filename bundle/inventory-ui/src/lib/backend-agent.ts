import "server-only";
import fs from "node:fs";
import { Agent } from "undici";

export const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8081";

let backendAgent: Agent | undefined;

function readFileIfSet(pathValue: string | undefined): Buffer | undefined {
  if (!pathValue) return undefined;
  return fs.readFileSync(pathValue);
}

function createBackendAgent(): Agent {
  const connectOptions: Record<string, Buffer> = {};

  const caCert = readFileIfSet(process.env.BACKEND_CA_CERT_PATH);
  if (caCert) {
    connectOptions.ca = caCert;
  }

  const clientCert = readFileIfSet(process.env.BACKEND_CLIENT_CERT_PATH);
  const clientKey = readFileIfSet(process.env.BACKEND_CLIENT_KEY_PATH);
  if (clientCert && clientKey) {
    connectOptions.cert = clientCert;
    connectOptions.key = clientKey;
  }

  return new Agent({
    connect: Object.keys(connectOptions).length > 0 ? connectOptions : undefined,
  });
}

export function getBackendAgent(): Agent {
  backendAgent ??= createBackendAgent();
  return backendAgent;
}