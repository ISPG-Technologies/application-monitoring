import { NextPage, NextPageContext } from 'next';
import Router from 'next/router';
import React, { useEffect } from 'react';
import { Application, MetricSummary } from '../../../server/entities';
import { ApiResponse } from '../../../server/utils';
import { Layout } from '../../components/layouts/plain';
import { ServiceMetrics } from '../../components/metric/service';
import MonitorHeader from '../../components/monitor/header';
import { fetchServerResponse } from '../../lib/api';
import Error from '../_error';

export async function getServerSideProps(context: NextPageContext): Promise<{
  props: Props;
}> {
  if (!context.query.id) {
    return { props: { statusCode: 404, summary: null, application: null } };
  }
  const [summary, application] = await Promise.all([
    fetchServerResponse<ApiResponse<MetricSummary>>(
      context,
      `/api/metric/summary/latest?applicationId=${context.query.id}`,
    ),
    fetchServerResponse(context, `/api/application/${context.query.id}`),
  ]);
  return {
    props: {
      statusCode: summary.status,
      summary: summary.data,
      application: application.data,
    },
  };
}

interface Props {
  summary?: MetricSummary;
  application: Application;
  statusCode: number;
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

  if (props.statusCode && props.statusCode >= 400) {
    return <Error statusCode={props.statusCode} />;
  }

  const services = [
    ...new Set(props.summary?.metrics?.map((metr) => metr.metric.service)),
  ];

  return (
    <Layout>
      <main className="bg-gray-100 dark:bg-gray-800">
        <div className="flex items-start justify-between">
          <div className="flex flex-col w-full md:space-y-4">
            <div className="overflow-auto pb-24 md:px-2">
              <MonitorHeader
                application={props.application}
                summary={props.summary}
              />
              {!!props.summary && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 my-4">
                  {services.map((service) => (
                    <ServiceMetrics
                      key={service}
                      service={service}
                      metrics={
                        props.summary?.metrics?.filter(
                          (met) => met.metric.service === service,
                        ) || []
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
};

export default Home;
