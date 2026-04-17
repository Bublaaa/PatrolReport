import { useAuthStore } from "../stores/auth.store.js";
import { Outlet } from "react-router-dom";
import { LucideLogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "../components/button.jsx";
import LanguageToggleButton from "../components/language.toggle.button.jsx";
import MenuLink from "../components/menu.link.jsx";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const menuLinks = [
    { label: t("menu_link.user"), icon: "Users", href: "/admin/user" },
    {
      label: t("menu_link.work_location"),
      icon: "Building2",
      href: "/admin/work-location",
    },
    {
      label: t("menu_link.patrol_point"),
      icon: "MapPin",
      href: "/admin/patrol-point",
    },
    {
      label: t("menu_link.report"),
      icon: "ClipboardList",
      href: "/admin/report",
    },
    { label: t("menu_link.setting"), icon: "Settings", href: "/admin/setting" },
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
      <div className="max-w-3xl w-full mx-auto h-fit p-3">
        <div className="flex flex-col gap-5">
          <div className="flex flex-row justify-between bg-white rounded-lg bg-white shadow-md px-6 py-4">
            <h5>
              {loggedInUserDetail.firstName} {loggedInUserDetail.lastName}
            </h5>
            <div className="flex flex-row gap-5 items-center">
              <LanguageToggleButton />
              <Button
                buttonSize="small"
                buttonType="secondary"
                icon={LucideLogOut}
                onClick={handleLogout}
              ></Button>
            </div>
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
