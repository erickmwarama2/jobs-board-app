import { useState } from 'react';
import { createJob, createJobMutation } from '../lib/graphql/queries';
import { useNavigate } from 'react-router';
import { useMutation } from '@apollo/client';
import { jobByIdQuery } from '../lib/graphql/queries';

function CreateJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const navigator = useNavigate();

  const [mutate] = useMutation(createJobMutation);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log('should post a new job:', { title, description });

    // const job = await createJob({title, description});

    const { data: { job }} = await mutate({
      variables: {
        input: {
          title,
          description,
        }
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

    console.log('returned job', job);

    navigator(`/jobs/${job.id}`);
  };

  return (
    <div>
      <h1 className="title">
        New Job
      </h1>
      <div className="box">
        <form>
          <div className="field">
            <label className="label">
              Title
            </label>
            <div className="control">
              <input className="input" type="text" value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <label className="label">
              Description
            </label>
            <div className="control">
              <textarea className="textarea" rows={10} value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="control">
              <button className="button is-link" onClick={handleSubmit}>
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateJobPage;
