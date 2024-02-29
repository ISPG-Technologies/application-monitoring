import { Application, MetricSummary } from '../../../server/entities';
import { MetricsSummaryHeader } from '../metric/summary-header';
import Link from 'next/link';
import Moment from 'react-moment';

interface Props {
  summary?: MetricSummary;
  application: Application;
  showMonitorLink?: boolean;
}
const MonitorHeader: React.FunctionComponent<Props> = (props) => {
  const renderHeader = () => {
    return (
      <div className="pt-4">
        <h1 className="text-4xl font-semibold text-gray-800 dark:text-white">
          {props.application.title || 'Monitoring'}
        </h1>
        <h2 className="text-md text-gray-500">
          {props.application.description}{' '}
        </h2>
        <span className="text-sm text-gray-400">
          Updated{' '}
          <Moment
            date={props.summary?.createdAt}
            // format="DD-MMM-YYYY HH:mm A"
            fromNow
          />
          {props.showMonitorLink && (
            <span className="ml-2">
              <Link href={`/monitor/${props.application._id}`}>
                <a className="text-indigo-600 hover:text-indigo-900">Monitor</a>
              </Link>
            </span>
          )}
        </span>
      </div>
    );
  };

  const services = [
    ...new Set(props.summary?.metrics?.map((metr) => metr.metric.service)),
  ];
  return (
    <>
      {renderHeader()}
      {!!props.summary && (
        <MetricsSummaryHeader
          services={services}
          metrics={props.summary?.metrics || []}
          updatedAt={props.summary?.createdAt}
        />
      )}
    </>
  );
};

export default MonitorHeader;
