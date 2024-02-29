import { NextPage, NextPageContext } from 'next';
import absoluteUrl from 'next-absolute-url';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Application, Metric } from '../../../server/entities';
import { ApiResponse, PaginatedApiResponse } from '../../../server/utils';
import { Layout } from '../../components/layouts/plain';
import {
  fetchServerResponse,
  postAndUpdateServerResponse,
} from '../../lib/api';
import { StorageKeys } from '../../lib/enums';
import toast from '../../components/toast';

type FormValues = {
  name: string;
  applicationId: string;
  service: string;
  metricUrl: string;
  metricType: string;
  responseField: string;
  healthyValue: string;
  nonFatal: boolean;
  healthyDelay: number;
};

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

const addNew: NextPage<Props> = (props) => {
  const router = useRouter();
  const [authToken, setauthToken] = React.useState('');

  useEffect(() => {
    const authToken = localStorage.getItem(StorageKeys.AccessToken);
    if (authToken != '') {
      setauthToken(authToken);
    }
  });

  const renderHeader = () => {
    return (
      <div className="p-3">
        <h6 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Add New Metric
        </h6>
      </div>
    );
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const notify = React.useCallback((type, message, content?: any) => {
    toast({ type, message, content });
  }, []);

  const onSubmit = async ({ ...data }) => {
    data.healthyDelay = parseInt(data.healthyDelay);
    const metric = await postAndUpdateServerResponse<ApiResponse<Metric>>(
      window.location.origin,
      `/api/metric`,
      'POST',
      JSON.stringify({ ...data }),
      authToken,
    );

    if (metric.status == 200) {
      router.push(`/metrics`);
      notify('success', 'Success |', 'Metric added Successfully');
    } else {
      notify('error', 'Error !', 'Something went wrong');
    }
  };

  return (
    <>
      <Layout>
        <main className="bg-gray-100 dark:bg-gray-800">
          {renderHeader()}
          <div className="inline-block min-w-full">
            <div className="w-1/2 p-3 h-auto float-left">
              <form
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 "
                onSubmit={handleSubmit(onSubmit)}
              >
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name
                  </label>
                  <input
                    className=" appearance-none border w-full py-2 px-3 text-gray-700 leading-tight "
                    type="textbox"
                    placeholder="name"
                    id="name"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors?.name && (
                    <p className="text-red-500 text-xs ">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Application
                  </label>
                  <div>
                    <select
                      className="form-select mt-1 h-10 leading-tight w-full py-2 px-3 text-black-primary bg-white border"
                      id="applicationId"
                      {...register('applicationId', {
                        required: 'Application is required',
                      })}
                    >
                      <option value="" selected>
                        Please Select
                      </option>
                      {props.applications.map(function (result) {
                        return (
                          <>
                            <option value={result._id?.toString()}>
                              {result.name}
                            </option>
                          </>
                        );
                      })}
                    </select>
                  </div>
                  {errors?.applicationId && (
                    <p className="text-red-500 text-xs ">
                      {errors.applicationId.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Service
                  </label>
                  <input
                    className=" appearance-none border w-full py-2 px-3 text-gray-700 leading-tight "
                    type="textbox"
                    placeholder="Service"
                    id="service"
                    {...register('service', {
                      required: 'Service is required',
                    })}
                  />
                  {errors?.service && (
                    <p className="text-red-500 text-xs ">
                      {errors.service.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    MetricUrl
                  </label>
                  <input
                    className="appearance-none border w-full py-2 px-3 text-gray-700 leading-tight "
                    type="textbox"
                    placeholder="metricurl"
                    id="metricUrl"
                    {...register('metricUrl', {
                      required: 'metricUrl is required.',
                      pattern: {
                        value:
                          /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/,
                        message: 'Please enter a valid url',
                      },
                    })}
                  />
                  {errors?.metricUrl && (
                    <p className="text-red-500 text-xs ">
                      {errors.metricUrl.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2 bg-white text-gray-700">
                    Metric Type
                  </label>
                  <select
                    className="form-select mt-1 h-10 leading-tight w-full py-2 px-3 text-black-primary bg-white border"
                    id="metricType"
                    {...register('metricType', {
                      required: 'Name is required',
                    })}
                  >
                    <option value="" selected>
                      Please Select
                    </option>
                    <option value="website">Website</option>
                    <option value="health-api">Health Api</option>
                  </select>
                  {errors?.metricType && (
                    <p className="text-red-500 text-xs ">
                      {errors.metricType.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Response Field
                  </label>
                  <input
                    className=" appearance-none border w-full py-2 px-3 text-gray-700 leading-tight "
                    type="textbox"
                    placeholder="Response Field"
                    id="respnseField"
                    {...register('responseField', {
                      required: 'ResponseField is required',
                    })}
                  />
                  {errors?.responseField && (
                    <p className="text-red-500 text-xs ">
                      {errors.responseField.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    HealthyValue
                  </label>
                  <input
                    className=" appearance-none border w-full py-2 px-3 text-gray-700 leading-tight "
                    type="textbox"
                    placeholder="Healthy Value"
                    id="healthyValue"
                    {...register('healthyValue', {
                      required: 'HealthyValue is required',
                    })}
                  />
                  {errors?.healthyValue && (
                    <p className="text-red-500 text-xs ">
                      {errors.healthyValue.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="inline-flex items-center text-gray-700 text-sm font-bold mb-2">
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      {...register('nonFatal')}
                    />
                    <span className="ml-2">Non Fatal</span>
                  </label>
                </div>
                <div className="p-2 flex">
                  <div className="w-1/2"></div>
                  <div className="w-1/2 flex justify-end">
                    <input
                      type="submit"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 w-40"
                      value="Submit"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>
      </Layout>
    </>
  );
};
export default addNew;
