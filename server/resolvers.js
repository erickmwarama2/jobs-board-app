import {
  getJobs,
  getJob,
  getJobsByCompany,
  createJob,
  deleteJob,
  updateJob,
  countJobs,
} from "./db/jobs.js";
import { companyLoader, getCompany } from "./db/companies.js";
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
    jobs: async (_root, { limit, offset }) => {
      const items = await getJobs(limit, offset);
      const totalCount = await countJobs();
      return {
        items,
        totalCount
      }
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
    // company: async (job) => {
    //   return await getCompany(job.companyId);
    // },
    company: (job) => companyLoader.load(job.companyId),
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
    deleteJob: async (_root, { id }, { user }) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const job = await deleteJob(id, user.companyId);
      if (!job) {
        throw notFoundError("Job could not be found");
      }
      return job;
    },
    updateJob: async (
      _root,
      {
        input: {
          id,
          input: { title, description },
        },
      },
      { user }
    ) => {
      if (!user) {
        throw unauthorizedError("Missing authentication");
      }
      const job = await updateJob({
        id,
        companyId: user.companyId,
        title,
        description,
      });

      if (!job) {
        throw notFoundError("Job not found");
      }
      return job;
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
