import { FolderCogIcon, Loader } from "lucide-react";
import { useSystemSettingStore } from "../../stores/system.setting.store";
import { useEffect } from "react";
import { PenBoxIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import Button from "../../components/button";

const SettingPageDashboard = () => {
  const DRIVE_URL_PREFIX = "https://drive.google.com/drive/u/0/folders/";
  //* USE STORE
  const {
    systemSettingDetail,
    fetchDriveFolderId,
    isLoading: isSystemSettingLoading,
  } = useSystemSettingStore();

  function fetchInitialData() {
    fetchDriveFolderId();
  }
  //* USE EFFECT
  useEffect(() => {
    fetchInitialData();
  }, []);

  if (isSystemSettingLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }
  return (
    <div className="flex flex-col w-full gap-5">
      <div className="flex flex-row bg-white rounded-lg px-6 py-4 shadow-md justify-between items-center gap-5">
        <h5>Setting Dashboard</h5>
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
