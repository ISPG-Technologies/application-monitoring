import { NextPage, NextPageContext } from 'next';
import React, { useEffect } from 'react';
import Moment from 'react-moment';
import { Application } from '../../../server/entities';
import { PaginatedApiResponse } from '../../../server/utils';
import { Layout } from '../../components/layouts/plain';
import Link from 'next/link';
import Router from 'next/router';
import { fetchServerResponse } from '../../lib/api';

export async function getServerSideProps(context: NextPageContext): Promise<{
  props: Props;
}> {
  const applications = await fetchServerResponse<
    PaginatedApiResponse<Application>
  >(context, '/api/application');
  return { props: { applications: applications.data } };
}

interface Props {
  applications: Application[];
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

  const renderHeader = () => {
    return (
      <div className="p-3">
        <h6 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Applications
        </h6>
        <h2 className="text-sm text-gray-400">
          {props.applications?.length} Total
        </h2>
      </div>
    );
  };

  const renderTHead = (key: string, title?: string) => {
    return (
      <th
        key={key}
        scope="col"
        className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal font-bold"
      >
        {title || ''}
      </th>
    );
  };
  const renderHeaders = () => {
    return (
      <thead>
        <tr>
          {renderTHead('name', 'Name')}
          {renderTHead('isActive', 'Active')}
          {renderTHead('emailEnabled', 'Email Enabled')}
          {renderTHead('notifyEmails', 'Emails')}
          {renderTHead('metrics', 'Metrics')}
          {renderTHead('status', 'Status')}
          {renderTHead('createdAt', 'Created')}
          {renderTHead('updatedAt', 'Last Sync')}
          {renderTHead('actions')}
        </tr>
      </thead>
    );
  };

  const renderValueCell = (value: React.ReactNode) => {
    return (
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
        <div className="flex items-center">
          <p className="text-gray-900 whitespace-no-wrap">{value}</p>
        </div>
      </td>
    );
  };

  const renderRow = (application: Application) => {
    return (
      <tr key={application._id?.toString()}>
        {renderValueCell(application.name)}
        {renderValueCell(application.isActive ? 'Yes' : 'No')}
        {renderValueCell(application.emailEnabled ? 'Yes' : 'No')}
        {renderValueCell(application.notifyEmails?.join(', ') || '-')}
        {renderValueCell(application.numberOfMetrics || '-')}
        {renderValueCell(
          !application.health
            ? '-'
            : application.health?.allMetricsHealthy
            ? 'Up'
            : 'Down',
        )}
        {renderValueCell(
          <Moment date={application.createdAt} format="DD-MM-YYYY" />,
        )}
        {renderValueCell(<Moment date={application.updatedAt} fromNow />)}
        {renderValueCell(
          <Link href={`/monitor/${application._id}`}>
            <a className="text-indigo-600 hover:text-indigo-900">Monitor</a>
          </Link>,
        )}
      </tr>
    );
  };
  return (
    <Layout>
      <main className="bg-gray-100 dark:bg-gray-800">
        {renderHeader()}
        <div className="inline-block min-w-full shadow">
          <table className="min-w-full leading-normal">
            {renderHeaders()}
            <tbody>{props.applications?.map(renderRow)}</tbody>
          </table>
        </div>
      </main>{' '}
    </Layout>
  );
};

export default Home;
