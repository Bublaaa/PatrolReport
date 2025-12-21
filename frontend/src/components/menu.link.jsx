import * as LucideIcons from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";

const MenuLink = ({ links }) => {
  const { logout } = useAuthStore();
  const handleLogout = () => {
    logout();
  };
  const location = useLocation();
  return (
    <ul className="flex flex-wrap w-full px-2 pb-4 gap-2 overflow-y-auto font-medium">
      {links.map((link, index) => {
        const isActive = location.pathname === link.href;
        const IconComponent = LucideIcons[link.icon] || LucideIcons.Menu;
        return (
          <NavLink
            to={link.href}
            key={index}
            className={`flex w-fit items-center transition-colors duration-200 group ${
              isActive
                ? "text-accent hover:text-accent-hover"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <li className="flex flex-row w-fit items-center px-3 shadow-lg py-3 justify-between bg-white rounded-lg hover:bg-gray-100">
              <IconComponent className="w-5 h-5  group-hover:scale-110 transition duration-75 mr-3" />
              <h6
                className={`text-sm font-medium ${
                  isActive
                    ? "text-accent hover:text-accent-hover"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </h6>
            </li>
          </NavLink>
        );
      })}
      <li
        className="flex flex-row w-fit items-center px-3 shadow-lg py-3 justify-between bg-red-300 rounded-lg  text-red-600 hover:bg-red-400"
        onClick={handleLogout}
      >
        <LucideIcons.LogOut className="w-5 h-5  group-hover:scale-110 transition duration-75 mr-3" />
        <h6 className=" text-sm font-medium text-white">Logout</h6>
      </li>
    </ul>
  );
};

export default MenuLink;
