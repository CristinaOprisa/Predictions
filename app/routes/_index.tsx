import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ListDataFiles } from "~/services/exchange";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const data = await ListDataFiles();

  console.log(data);
  return json(data);
};



export default function Index() {
  const receivedData = useLoaderData() as any;
  console.log("recivedData:" + JSON.stringify(receivedData));
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Data: 
          </h1>
          <p>{JSON.stringify(receivedData)}</p>


        </header>

      </div>
    </div>
  );
}


