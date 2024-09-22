import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, useLoaderData, Link } from "@remix-run/react";

type LoaderResponse = {
  response?: {
    nf: string
  };
  error?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {

  if (!params.nf) {return json ({error: "Missing number of files to be processed"})}
  if (params.nf != "1" && params.nf != "2") {return json ({error: "Invalid number of files to be processed"})}

  const r = {
    response: {
      nf: params.nf
    }
  } as LoaderResponse;

  return json (r);
};

export default function RouteComponent(){
  const data = useLoaderData<typeof loader>() as LoaderResponse;
  if (data.error) {
    return (
      <>
        <div>Error: {data.error}</div>  
        <br/>     
        <Link to="/">
          <span className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            Return to Prediction
          </span>
        </Link>
      </>
    );
  } else {
    return (
      <>
        <div>nf: {data.response?.nf}</div>
        <br/>
        <Link to="/">
          <span className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            New Prediction
          </span>
        </Link>
      </>
    );
  }
}