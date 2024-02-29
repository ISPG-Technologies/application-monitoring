import { Metric } from '../../../server/entities';
import Moment from 'react-moment';
import classnames from 'classnames';

interface Props {
  metrics: Metric[];
}
export const MetricTable = (props: Props) => {
  const renderHeaders = () => {
    return (
      <thead>
        <tr>
          <th
            key="application"
            scope="col"
            className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal font-bold"
          >
            Application
          </th>
          <th
            key="metric"
            scope="col"
            className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal font-bold"
          >
            Metric
          </th>
          <th
            key="updatedAt"
            scope="col"
            className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal font-bold"
          >
            Last Updated At
          </th>
          <th
            key="status"
            scope="col"
            className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal font-bold"
          >
            Status
          </th>
          <th
            key="actions"
            scope="col"
            className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
          ></th>
        </tr>
      </thead>
    );
  };

  const renderRow = (metric: Metric) => {
    return (
      <tr key={metric._id?.toString()}>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-gray-900 whitespace-no-wrap">
                {metric.service}
              </p>
            </div>
          </div>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <p className="text-gray-900 whitespace-no-wrap">{metric.name}</p>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <p className="text-gray-900 whitespace-no-wrap">
            <Moment date={metric.createdAt} format="DD-MM-YYYY HH:mm a" />
          </p>
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          {metric.health ? (
            <span
              className={classnames({
                'relative inline-block px-3 py-1 font-semibold leading-tight':
                  true,
                'text-green-900': metric.health.isHealthy,
                'text-red-900': !metric.health.isHealthy,
              })}
            >
              <span
                aria-hidden="true"
                className={classnames({
                  'absolute inset-0 opacity-50 rounded-full': true,
                  'bg-green-200 ': metric.health.isHealthy,
                  'bg-red-200 ': !metric.health.isHealthy,
                })}
              ></span>
              <span className="relative">
                {metric.health.isHealthy ? 'up' : 'down'}
              </span>
            </span>
          ) : (
            <></>
          )}
        </td>
        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
          <a href="#" className="text-indigo-600 hover:text-indigo-900">
            View History
          </a>
        </td>
      </tr>
    );
  };
  return (
    <div className="inline-block min-w-full rounded-lg">
      <table className="min-w-full leading-normal">
        {renderHeaders()}
        <tbody>{props.metrics?.map(renderRow)}</tbody>
      </table>
    </div>
  );
};
