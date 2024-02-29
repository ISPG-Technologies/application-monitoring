import classnames from 'classnames';
import Moment from 'react-moment';
import { MetricHistory } from '../../../server/entities';
import { DownIcon } from '../icons/down';
import { UpIcon } from '../icons/up';
import { ResponseDuration } from './response-duration';

interface Props {
  service: string;
  metrics: MetricHistory[];
}

export const ServiceMetrics = (props: Props) => {
  const totalCount = props.metrics?.length;
  const healthyCount = props.metrics.filter(
    (met) => !met.health || met.health?.isHealthy,
  ).length;
  const healthyPercentage =
    totalCount === 0 ? 100 : Math.round((healthyCount * 100) / totalCount);
  const nonHealthyPercentage = 100 - healthyPercentage;

  const renderName = () => {
    return (
      <p className="text-sm w-max text-gray-700 dark:text-white font-semibold border-b border-gray-200">
        {props.service}
      </p>
    );
  };

  const renderCounts = () => {
    return (
      <div className="flex items-end space-x-2 my-6">
        <p className="text-5xl text-black dark:text-white font-bold">
          {healthyCount || 0}
          <span className="text-sm text-gray-400">/{totalCount}</span>
        </p>
        {!!healthyPercentage && (
          <span className="text-green-500 text-xl font-bold flex items-center">
            <UpIcon />
            {healthyPercentage}%
          </span>
        )}
        {!!nonHealthyPercentage && (
          <span className="text-red-500 text-xl font-bold flex items-center">
            <DownIcon />
            {nonHealthyPercentage}%
          </span>
        )}
      </div>
    );
  };

  const renderMetric = (metric: MetricHistory) => {
    return (
      <div className="border-b border-gray-200 pb-2 mb-2 ">
        <div className="flex items-center text-sm sm:space-x-12  justify-between">
          <p>{metric.metric.name}</p>
          <div className="flex items-end text-xs">
            {metric.health && (
              <>
                {metric.health.isHealthy && (
                  <span className="text-green-500 flex items-center ">
                    <UpIcon /> Up
                  </span>
                )}
                {!metric.health.isHealthy && (
                  <span className="text-red-500 flex items-center ">
                    <DownIcon /> Down
                  </span>
                )}
              </>
            )}
          </div>
        </div>
        {metric.sameStatusSince && (
          <p className="text-xs text-gray-500">
            Since <Moment date={metric.sameStatusSince} fromNow ago />
          </p>
        )}
        {metric.metric.metricType === 'website' && (
          <a
            href={metric.metric.metricUrl}
            target="_blank"
            className="text-xs text-gray-500"
          >
            {metric.metric.metricUrl}
          </a>
        )}
        {metric.health && !metric.health?.isHealthy && (
          <p className="text-xs text-red-500">Error: {metric.health.error}</p>
        )}
        {!!metric.health && (
          <ResponseDuration duration={metric.health.responseDuration} />
        )}
      </div>
    );
  };

  const renderMetrics = () => {
    return (
      <div className="dark:text-white">{props.metrics?.map(renderMetric)}</div>
    );
  };
  return (
    <div
      className={classnames({
        'w-full border-b-4 ': true,
        'border-red-400': nonHealthyPercentage > 0,
        'border-green-300': nonHealthyPercentage === 0,
      })}
    >
      <div className="h-full shadow-lg px-4 py-6 w-full bg-white dark:bg-gray-700 relative">
        {renderName()}
        {renderCounts()}
        {renderMetrics()}
      </div>
    </div>
  );
};
