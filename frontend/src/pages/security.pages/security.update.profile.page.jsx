import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/auth.store";
import { motion } from "framer-motion";
import { LockIcon, User } from "lucide-react";
import { TextInput, CheckboxInput } from "../../components/inputs";
import bcrypt from "bcryptjs";
import toast from "react-hot-toast";
import Button from "../../components/button";

const ProfilePage = () => {
  // * USE STORE
  const { loggedInUserDetail, updateProfile, getAuthDetail } = useAuthStore();

  // * USE NAVIGATE
  const navigate = useNavigate();

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
      toast.error("Failed to update account", error);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" w-full bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mx-2"
    >
      <div className="p-8">
        <h4 className="mb-6 text-center bg-clip-text">Update Account</h4>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
            <div className="space-y-5">
              <TextInput
                label={"Username"}
                icon={User}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="space-y-5">
              <TextInput
                label={"First Name"}
                type="text"
                placeholder="Fist Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <TextInput
                label={"Middle Name"}
                type="text"
                placeholder="Middle Name"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
              />
              <TextInput
                label={"Last Name"}
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <CheckboxInput
            name="changePassword"
            label=""
            options={[{ label: "Change Password", value: true }]}
            initialValue={[isChangePassword]}
            onChange={(e) => setIsChangePassword(e.target.checked)}
          />

          {isChangePassword && (
            <div className="grid grid md:grid-cols-2 grid-cols-1 gap-2">
              <TextInput
                icon={LockIcon}
                label={"Old Password"}
                type="password"
                placeholder="Old Password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <TextInput
                icon={LockIcon}
                label={"New Password"}
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          )}

          <Button
            buttonSize="full"
            buttonType="primary"
            type="submit"
            className="w-full"
          >
            Save
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default ProfilePage;
