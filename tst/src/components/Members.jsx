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

function MemberCard({ member }) {
  return (
    <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-md">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:flex md:flex-row md:items-center md:justify-between">
        <div className="flex items-center space-x-2">
          {/* Avatar initials */}
          <div className="h-12 w-12 flex items-center justify-center rounded-full bg-gray-200 text-lg font-bold text-gray-700">
            {member.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {member.name}
            </h2>
            <p className="text-sm text-gray-500 flex items-center space-x-2">
              <IconMail size={14} /> <span>{member.email}</span>
            </p>
          </div>
        </div>

        {/* Status + Role */}
        <div className="flex items-center space-x-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              member.active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {member.active ? "Active" : "Inactive"}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {member.role}
          </span>
        </div>
      </div>

      {/* Info section */}
      <div className="flex items-center justify-between mt-4 mx-2">
        <div className="flex items-center space-x-2 text-gray-600">
          <IconCalendar size={16} />
          <p className="text-sm">Joined: {member.Joined}</p>
        </div>
        <div className="flex items-center space-x-2 text-gray-600">
          <IconUser size={16} />
          <p className="text-sm">Role: {member.role}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3 mt-5">
        <button className="px-3 py-1 rounded-md border text-sm text-gray-700 hover:bg-gray-100">
          Edit
        </button>
        <button className="px-3 py-1 rounded-md border border-red-500 text-sm text-red-600 hover:bg-red-50">
          Remove
        </button>
      </div>
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
      <div className='w-full px-3 items-center mx-auto '>
        <div className="flex flex-col items-center gap-4 md:grid md:gap-6 md:grid-cols-2 ">
          {data.robo_club_members.slice(0,4).map((member, index) => (
            <MemberCard key={index} member={member} />
        ))}
        </div>
      </div>
      <button className="mt-6 mb-8 w-3/10 mx-auto block border rounded-lg py-2 hover:bg-gray-100 hover:cursor-pointer">
            View More
      </button>
      
    </div>
  )
}

export default Members
