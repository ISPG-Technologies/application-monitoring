import { NextPage, NextPageContext } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import ReactPaginate from 'react-paginate';
import { Application, Metric } from '../../../server/entities';
import { PaginatedApiResponse } from '../../../server/utils';
import { Layout } from '../../components/layouts/plain';
import { fetchServerResponse } from '../../lib/api';

export async function getServerSideProps(context: NextPageContext): Promise<{
  props: Props;
}> {
  const page = Number(context.query.page || 1);
  const metrics = await fetchServerResponse<
    PaginatedApiResponse<PopulatedMetric>
  >(context, `/api/metric?page=${page}&perPage=10`);
  const count = metrics.count;
  const currentPage = page;
  const totalPages = metrics.totalPages;

  return {
    props: {
      metrics: metrics.data,
      count: count,
      currentPage: currentPage,
      totalPages: totalPages,
    },
  };
}

type PopulatedMetric = Omit<Metric, 'applicationId'> & {
  applicationId: Application;
};

interface Props {
  metrics: PopulatedMetric[];
  count: Number;
  currentPage: Number;
  totalPages: Number;
}

const Metrics: NextPage<Props> = (props) => {
  const router = useRouter();
  const query = router.query;

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
  const [authToken, setauthToken] = React.useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('access_token');
    if (authToken != null) {
      setauthToken(authToken);
    } else {
      router.push('/login');
    }
  });

  const renderHeader = () => {
    return (
      <div className="p-3 w-full">
        <div className="space-x-4 w-full">
          <div className="inline-block w-1/2">
            <h6 className="text-2xl font-semibold text-gray-800 dark:text-white w-1/2">
              Metrics
            </h6>
            <h2 className="text-sm text-gray-400">{props.count} Total</h2>
          </div>
          <div className="inline-block float-right ">
            <Link href="/metrics/new">
              <a className="bg-blue-500 hover:bg-blue-700 text-white font-bold p-2 border border-blue-500 rounded addNewBtn w-24 mt-2">
                Add New
              </a>
            </Link>
            &nbsp;
          </div>
        </div>
      </div>
    );
  };

  const renderHeaders = () => {
    return (
      <thead className="block md:table-header-group">
        <tr className="border border-grey-500 md:border-none block md:table-row absolute -top-full md:top-auto -left-full md:left-auto  md:relative ">
          {renderTHead('name', 'Name')}
          {renderTHead('application', 'Application')}
          {renderTHead('service', 'Service')}
          {renderTHead('metricType', 'Metric Type')}
          {renderTHead('metricUrl', 'Metric Url')}
          {renderTHead('healthyValue', 'Healthy Value')}
          {renderTHead('actions', 'Actions')}
        </tr>
      </thead>
    );
  };

  const renderRow = (metric: PopulatedMetric) => {
    return (
      <tr
        key={metric._id?.toString()}
        className="bg-white border border-grey-500 md:border-none block md:table-row"
      >
        {renderValueCell(metric.name)}
        {renderValueCell(metric.applicationId?.title || '-')}
        {renderValueCell(metric.service || '-')}
        {renderValueCell(metric.metricType || '-')}
        {renderValueCell(metric.metricUrl || '-')}
        {renderValueCell(metric.healthyValue || '-')}
        {renderValueCell(
          <>
            <span className="inline-block w-1/3 md:hidden font-bold">
              Actions
            </span>
            <Link href={'/metrics/' + metric._id}>
              <a className="text-indigo-600 hover:text-indigo-900">Edit</a>
            </Link>
            &nbsp;
          </>,
        )}
      </tr>
    );
  };

  const renderValueCell = (value: React.ReactNode) => {
    return (
      <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm p-2 md:border md:border-grey-500 text-left block md:table-cell">
        <div className="flex items-center">
          <p className="text-gray-900 whitespace-no-wrap">{value}</p>
        </div>
      </td>
    );
  };

  const handlePagination = (page) => {
    const path = router.pathname;
    if (page.selected !== Number(query.page) - 1) {
      query.page = `${page.selected + 1}`;

      router.push({
        pathname: path,
        query: query,
      });
    }
  };

  return (
    <>
      <Layout>
        <main className="bg-gray-100 dark:bg-gray-800">
          {renderHeader()}
          <div className="inline-block min-w-full shadow">
            <table className="min-w-full border-collapse block md:table">
              {renderHeaders()}
              <tbody className="block md:table-row-group">
                {props.metrics?.map(renderRow)}
              </tbody>
            </table>
          </div>

          <ReactPaginate
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            previousLabel={'previous'}
            nextLabel={'next'}
            breakLabel={'...'}
            initialPage={Number(query.page || 1) - 1}
            pageCount={props.totalPages}
            onPageChange={handlePagination}
            containerClassName={'paginate-wrap'}
            pageClassName={'paginate-li'}
            pageLinkClassName={'paginate-a'}
            activeClassName={'paginate-active'}
            nextLinkClassName={'paginate-next-a'}
            previousLinkClassName={'paginate-prev-a'}
            breakLinkClassName={'paginate-break-a'}
          />
        </main>{' '}
      </Layout>
    </>
  );
};

export default Metrics;
