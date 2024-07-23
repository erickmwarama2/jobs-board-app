import {
  getJobs,
  getJob,
  getJobsByCompany,
  createJob,
  deleteJob,
  updateJob,
} from "./db/jobs.js";
import { getCompany } from "./db/companies.js";
import { GraphQLError } from "graphql";

export const resolvers = {
  Query: {
    job: async (_root, args) => {
      // console.log(args);
      const { id } = args;
      const job = await getJob(id);

      if (!job) {
        throw notFoundError("No job found with id " + id);
      }
      return job;
    },
    jobs: async () => {
      return await getJobs();
    },
    company: async (_root, args) => {
      const { id } = args;
      const company = await getCompany(id);
      if (!company) {
        throw notFoundError("No company found with id " + id);
      }
      return company;
    },
  },
  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: async (job) => {
      return await getCompany(job.companyId);
    },
  },
  Company: {
    jobs: (company) => getJobsByCompany(company.id),
  },
  Mutation: {
    createJob: async (_root, { input: { title, description } }, context) => {
      console.log("[createJob] context", context);
      const { user } = context;
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      return await createJob({ companyId: user.companyId, title, description });
    },
    deleteJob: async (_root, { id }) => {
      return await deleteJob(id);
    },
    updateJob: async (
      _root,
      {
        input: {
          id,
          input: { title, description },
        },
      }
    ) => {
      return await updateJob({ id, title, description });
    },
  },
};

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: {
      code: "NOT_FOUND",
    },
  });
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: {
      code: "UNAUTHORIZED",
    },
  });
}

function toIsoDate(value) {
  return new Date(value).toDateString();
}
