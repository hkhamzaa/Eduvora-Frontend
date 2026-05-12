import { apiSlice } from "../api/apiSlice";

export const neo4jApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getGraphStats: builder.query({
      query: () => ({
        url: "neo4j/graph-stats",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    getEnrollmentGraph: builder.query({
      query: () => ({
        url: "neo4j/enrollment-graph",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
    getRecommendations: builder.query({
      query: () => ({
        url: "neo4j/recommendations",
        method: "GET",
        credentials: "include" as const,
      }),
    }),
  }),
});

export const {
  useGetGraphStatsQuery,
  useGetEnrollmentGraphQuery,
  useGetRecommendationsQuery,
} = neo4jApi;
