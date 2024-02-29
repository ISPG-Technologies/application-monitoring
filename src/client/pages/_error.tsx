import Link from 'next/link';

interface Props {
  statusCode: number;
}

const Error = (props: Props) => {
  const errorMessage =
    props.statusCode === 400 || props.statusCode === 404
      ? "Sorry, this page isn't available"
      : 'An error occurred on client';

  return (
    <main className="bg-white relative relative">
      <div className="container mx-auto h-screen pt-32 md:pt-0 px-6 z-10 flex items-center justify-between">
        <div className="container mx-auto px-6 flex flex-col-reverse lg:flex-row justify-between items-center relative">
          <div className="w-full mb-16 md:mb-8 text-center lg:text-left">
            <h1 className="font-light font-sans text-center lg:text-left text-5xl lg:text-8xl mt-12 md:mt-0 text-gray-700">
              {errorMessage}
            </h1>
            <div className="px-2 py-2 w-36 mt-16 font-light transition ease-in duration-200  border-2 text-lg border-gray-700  focus:outline-none">
              <Link href="/">
                <a>Go back home</a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
