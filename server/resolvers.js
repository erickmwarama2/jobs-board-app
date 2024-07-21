import { getJobs, getJob, getJobsByCompany, createJob } from "./db/jobs.js";
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
    createJob: async (_root, { input: { title, description }}) => {
        const companyId = "FjcJCHJALA4i"; // to change later
        return await createJob({ companyId, title, description });
    }
  }
};

function notFoundError(message) {
  return new GraphQLError(message, {
    extensions: {
      code: "NOT_FOUND",
    },
  });
}

function toIsoDate(value) {
  return new Date(value).toDateString();
}
