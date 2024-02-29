import Link from 'next/link';
import { useRouter } from 'next/router';
import classnames from 'classnames';

interface Props {
  href: string;
  title: string;
}

export const SideMenu: React.FunctionComponent<Props> = (props) => {
  const router = useRouter();
  const isActive = router.asPath?.split('?')[0] === props.href;
  return (
    <Link href={props.href}>
      <a
        className={classnames({
          'w-full  flex items-center pl-6 p-2 my-2 transition-colors duration-200 justify-start border-l-4 ':
            true,
          'text-gray-800 dark:text-white border-purple-500': isActive,
          'text-gray-400 hover:text-gray-800 border-transparent': !isActive,
        })}
        href="#"
      >
        {props.children}
        <span className="mx-2 text-sm font-normal">{props.title}</span>
      </a>
    </Link>
  );
};
