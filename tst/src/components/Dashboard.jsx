import React, {useState, useEffect} from "react";
import {IconKey} from "@tabler/icons-react";

function SummaryCard({ title, value, subtitle }) {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <IconKey className="h-5 w-5 text-gray-400" />
      </div>

      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>

      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData]=useState(null);

  useEffect(()=>{
    fetch("/data.json")
      .then((res)=>res.json())
      .then((json)=>setData(json));
  }, [data]);

  const getStatusClasses=(status)=>{
    if (status==="available") {
      return "bg-green-100 text-green-700";
    }
    else if (status==="in_use") {
      return "bg-yellow-100 text-yellow-700";
    }
    else if (status==="maintenance") {
      return "bg-red-100 text-red-700";
    }
    else {
      return "bg-gray-100 text-gray-700";
    }
  };

  if (data==null){
    return <p className="p-4">Loading...</p>;
  } 

  return (
    <div>
      <div className="ml-5 mt-7">
        <p className="text-3xl font-bold text-black">Welcome Back, Japneet!</p>
        <p className="text-md text-gray-600 mt-2">
          Manage keys and members for your club.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Total Keys"
          value={data.key.total}
          subtitle={`${data.key.available} available, ${data.key.in_use} in use, ${data.key.maintenance} maintenance`}
        />
        <SummaryCard
          title="Available"
          value={data.key.available}
          subtitle="Keys currently available"
        />
        <SummaryCard
          title="In Use"
          value={data.key.in_use}
          subtitle="Keys currently in use"
        />
        <SummaryCard
          title="Maintenance"
          value={data.key.maintenance}
          subtitle="Keys under maintenance"
        />
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between p-4 sm:items-start">
        <div className="bg-white w-full md:w-[50%] m-4 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Key Status</h2>
          <p className="text-sm text-gray-500 mb-4">
            Current status of all keys
          </p>

          <div className="space-y-3 md:min-h-[365px]">
            {Object.entries(data.key_status).slice(0, 4).map(([club, status], idx)=>(
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg shadow-sm">
                <div>
                  <h3 className="font-medium">{club}</h3>
                  <p className="text-sm text-gray-500">Slot {idx + 1}</p>
                </div>

                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusClasses(
                    status
                  )}`}
                >
                  {status==="in_use" ? "In Use" : status==="available" ? "Available" : "Maintenance"}
                </span>
              </div>
            ))}
          </div>

          <button className="mt-4 w-1/2 mx-auto block border rounded-lg py-2 hover:bg-gray-100 hover:cursor-pointer">
            Manage All Keys
          </button>
        </div>
        <div className="bg-white w-full md:w-[50%] m-4 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Activity</h2>
          <p className="text-sm text-gray-500 mb-4">
            View Recent Activity
          </p>

          <div className="space-y-3 md:min-h-[365px]">
            {data.recent_activity.slice(0,4).map((activity, idx)=>(
              <div key={idx} className="p-4 bg-gray-100 rounded-lg">
                <p className="font-medium">
                  {activity.user} {activity.action} key for {activity.location}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.method} • {activity.time}
                </p>
              </div>
            ))}
          </div>

          <button className="mt-4 w-1/2 mx-auto block border rounded-lg py-2 hover:bg-gray-100 hover:cursor-pointer">
            View All Activity
          </button>
        </div>
      </div>
    </div>
  );
}
