import { Application } from '../../../server/entities';
import Link from 'next/link';

interface Props {
  application: Application;
}

export const ApplicationView = (props: Props) => {
  return (
    <div className="max-w-sm rounded shadow-lg">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">{props.application.name}</div>
        <p className="text-gray-700 text-base">
          {props.application.description}
        </p>
      </div>
      <div className="px-6 pt-4 pb-2">
        <Link href={`/monitor/${props.application._id}`}>
          <a className="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2 mb-2">
            Monitor
          </a>
        </Link>
      </div>
    </div>
  );
};
