import * as jwt from "jsonwebtoken";

require('dotenv').config()

const HASURA_GRAPHQL_JWT_SECRET = {
  type: process.env.HASURA_JWT_SECRET_TYPE || "HS256",
  key: process.env.HASURA_JWT_SECRET_KEY || "", // provide default value to key
};

const JWT_CONFIG: jwt.SignOptions = {
  algorithm: HASURA_GRAPHQL_JWT_SECRET.type as "HS256" | "RS512",
  expiresIn: "90d",
};

interface GenerateJWTParams {
  defaultRole: string;
  allowedRoles: string[];
  otherClaims?: Record<string, string | string[]>;
}

export function generateJWT(params: GenerateJWTParams): string {
  const payload = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-allowed-roles": params.allowedRoles,
      "x-hasura-default-role": params.defaultRole,
      ...params.otherClaims,
    },
  };

  if (!HASURA_GRAPHQL_JWT_SECRET.key) {
    throw new Error("HASURA_GRAPHQL_JWT_SECRET.key is not defined");
  }

  return jwt.sign(payload, HASURA_GRAPHQL_JWT_SECRET.key, JWT_CONFIG);
}
