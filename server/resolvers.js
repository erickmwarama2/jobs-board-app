import { getJobs, getJob } from "./db/jobs.js";
import { getCompany } from "./db/companies.js";

export const resolvers = {
    Query: {
        job: (_root, args) => {
            // console.log(args);
            const { id } = args;
            return getJob(id);
        },
        jobs: async () => {
            return await getJobs();
        },
        company: (_root, args) => {
            const { id } = args;
            return getCompany(id);
        }
    },
    Job: {
        date: (job) => toIsoDate(job.createdAt),
        company: async (job) => {
            return await getCompany(job.companyId);
        }
    }
};

function toIsoDate(value) {
    return new Date(value).toDateString();
}