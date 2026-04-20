import { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/auth.store";
import { motion } from "framer-motion";
import { LockIcon, User, Languages, User2 } from "lucide-react";
import { TextInput, CheckboxInput } from "../../components/inputs";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "../../components/button";
import LanguageToggleButton from "../../components/language.toggle.button";

const ProfilePage = () => {
  return (
    <div className="flex flex-col w-full gap-5">
      <UpdateProfile />
      <LanguageSetting />
    </div>
  );
};

const UpdateProfile = () => {
  const { t } = useTranslation();
  // * USE STORE
  const { loggedInUserDetail, updateProfile, getAuthDetail } = useAuthStore();

  // * USE STATE
  const [username, setUsername] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  const [isChangePassword, setIsChangePassword] = useState(false);

  //* USE EFFECT
  useEffect(() => {
    if (loggedInUserDetail) {
      setUsername(loggedInUserDetail.username);
      setFirstName(loggedInUserDetail.firstName);
      setMiddleName(loggedInUserDetail.middleName);
      setLastName(loggedInUserDetail.lastName);
    }
  }, [loggedInUserDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedProfile = await updateProfile(
        loggedInUserDetail._id,
        username,
        firstName,
        middleName,
        lastName,
        oldPassword,
        newPassword,
      );
      if (updatedProfile) {
        await getAuthDetail(loggedInUserDetail._id);
        setOldPassword("");
        setNewPassword("");
        setIsChangePassword(false);
      }
    } catch (error) {
      toast.error(t("failed_to_update_profile"), error);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col bg-white rounded-lg px-6 py-4 shadow-md justify-between items-center gap-5"
    >
      <div className="flex flex-row gap-5 w-full items-center">
        <User2 />
        <h6 className="mr-auto">{t("update_profile_page.title")}</h6>
      </div>
      <form className="w-full space-y-10" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <TextInput
            label={t("update_profile_page.first_name_label")}
            type="text"
            placeholder={t("update_profile_page.first_name_placeholder")}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextInput
            label={t("update_profile_page.middle_name_label")}
            type="text"
            placeholder={t("update_profile_page.middle_name_placeholder")}
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <TextInput
            label={t("update_profile_page.last_name_label")}
            type="text"
            placeholder={t("update_profile_page.last_name_placeholder")}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </div>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 items-end justify-between">
            <TextInput
              label={t("update_profile_page.username_label")}
              icon={User}
              type="text"
              placeholder={t("update_profile_page.username_placeholder")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <CheckboxInput
              name="changePassword"
              label=""
              options={[
                {
                  label: t(
                    "update_profile_page.change_password_checkbox_label",
                  ),
                  value: true,
                },
              ]}
              initialValue={[isChangePassword]}
              onChange={(e) => setIsChangePassword(e.target.checked)}
            />
          </div>

          {isChangePassword && (
            <div className="grid grid md:grid-cols-2 grid-cols-1 gap-2">
              <TextInput
                icon={LockIcon}
                label={t("update_profile_page.old_password_label")}
                type="password"
                placeholder={t("update_profile_page.old_password_placeholder")}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <TextInput
                icon={LockIcon}
                label={t("update_profile_page.new_password_label")}
                type="password"
                placeholder={t("update_profile_page.new_password_placeholder")}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          )}
        </div>

        <Button
          buttonSize="full"
          buttonType="primary"
          type="submit"
          className="w-full"
        >
          {t("update_profile_page.save_button_label")}
        </Button>
      </form>
    </motion.div>
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

export default ProfilePage;
