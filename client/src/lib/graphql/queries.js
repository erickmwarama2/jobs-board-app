// import { GraphQLClient } from "graphql-request";
import { getAccessToken } from "../auth.js";
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  concat,
  createHttpLink,
  gql,
} from "@apollo/client";

const httpLink = createHttpLink({
  uri: "http://localhost:9000/graphql",
});

const customLink = new ApolloLink((operation, forward) => {
  console.log("[customLink] operation:", operation);
  const accessToken = getAccessToken();
  if (accessToken) {
    operation.setContext({
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
  }
  return forward(operation);
});

const apolloClient = new ApolloClient({
  // uri: "http://localhost:9000/graphql",
  link: concat(customLink, httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    query: {
      fetchPolicy: "cache-first",
    },
    watchQuery: {
      fetchPolicy: "network-only",
    },
  },
  devtools: {
    enabled: true,
  },
});

// const client = new GraphQLClient("http://localhost:9000/graphql", {
//   headers: () => {
//     const accessToken = getAccessToken();
//     if (accessToken) {
//       return {
//         Authorization: `Bearer ${accessToken}`,
//       };
//     }

//     return {};
//   },
// });

const jobByIdQuery = gql`
  query JobsById($id: ID!) {
    job(id: $id) {
      id
      date
      title
      description
      company {
        id
        name
      }
    }
  }
`;

export async function createJob({ title, description }) {
  const mutation = gql`
    mutation createJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        id
      }
    }
  `;

  // const { job } = await client.request(mutation, {
  //   input: { title, description },
  // });
  const result = await apolloClient.mutate({
    mutation,
    variables: {
      input: { title, description },
    },
    update: (cache, result) => {
      cache.writeQuery({
        query: jobByIdQuery,
        variables: {
          id: result.data.job.id,
        },
        data: result.data,
      });
    },
  });
  const { job } = result.data;
  return job;
}

export async function getJob(id) {
  // const { job } = await client.request(query, { id });
  const result = await apolloClient.query({
    query: jobByIdQuery,
    variables: { id },
  });
  const { job } = result.data;
  return job;
}

export async function getCompany(id) {
  const query = gql`
    query GetCompany($id: ID!) {
      company(id: $id) {
        id
        name
        description
        jobs {
          id
          title
          description
          date
        }
      }
    }
  `;
  // const { company } = await client.request(query, { id });
  const result = await apolloClient.query({ query, variables: { id } });
  const { company } = result.data;
  return company;
}

export async function getJobs() {
  const query = gql`
    query {
      jobs {
        id
        date
        title
        company {
          id
          name
        }
      }
    }
  `;

  // const { jobs } = await client.request(query);
  const result = await apolloClient.query({
    query,
    fetchPolicy: "network-only",
  });
  const { jobs } = result.data;
  return jobs;
}
