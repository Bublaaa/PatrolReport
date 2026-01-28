import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Loader, LockIcon } from "lucide-react";
import { motion } from "framer-motion";
import { TextInput } from "../../components/inputs.jsx";
import { User } from "lucide-react";
import { useUserStore } from "../../stores/user.store.js";
import { useAuthStore } from "../../stores/auth.store";
import { toTitleCase } from "../../utils/toTitleCase";
import Button from "../../components/button.jsx";
import toast from "react-hot-toast";

const AddAdminAccountPage = () => {
  // * USE PARAMS
  const { id } = useParams();
  const navigate = useNavigate();

  //* USE STORE
  const { userDetail, isLoading, fetchUserDetail, updateUser, fetchUsers } =
    useUserStore();
  const { createAuth, error } = useAuthStore();

  //* USE STATE
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  //* USE EFFECT
  useEffect(() => {
    fetchUserDetail(id);
  }, [id, fetchUserDetail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Button clicked");
    try {
      await createAuth(username, password, id);
      await updateUser(
        id,
        userDetail.firstName,
        userDetail.middleName,
        userDetail.lastName,
        "admin"
      );
      toast.success("Admin account created successfully");
      navigate(-1);
      await fetchUsers();
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  if (isLoading || !userDetail) {
    return <Loader className="w-6h-6 animate-spin mx-auto" />;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className=" w-full bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden mx-2"
    >
      <div className="p-8">
        <h4 className="mb-6 text-center bg-clip-text">Create Admin Account</h4>
        <div className="flex flex-col py-3">
          <div className="flex flex-row gap-5">
            <p className="font-semibold">Name:</p>
            <p>
              {userDetail.firstName} {userDetail.middleName}{" "}
              {userDetail.lastName}
            </p>
          </div>
          <div className="flex flex-row gap-5">
            <p className="font-semibold">Position:</p>
            <p>{toTitleCase(userDetail.position)}</p>
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <TextInput
            icon={User}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextInput
            icon={LockIcon}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 font-semibold mb-2"> {error}</p>}
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

export default AddAdminAccountPage;
