// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import { IconSearch, } from "@tabler/icons-react";

// export default function AccessRequests() {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const log = location.state?.log;

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Access Request</h1>

//       {log ? (
//         <div className="bg-white rounded-lg shadow-sm border p-6">
//           <p className="text-lg font-semibold">{log.user}</p>
//           <p className="text-gray-600">{log.location}</p>
//           <p className="text-sm text-gray-500 mt-2">
//             {log.method} • {new Date(log.timestamp).toLocaleString()}
//           </p>
//           {log.details && (
//             <p className="text-gray-500 mt-2">{log.details}</p>
//           )}

//           <div className="mt-6 flex gap-4">
//             <button
//               className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
//               onClick={() => alert("Approved")}
//             >
//               Approve
//             </button>
//             <button
//               className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
//               onClick={() => alert("Denied")}
//             >
//               Deny
//             </button>
//             <button
//               className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300"
//               onClick={() => navigate(-1)}
//             >
//               Back
//             </button>
//           </div>
//         </div>
//       ) : (
//         <p className="text-gray-500">No request selected.</p>
//       )}
//     </div>
//   );
// }
