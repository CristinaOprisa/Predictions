import { Link } from "@remix-run/react";
import { useState } from "react";

export default function Index(this: any) {

  const [nf, setNf] = useState(1);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-16">
        <header className="flex flex-col items-center gap-9">
          <h1 className="leading text-2xl font-bold text-gray-800 dark:text-gray-100">
            Select recommended number of files to be sampled per Stock Exchange: 
          </h1>
        </header>
        <p>
            <select 
              onChange={(event) => setNf(parseInt(event.target.value))}
              defaultValue={"1"}
            >
              <option value="1">1</option>
              <option value="2">2</option>
            </select>
          </p>
        <p>
        <Link to={`/processfiles/${nf}`}>
          <span className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
            Predict
          </span>
        </Link>
        </p>
      </div>
    </div>
  );
}


