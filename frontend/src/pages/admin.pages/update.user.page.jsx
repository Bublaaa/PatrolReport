import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { TextInput, DropdownInput } from "../../components/inputs.jsx";
import { useAuthStore } from "../../stores/auth.store.js";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import { User } from "lucide-react";
import {
  buildDropdownOptions,
  buildPositionDropdownOptions,
} from "../../utils/constants.js";
import Button from "../../components/button.jsx";

const UserDetailPage = () => {
  const { t } = useTranslation();
  // * USE PARAMS
  const { id } = useParams();

  // * USE NAVIGATE
  const navigate = useNavigate();

  // * USE STORE
  const { userDetail, getAuthDetail, updateAuth } = useAuthStore();
  const { workLocations, fetchWorkLocations } = useWorkLocationStore();

  // * USE STATE
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState();
  const [selectedWorkLocation, setSelectedWorkLocation] = useState();

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    getAuthDetail(id);
    fetchWorkLocations();
  }, [id, getAuthDetail]);

  useEffect(() => {
    if (userDetail) {
      setUsername(userDetail.username);
      setFirstName(userDetail.firstName);
      setMiddleName(userDetail.middleName);
      setLastName(userDetail.lastName);
      setSelectedPosition(userDetail.position);
      setSelectedWorkLocation(userDetail.workLocationId);
    }
  }, [userDetail]);

  const workLocationOptions = useMemo(() =>
    buildDropdownOptions(workLocations),
  );
  const positionOptions = useMemo(() => buildPositionDropdownOptions());

  // * FORM SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !username ||
      !firstName ||
      !lastName ||
      !selectedWorkLocation ||
      !selectedPosition
    ) {
      toast.error(t("error.all_fields_required"));
      return;
    }
    try {
      const updatedAuth = await updateAuth(
        id,
        username,
        firstName,
        middleName,
        lastName,
        selectedPosition,
        selectedWorkLocation,
      );
      if (updatedAuth) {
        setTimeout(() => {
          navigate(-1);
        }, 1000);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSelectPosition = (e) => {
    setSelectedPosition(e.target.value);
  };
  const handleSelectWorkLocation = (e) => {
    setSelectedWorkLocation(e.target.value);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" w-full bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mx-2"
    >
      <div className="p-8">
        <h4 className="mb-6 text-center bg-clip-text">
          {t("update_user_page.title")}
        </h4>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
            <div className="space-y-5">
              <TextInput
                icon={User}
                type="text"
                placeholder={t("update_user_page.username_placeholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <DropdownInput
                name="workLocation"
                value={selectedWorkLocation}
                options={workLocationOptions}
                placeholder={t("update_user_page.work_location_placeholder")}
                onChange={handleSelectWorkLocation}
              />
              <DropdownInput
                name="position"
                value={selectedPosition}
                options={positionOptions}
                placeholder={t("update_user_page.position_placeholder")}
                onChange={handleSelectPosition}
              />
            </div>
            <div className="space-y-5">
              <TextInput
                icon={User}
                type="text"
                placeholder={t("update_user_page.first_name_placeholder")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextInput
                icon={User}
                type="text"
                placeholder={t("update_user_page.middle_name_placeholder")}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <TextInput
                icon={User}
                type="text"
                placeholder={t("update_user_page.last_name_placeholder")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <Button
            buttonSize="full"
            buttonType="primary"
            type="submit"
            className="w-full"
          >
            {t("update_user_page.update_user_button_label")}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};
export default UserDetailPage;
