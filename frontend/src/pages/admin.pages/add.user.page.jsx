import { motion } from "framer-motion";
import { Loader, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TextInput, DropdownInput } from "../../components/inputs.jsx";
import { useEffect, useState, useMemo } from "react";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { useAuthStore } from "../../stores/auth.store.js";
import { useTranslation } from "react-i18next";
import {
  buildDropdownOptions,
  buildPositionDropdownOptions,
} from "../../utils/constants.js";
import Button from "../../components/button.jsx";
import toast from "react-hot-toast";

const AddUserPage = () => {
  const { t } = useTranslation();
  // * USE NAVIGATE
  const navigate = useNavigate();

  // * USE STATE
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedWorkLocation, setSelectedWorkLocation] = useState();
  const [selectedPosition, setSelectedPosition] = useState();

  // * USE STORE
  const {
    createAuth,
    error: authError,
    isLoading: isAuthLoading,
  } = useAuthStore();
  const {
    workLocations,
    fetchWorkLocations,
    isLoading: isWorkLocationLoading,
    error: workLocationError,
  } = useWorkLocationStore();

  useEffect(() => {
    fetchWorkLocations();
  }, []);

  const workLocationOptions = useMemo(() =>
    buildDropdownOptions(workLocations),
  );
  const positionOptions = useMemo(() => buildPositionDropdownOptions());

  // * HANDLE CREATE USER
  const handleSignUp = async (e) => {
    e.preventDefault();
    if (
      !username ||
      !password ||
      !firstName ||
      !lastName ||
      !selectedWorkLocation ||
      !selectedPosition
    ) {
      toast.error(t("error.all_fields_required"));
      return;
    }
    try {
      const newAccount = await createAuth(
        username,
        password,
        firstName,
        middleName,
        lastName,
        selectedWorkLocation,
        selectedPosition,
      );
      if (newAccount) {
        // toast.success("User created");
        navigate(-1);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const handleSelectWorkLocation = (e) => {
    setSelectedWorkLocation(e.target.value);
  };
  const handleSelectPosition = (e) => {
    setSelectedPosition(e.target.value);
  };
  useEffect(() => {
    if (positionOptions.length > 0) {
      setSelectedPosition(positionOptions[0].value);
    }

    if (workLocationOptions.length > 0) {
      setSelectedWorkLocation(workLocationOptions[0].value);
    }
  }, []);

  if (isWorkLocationLoading || isAuthLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-auto scrollbar-hidden mx-2"
    >
      <div className="p-8">
        <h2 className="mb-6 text-center bg-clip-text">
          {t("add_user_page.title")}
        </h2>

        <form className="space-y-5" onSubmit={handleSignUp}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
            <div className="space-y-5">
              <TextInput
                icon={User}
                type="text"
                placeholder={t("add_user_page.username_placeholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <TextInput
                icon={Lock}
                type="password"
                placeholder={t("add_user_page.password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <DropdownInput
                name="workLocation"
                value={selectedWorkLocation}
                options={workLocationOptions}
                placeholder={t("add_user_page.work_location_placeholder")}
                onChange={handleSelectWorkLocation}
              />
              <DropdownInput
                name="position"
                value={selectedPosition}
                options={positionOptions}
                placeholder={t("add_user_page.position_placeholder")}
                onChange={handleSelectPosition}
              />
            </div>
            <div className="space-y-5">
              <TextInput
                icon={User}
                type="text"
                placeholder={t("add_user_page.first_name_placeholder")}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextInput
                icon={User}
                type="text"
                placeholder={t("add_user_page.middle_name_placeholder")}
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <TextInput
                icon={User}
                type="text"
                placeholder={t("add_user_page.last_name_placeholder")}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          {authError && (
            <p className="text-red-500 font-semibold mt-2">{authError}</p>
          )}
          {/* <PasswordStrengthMeter password={password} /> */}

          <Button
            buttonSize="medium"
            buttonType="primary"
            type="submit"
            disabled={isWorkLocationLoading || isAuthLoading}
          >
            {isAuthLoading ? (
              <Loader className="w-6h-6 animate-spin mx-auto" />
            ) : (
              t("add_user_page.add_user_button_label")
            )}
          </Button>
        </form>
      </div>
      {/* <div className="px-8 py-4 bg-white-shadow flex justify-center">
        <p className="text-sm text-gray-400">
          Already have an account?{" "}
          <Link to={"/login"} className="text-accent hover:underline">
            Login
          </Link>
        </p>
      </div> */}
    </motion.div>
  );
};
export default AddUserPage;
