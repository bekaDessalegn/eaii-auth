import { GraphQLClient } from "graphql-request";

export const client = new GraphQLClient("https://eaii-product.hasura.app/v1/graphql", {
  headers: { "x-hasura-admin-secret": "iu0Kz6F6yDCN48cMyNg3JURWQtzA15X1QKNUIfC4LnV17DfIz4W7SvMyy5w8imwL" },
});
