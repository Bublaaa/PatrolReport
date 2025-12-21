import { useAuthStore } from "../stores/auth.store.js";
import { Outlet } from "react-router-dom";
import { LucideLogOut } from "lucide-react";
import { useState } from "react";
import Button from "../components/button.jsx";
import MenuLink from "../components/menu.link.jsx";

const AdminDashboard = () => {
  const menuLinks = [
    { label: "User", icon: "Users", href: "/admin/user" },
    { label: "Patrol Point", icon: "MapPin", href: "/admin/patrol-point" },
    { label: "Report", icon: "ClipboardList", href: "/admin/report" },
  ];
  const { userDetail, logout } = useAuthStore();
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return (
    <div className="w-full h-screen items-end bg-white-shadow">
      <div className="max-w-3xl w-full mx-auto h-fit p-3">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between bg-white rounded-lg bg-white shadow-md px-6 py-4">
            <h5>
              {userDetail.firstName} {userDetail.lastName}
            </h5>
            <Button
              buttonSize="small"
              buttonType="secondary"
              icon={LucideLogOut}
              onClick={handleLogout}
            ></Button>
          </div>
          {/* NAVIGATION */}
          <MenuLink links={menuLinks} />
          {/* CONTENT */}
          <div className="flex justify-center items-start w-full h-full overflow-y-auto scrollbar-hidden p-2 pb-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
