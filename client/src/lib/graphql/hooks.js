import { useQuery, useMutation } from "@apollo/client";
import {
  companyByIdQuery,
  jobByIdQuery,
  jobsQuery,
  createJobMutation,
} from "./queries.js";

export function useCompany(id) {
  const { data, loading, error } = useQuery(companyByIdQuery, {
    variables: {
      id,
    },
  });

  return { company: data?.company, loading, error: Boolean(error) };
}

export function useJob(id) {
  const { data, loading, error } = useQuery(jobByIdQuery, {
    variables: {
      id,
    },
  });

  return { job: data?.job, loading, error: Boolean(error) };
}

// export function useJob(id) {
//   const { data, loading, error } = useQuery(jobByIdQuery, {
//     variables: {
//       id,
//     },
//   });

//   return { job: data?.job, loading, error: Boolean(error) };
// }

export function useJobs(limit, offset) {
  const { data, loading, error } = useQuery(jobsQuery, {
    variables: { limit, offset},
    fetchPolicy: 'network-only'
  });

  return { jobs: data?.jobs, loading, error: Boolean(error) };
}

export function useCreateJob() {
  const [mutate, { loading }] = useMutation(createJobMutation);

  const createJob = async (title, description) => {
    const {
      data: { job },
    } = await mutate({
      variables: {
        input: {
          title,
          description,
        },
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
    return job;
  };

  return {
    createJob,
    loading,
  };
}
