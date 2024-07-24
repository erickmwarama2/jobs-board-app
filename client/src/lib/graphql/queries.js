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

export const apolloClient = new ApolloClient({
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

const jobDetailFragment = gql`
  fragment JobDetail on Job {
    id
    date
    title
    description
    company {
      id
      name
    }
  }
`;

export const jobByIdQuery = gql`
  query JobsById($id: ID!) {
    job(id: $id) {
      ...JobDetail
    }
  }
  ${jobDetailFragment}
`;

export const createJobMutation = gql`
    mutation createJob($input: CreateJobInput!) {
      job: createJob(input: $input) {
        ...JobDetail
      }
    }
    ${jobDetailFragment}
  `;

export async function createJob({ title, description }) {
  // const { job } = await client.request(mutation, {
  //   input: { title, description },
  // });
  const result = await apolloClient.mutate({
    mutation: createJobMutation,
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

export const companyByIdQuery = gql`
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

export async function getCompany(id) {
  // const { company } = await client.request(query, { id });
  const result = await apolloClient.query({
    query: companyByIdQuery,
    variables: { id },
  });
  const { company } = result.data;
  return company;
}

export const jobsQuery = gql`
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

export async function getJobs() {
  // const { jobs } = await client.request(query);
  const result = await apolloClient.query({
    query: jobsQuery,
    fetchPolicy: "network-only",
  });
  const { jobs } = result.data;
  return jobs;
}
