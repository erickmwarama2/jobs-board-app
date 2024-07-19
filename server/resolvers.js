import { getJobs } from "./db/jobs.js";
import { getCompany } from "./db/companies.js";

export const resolvers = {
    Query: {
        job: () => {
            return {
                title: 'Senior Engineer',
                description: 'A senior full stack engineer',
                id: 'test-id'
            };
        },
        jobs: async () => {
            return await getJobs();
        },
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