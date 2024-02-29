import { SideBar } from '../sidebar';

export const Layout: React.FunctionComponent = (props) => {
  return (
    <main className="bg-gray-100 dark:bg-gray-800 h-screen">
      <div className="flex items-start justify-between">
        <SideBar></SideBar>
        <div className="flex flex-col w-full md:space-y-4 pl-4 h-screen overflow-x-hidden pb-4">
          {props.children}
        </div>
      </div>
    </main>
  );
};
