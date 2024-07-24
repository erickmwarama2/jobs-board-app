import { useEffect, useState } from 'react';
import JobList from '../components/JobList';
import { useJobs } from '../lib/graphql/hooks.js';


function HomePage() {

  const { jobs, loading, error } = useJobs();

  // const [jobs, setJobs ] = useState([]);
  // useEffect(() => {
  //   getJobs().then((jobs) => setJobs(jobs));
  // }, []);

  // console.log('[HomePage] jobs:', jobs);

  if (loading) {
    return <div> Fetching jobs...</div>;
  }

  if (error) {
    return <div> Couldn't fetch jobs </div>;
  }

  return (
    <div>
      <h1 className="title">
        Job Board
      </h1>
      <JobList jobs={jobs} />
    </div>
  );
}

export default HomePage;
