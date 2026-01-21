import { FolderCogIcon, Link, Loader, UserCog2 } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { useUserStore } from "../../stores/user.store";
import { useSystemSettingStore } from "../../stores/system.setting.store";
import { useEffect } from "react";
import { Trash2, PenBoxIcon, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { toTitleCase } from "../../utils/toTitleCase";
import Button from "../../components/button";

const SettingPageDashboard = () => {
  const DRIVE_URL_PREFIX = "https://drive.google.com/drive/u/0/folders/";
  //* USE STORE
  const {
    users: admins,
    getAllAuth,
    isLoading: isAdminLoading,
  } = useAuthStore();
  const { users, fetchUsers, isLoading: isUserLoading } = useUserStore();
  const {
    systemSettingDetail,
    fetchDriveFolderId,
    isLoading: isSystemSettingLoading,
  } = useSystemSettingStore();

  function fetchInitialData() {
    fetchUsers();
    getAllAuth();
    fetchDriveFolderId();
  }
  //* USE EFFECT
  useEffect(() => {
    fetchInitialData();
  }, []);

  if (isAdminLoading || isUserLoading || isSystemSettingLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }
  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex flex-row bg-white rounded-lg px-6 py-4 shadow-md justify-between items-center gap-5">
        <h5>Setting Dashboard</h5>
      </div>
      <div className="flex flex-col bg-white rounded-lg px-6 py-4 shadow-md justify-between items-start gap-5">
        <div className="flex flex-row gap-5 items-center w-full">
          <UserCog2 />
          <h6 className="mr-auto">Users Setting</h6>
          <NavLink to={"/admin/user/add"}>
            <Button buttonType="primary" buttonSize="medium" icon={Plus}>
              Add User
            </Button>
          </NavLink>
        </div>
        {users.length === 0 && (
          <p className="text-center mt-4">No users found.</p>
        )}
        <div
          className="flex flex-col gap-2 w-full justify-between pt-2"
          onClick={(e) => handleDeleteAction(e)}
        >
          {users.length > 0 &&
            users.map((user) => (
              <div
                key={user._id}
                className="flex flex-row gap-4 px-3 py-2 hover:bg-gray-100 rounded-md justify-between items-center cursor-pointer"
              >
                <p>{toTitleCase(user.position)}</p>
                <p>
                  {user.firstName} {user.middleName} {user.lastName}
                </p>
                <div className="flex flex-row gap-2">
                  <Button
                    className="delete-btn"
                    buttonSize="small"
                    buttonType="danger"
                    icon={Trash2}
                    data-id={user._id}
                    data-name={user.firstName}
                  ></Button>
                  <NavLink to={`/admin/user/${user._id}`}>
                    <Button
                      buttonType="secondary"
                      buttonSize="icon"
                      icon={PenBoxIcon}
                    />
                  </NavLink>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="flex flex-col bg-white rounded-lg px-6 py-4 shadow-md justify-between items-center gap-5">
        <div className="flex flex-row gap-5 w-full items-center">
          <FolderCogIcon />
          <h6 className="mr-auto">Storage Setting</h6>
          <NavLink to={`/admin/setting/drive-link/update`}>
            <Button
              buttonType="secondary"
              buttonSize="icon"
              icon={PenBoxIcon}
            />
          </NavLink>
        </div>
        <div className="flex flex-wrap gap-5 w-full items-center">
          <p className="max-w-full break-words">
            Drive link: {DRIVE_URL_PREFIX}${systemSettingDetail}
          </p>
          <a
            href={`${DRIVE_URL_PREFIX}${systemSettingDetail}`}
            buttonType="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Drive Folder
          </a>
        </div>
      </div>
    </div>
  );
};
export default SettingPageDashboard;
