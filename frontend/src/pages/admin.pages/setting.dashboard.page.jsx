import { FolderCogIcon, Loader } from "lucide-react";
import { useSystemSettingStore } from "../../stores/system.setting.store";
import { useEffect } from "react";
import { PenBoxIcon } from "lucide-react";
import { Languages } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Button from "../../components/button";
import LanguageToggleButton from "../../components/language.toggle.button";

const SettingPageDashboard = () => {
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
      <StorageSetting systemSettingDetail={systemSettingDetail} />
      <LanguageSetting />
    </div>
  );
};
const StorageSetting = ({ systemSettingDetail }) => {
  const { t } = useTranslation();
  const DRIVE_URL_PREFIX = "https://drive.google.com/drive/u/0/folders/";
  return (
    <div className="flex flex-col bg-white rounded-lg px-6 py-4 shadow-md justify-between items-center gap-5">
      <div className="flex flex-row gap-5 w-full items-center">
        <FolderCogIcon />
        <h6 className="mr-auto">{t("setting_page.storage_setting")}</h6>
        <NavLink to={`/admin/setting/drive-link/update`}>
          <Button buttonType="secondary" buttonSize="icon" icon={PenBoxIcon} />
        </NavLink>
      </div>
      <div className="flex flex-wrap gap-5 w-full items-center">
        <p className="max-w-full break-words">
          {t("setting_page.drive_link_label")}
        </p>
        <p className="max-w-full break-words">
          {DRIVE_URL_PREFIX}
          {systemSettingDetail}
        </p>
        <a
          href={`${DRIVE_URL_PREFIX}${systemSettingDetail}`}
          buttonType="secondary"
          target="_blank"
          rel="noopener noreferrer"
        >
          {t("setting_page.open_drive_folder_button_label")}
        </a>
      </div>
    </div>
  );
};

const LanguageSetting = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col bg-white rounded-lg px-6 py-4 shadow-md justify-between items-center gap-5">
      <div className="flex flex-row gap-5 w-full items-center">
        <Languages />
        <h6 className="mr-auto">{t("setting_page.language_setting")}</h6>
      </div>
      <div className="flex flex-col gap-5 w-full">
        <p>{t("setting_page.change_language_label")}</p>
        <LanguageToggleButton />
      </div>
    </div>
  );
};
export default SettingPageDashboard;
