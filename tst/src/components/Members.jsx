import React from 'react'
import {useState, useEffect} from "react";
import { IconUserPlus,IconUser,IconSearch,IconMail,IconCalendar } from '@tabler/icons-react';


function SummaryCard({ title, value,txtcolor }) {
  return (
    <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        <IconUser className="h-5 w-5 text-gray-400 " />
      </div>

      <p className={`mt-2 text-3xl font-bold text-black}`}>{value}</p>

      
    </div>
  );
}





function Members() {
  const [data, setData]=useState(null);

  useEffect(()=>{
    fetch("/data.json")
      .then((res)=>res.json())
      .then((json)=>setData(json));
  }, [data]);

  if (data==null){
    return <p className="p-4">Loading...</p>;
  } 


  return (
    <div>
      <div className='flex items-center justify-between ml-3 mt-7'>
         <div className=' text-3xl font-bold text-black'>
            Member Management
         </div>
         <button className=' hidden md:flex md:bg-black md:mr-5 md:text-white md:px-4 md:py-2 md:rounded-md md:hover:cursor-pointer md:hover:bg-gray-600'>
            <div className='flex items-center space-x-2'>
                <IconUserPlus size={20}/>
                <p className='text-md font-medium'>
                  Add Member
                </p>
            </div>
         </button>
      </div>
      <p className='ml-3 mt-2 text-md text-gray-600'>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tempora?
      </p>
      <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-2 lg:grid-cols-4" >
        <SummaryCard
          title="Total Members"
          value="40"
          // txtcolor="text-black"
        />
        <SummaryCard
          title="Active Members"
          value="40"
          // txtcolor="text-green-600"
        />
        <SummaryCard
          title="Coordinators"
          value="40"
          // txtcolor="text-blue-600"
        />
        <SummaryCard
          title="Mentors"
          value="40"
          // txtcolor="text-black"
        />
      </div>
      <div className=" flex flex-col md:flex-row items-center md:justify-between mt-2">
        <p className="w-full p-1 pl-4 text-2xl font-bold text-black">
          Club Members
        </p>
        <div className=" w-full md:w-4/10  mx-auto px-5 py-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/4 text-gray-400 h-5 w-5" />
            <input
            type="text"
            placeholder="Search members..."
            name="member_search"
            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      
    </div>
  )
}

export default Members
