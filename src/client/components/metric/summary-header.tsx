import { Metric, MetricHistory } from '../../../server/entities';
import classnames from 'classnames';
import { AllHealthyIcon } from '../icons/all-healthy';
import { ServiceDisruptionIcon } from '../icons/service-disruption';
import { UpIcon } from '../icons/up';
import { DownIcon } from '../icons/down';
import Moment from 'react-moment';

interface Props {
  services: string[];
  metrics: MetricHistory[];
  updatedAt: Date | string;
}
export const MetricsSummaryHeader = (props: Props) => {
  const renderSummary = () => {
    const totalCount = props.metrics?.length;
    const healthyCount = props.metrics.filter(
      (met) => !met.health || met.health?.isHealthy,
    ).length;
    const healthMessage =
      totalCount === healthyCount
        ? 'All good'
        : `${totalCount - healthyCount} out of ${totalCount} metrics are down`;
    const healthyPercentage =
      totalCount === 0 ? 100 : Math.round((healthyCount * 100) / totalCount);
    const nonHealthyPercentage = 100 - healthyPercentage;

    return (
      <div className="w-full md:w-6/12">
        <div className="shadow-lg w-full bg-white dark:bg-gray-700 ">
          <a className="w-full h-full block">
            <div className="flex items-center justify-between px-4 py-6 space-x-4">
              <div className="flex items-center">
                <span
                  className={classnames({
                    'rounded-full relative p-2': true,
                    'bg-green-100': totalCount === healthyCount,
                    'bg-red-100': totalCount !== healthyCount,
                  })}
                >
                  {totalCount !== healthyCount && <ServiceDisruptionIcon />}
                  {totalCount === healthyCount && <AllHealthyIcon />}
                </span>
                <div className="border-b border-gray-200 pr-2">
                  <p className="text-sm text-gray-700 dark:text-white ml-2 font-semibold">
                    {healthMessage}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-white ml-2 font-semibold border-b border-gray-200 pr-2">
                    Updated <Moment date={props.updatedAt} fromNow />
                  </p>
                </div>
              </div>
              <div className="mt-6 md:mt-0 text-black dark:text-white font-bold text-xl">
                <div className="flex">
                  {!!nonHealthyPercentage && (
                    <span className="text-red-500 text-xl font-bold flex items-center">
                      <DownIcon />
                      {nonHealthyPercentage}%
                    </span>
                  )}
                  {!!healthyPercentage && (
                    <span className="text-green-500 text-xl font-bold flex items-center">
                      <UpIcon />
                      {healthyPercentage}%
                    </span>
                  )}
                </div>
              </div>
              <div className="border-b border-gray-200 mt-6 md:mt-0 text-black dark:text-white font-bold text-xl">
                {healthyCount}
                <span className="text-xs text-gray-400">/{totalCount}</span>
              </div>
            </div>
            <div className="w-full h-3 bg-gray-100">
              <div
                className="h-full text-center text-xs text-white bg-red-400"
                style={{
                  width:
                    totalCount === 0
                      ? '0%'
                      : `${((totalCount - healthyCount) * 100) / totalCount}%`,
                }}
              ></div>
            </div>
          </a>
        </div>
      </div>
    );
  };

  const renderMetricsCount = () => {
    return (
      <div className="w-1/2">
        <div className="shadow-lg px-4 py-6 w-full bg-white dark:bg-gray-700 relative">
          <p className="text-2xl text-black dark:text-white font-bold">
            {props.metrics?.length || 0}
          </p>
          <p className="text-gray-400 text-sm">Metrics</p>
        </div>
      </div>
    );
  };

  const renderApplicationCount = () => {
    return (
      <div className="w-1/2">
        <div className="shadow-lg px-4 py-6 w-full bg-white dark:bg-gray-700 relative">
          <p className="text-2xl text-black dark:text-white font-bold">
            {props.services?.length || 0}
          </p>
          <p className="text-gray-400 text-sm">Services</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex my-6 items-center w-full space-y-4 md:space-x-4 md:space-y-0 flex-col md:flex-row">
      {renderSummary()}
      <div className="flex items-center w-full md:w-1/2 space-x-4">
        {renderApplicationCount()}
        {renderMetricsCount()}
      </div>
    </div>
  );
};
