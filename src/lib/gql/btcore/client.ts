import { cacheExchange, createClient, fetchExchange } from "@urql/core";
import { initGraphQLTada } from "gql.tada";
import type { introspection } from "../btcore-env";

export const initClient = (token: string) => {
  return createClient({
    url: `${process.env.BTCORE_URL || ""}`,
    fetchOptions: {
      headers: {
        authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
    exchanges: [cacheExchange, fetchExchange],
  });
};

export const graphql = initGraphQLTada<{
  introspection: introspection;
}>();
