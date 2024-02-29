import { NextPage } from 'next';
import absoluteUrl from 'next-absolute-url';
import Router from 'next/router';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Application, Metric } from '../../../server/entities';
import { ApiResponse, PaginatedApiResponse } from '../../../server/utils';
import { Layout } from '../../components/layouts/plain';
import toast from '../../components/toast';
import {
  fetchServerResponse,
  postAndUpdateServerResponse,
} from '../../lib/api';

type FormValues = {
  _id: string;
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

export async function getServerSideProps(context): Promise<{
  props: Props;
}> {
  const id = context.params.id;
  const metric = await fetchServerResponse<ApiResponse<Metric>>(
    context,
    `/api/metric/${id}`,
  );

  const applications = await fetchServerResponse<
    PaginatedApiResponse<Application>
  >(context, '/api/application');
  return { props: { metric: metric.data, applications: applications.data } };
}

interface Props {
  metric: Metric;
  applications: Application[];
}

let checkState = { isChecked: false };

const edit: NextPage<Props> = (props) => {
  const [authToken, setauthToken] = React.useState('');

  useEffect(() => {
    const authToken = localStorage.getItem('access_token');
    if (authToken) {
      setauthToken(authToken);
    } else {
      Router.push('/login');
    }
  });

  const notify = React.useCallback((type, message, content) => {
    toast({ type, message, content });
  }, []);

  const dismiss = React.useCallback(() => {
    toast.dismiss();
  }, []);

  const renderHeader = () => {
    return (
      <div className="p-3">
        <h6 className="text-2xl font-semibold text-gray-800 dark:text-white">
          Update Metric
        </h6>
      </div>
    );
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async ({ ...data }) => {
    const id = data._id;

    data.healthyDelay = parseInt(data.healthyDelay);

    const metric = await postAndUpdateServerResponse<ApiResponse<Metric>>(
      window.location.origin,
      `/api/metric/${id}`,
      'PUT',
      JSON.stringify({ ...data }),
      authToken,
    );

    if (metric.status == 200) {
      Router.push(`/metrics`);
      notify('success', 'Success |', 'Metric Data Updated Successfully');
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
            <div className="w-full p-3 h-auto float-left">
              <form
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 "
                onSubmit={handleSubmit(onSubmit)}
              >
                <input
                  type="hidden"
                  {...register('_id')}
                  defaultValue={props.metric._id?.toString()}
                />
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-4 my-4">
                  <div className="mb-2 pr-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Name
                    </label>
                    <input
                      className=" appearance-none border w-full py-2 px-3 text-gray-700 leading-6 "
                      type="textbox"
                      placeholder="name"
                      id="name"
                      {...register('name', { required: 'Name is required' })}
                      defaultValue={props.metric.name}
                    />
                    {errors?.name && (
                      <p className="text-red-500 text-xs ">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-2 pr-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Application
                    </label>
                    <div>
                      <select
                        value={props.metric.applicationId?.toString()}
                        className="form-select h-10 leading-6 w-full py-2 px-3 text-black-primary bg-white border"
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
                  <div className="mb-2 pr-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Service
                    </label>
                    <input
                      className=" appearance-none border w-full py-2 px-3 text-gray-700 leading-6 "
                      type="textbox"
                      placeholder="Service"
                      id="service"
                      {...register('service', {
                        required: 'Service is required',
                      })}
                      defaultValue={props.metric.service}
                    />
                    {errors?.service && (
                      <p className="text-red-500 text-xs ">
                        {errors.service.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-2 pr-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      MetricUrl
                    </label>
                    <input
                      className="appearance-none border w-full py-2 px-3 text-gray-700 leading-6 "
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
                      defaultValue={props.metric.metricUrl}
                    />
                    {errors?.metricUrl && (
                      <p className="text-red-500 text-xs ">
                        {errors.metricUrl.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-2 pr-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2 bg-white text-gray-700">
                      Metric Type
                    </label>
                    <select
                      value={props.metric.metricType}
                      className="form-select h-10 leading-6 w-full py-2 px-3 text-black-primary bg-white border"
                      id="metricType"
                      {...register('metricType', {
                        required: 'Name is required',
                      })}
                    >
                      <option value="website">Website</option>
                      <option value="health-api">Health Api</option>
                    </select>
                    {errors?.metricType && (
                      <p className="text-red-500 text-xs ">
                        {errors.metricType.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-2 pr-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Response Field
                    </label>
                    <input
                      className=" appearance-none border w-full py-2 px-3 text-gray-700 leading-6 "
                      type="textbox"
                      placeholder="Response Field"
                      id="respnseField"
                      {...register('responseField', {
                        required: 'ResponseField is required',
                      })}
                      defaultValue={props.metric.responseField}
                    />
                    {errors?.responseField && (
                      <p className="text-red-500 text-xs ">
                        {errors.responseField.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-2 pr-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      HealthyValue
                    </label>
                    <input
                      className=" appearance-none border w-full py-2 px-3 text-gray-700 leading-6 "
                      type="textbox"
                      placeholder="Healthy Value"
                      id="healthyValue"
                      {...register('healthyValue', {
                        required: 'HealthyValue is required',
                      })}
                      defaultValue={props.metric.healthyValue}
                    />
                    {errors?.healthyValue && (
                      <p className="text-red-500 text-xs ">
                        {errors.healthyValue.message}
                      </p>
                    )}
                  </div>
                  <div className="mb-2 pr-4">
                    <label className="inline-flex items-center text-gray-700 text-sm font-bold mb-2">
                      <input
                        type="checkbox"
                        className="form-checkbox"
                        {...register('nonFatal')}
                      />
                      <span className="ml-2">Non Fatal</span>
                    </label>
                  </div>
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

export default edit;
