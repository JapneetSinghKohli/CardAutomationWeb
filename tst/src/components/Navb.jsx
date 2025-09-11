import { useState } from "react";
import { Squash as Hamburger } from 'hamburger-react'
import {Link,Navlink} from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="bg-white border-b-1 shadow-sm">
      <div className="md:w-full  mx-auto px-4 md:px-6 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className=" w-20 pl-0 flex-shrink-0 text-lg font-bold">Logo</div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <a href="#" className="hover:text-blue-600">Dashboard</a>
            <a href="#" className="hover:text-blue-600">Key Management</a>

            {/* Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <button className="hover:text-blue-600 hover:cursor-pointer">Access</button>
              {dropdownOpen && (
                <div className="absolute left-[-50px] mt-0 w-45 bg-white shadow-lg rounded-md p-2">
                  <a href="#" className="block px-4 py-2 hover:text-blue-600 hover:cursor-pointer hover:bg-gray-100">Access Logs</a>
                  <a href="#" className="block px-4 py-2 hover:text-blue-600 hover:cursor-pointer hover:bg-gray-100">Access Requests</a>
                  <a href="#" className="block px-4 py-2 hover:text-blue-600 hover:cursor-pointer hover:bg-gray-100">NFC Access</a>
                </div>
              )}
            </div>

            <a href="#" className="hover:text-blue-600">Members</a>
            <a href="#" className="hover:text-blue-600">Settings</a>
          </div>

          {/* Right: Auth buttons */}
          <div className="hidden md:flex space-x-4">
            <button className="hover:text-blue-600">Log in</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Sign up
            </button>
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)}>
             <Hamburger size={24} toggled={isOpen} toggle={setIsOpen} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          <a href="#" className="block hover:text-blue-600">Dashboard</a>
          <a href="#" className="block hover:text-blue-600">Key Management</a>
          
          {/* Dropdown (clickable for mobile) */}
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full text-left hover:text-blue-600"
            >
              Access
            </button>
            {dropdownOpen && (
              <div className="ml-4 space-y-1">
                <a href="#" className="block hover:text-blue-600">Access Logs</a>
                <a href="#" className="block hover:text-blue-600">Access Requests</a>
                <a href="#" className="block hover:text-blue-600">NFC Access</a>
              </div>
            )}
          </div>

          <a href="#" className="block hover:text-blue-600">Members</a>
          <a href="#" className="block hover:text-blue-600">Settings</a>

          <div className="pt-2 flex space-x-4">
            <button className="hover:text-blue-600 border-blue-600 border-2 px-4 py-2 rounded-md">Log in</button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
              Sign up
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
