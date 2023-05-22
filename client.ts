import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient("http://localhost:8080/v1/graphql", {
  headers: { "x-hasura-admin-secret": "4520b4f569009e29e452133da26de995b180c184b320a4eaa1d1468b34645ff6" },
});
