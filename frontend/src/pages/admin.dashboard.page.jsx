import { useAuthStore } from "../stores/auth.store.js";
import { Outlet } from "react-router-dom";
// import MenuLink from "../components/menu.link.jsx";

const AdminDashboard = () => {
  const menuLinks = [
    { label: "User", icon: "", path: "/user" },
    { label: "Patrol Point", icon: "", path: "/patrol-point" },
    { label: "Report", icon: "", path: "/report" },
  ];

  const { userDetail } = useAuthStore();
  console.log("Admin Dashboard User Detail:", userDetail);
  return (
    <div className="w-full flex flex-col h-screen items-end">
      {/* CONTENT */}
      <div className="flex justify-center items-end w-full h-full overflow-y-auto scrollbar-hidden pb-10">
        <Outlet />
      </div>
      {/* NAVIGATION */}
      <div className="max-w-md w-full mx-auto h-fit">
        <h1>ADMIN</h1>
        {/* <MenuLink links={links} /> */}
      </div>
    </div>
  );
};
export default AdminDashboard;
