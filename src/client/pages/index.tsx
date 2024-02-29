import { NextPage, NextPageContext } from 'next';
import Router from 'next/router';
import React, { useEffect } from 'react';
import { Application, MetricSummary } from '../../server/entities';
import { ApiResponse } from '../../server/utils';
import { Layout } from '../components/layouts/plain';
import MonitorHeader from '../components/monitor/header';
import { fetchServerResponse } from '../lib/api';

export async function getServerSideProps(context: NextPageContext): Promise<{
  props: Props;
}> {
  const applications = await fetchServerResponse<
    ApiResponse<{ applications: Application[]; summaries: MetricSummary[] }>
  >(context, '/api/application/summaries');
  return {
    props: {
      applications: applications.data.applications,
      summaries: applications.data.summaries,
    },
  };
}

interface Props {
  applications: Application[];
  summaries: MetricSummary[];
}

const Home: NextPage<Props> = (props) => {
  const [authToken, setauthToken] = React.useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('access_token');
    if (authToken != null) {
      setauthToken(authToken);
    } else {
      Router.push('/login');
    }
  });

  return (
    <Layout>
      <div>
        {props.applications?.map((application) => {
          const summary = props.summaries.find(
            (s) => s.applicationId?.toString() === application._id?.toString(),
          );
          return (
            <div className="my-1 px-4 border-2">
              <MonitorHeader
                application={application}
                summary={summary}
                showMonitorLink
              />
            </div>
          );
        })}
      </div>
    </Layout>
  );
};

export default Home;
