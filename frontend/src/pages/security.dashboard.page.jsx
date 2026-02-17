import { useAuthStore } from "../stores/auth.store.js";
import { Outlet } from "react-router-dom";
import { LucideLogOut } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/button.jsx";
import MenuLink from "../components/menu.link.jsx";

const SecurityDashboard = () => {
  const menuLinks = [
    { label: "Scan", icon: "MapPin", href: "/security/scan" },
    { label: "Setting", icon: "Settings", href: "/security/setting" },
  ];
  const { loggedInUserDetail, logout } = useAuthStore();
  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await logout();
    } catch (error) {
      toast.error("Logout failed: ", error);
    }
  };
  return (
    <div className="w-full h-screen items-end bg-white-shadow overflow-y-auto scrollbar-hidden">
      <div className="max-w-3xl w-full mx-auto h-fit">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between bg-white rounded-lg bg-white shadow-md px-6 py-4">
            <h5>
              {loggedInUserDetail.firstName} {loggedInUserDetail.lastName}
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
          <div className="flex justify-center items-start w-full h-full overflow-y-auto scrollbar-hidden pb-10">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};
export default SecurityDashboard;
