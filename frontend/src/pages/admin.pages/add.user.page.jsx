import { motion } from "framer-motion";
import { Loader, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TextInput } from "../../components/input.jsx";
import { useState } from "react";
import { useUserStore } from "../../stores/user.store.js";
import Button from "../../components/button.jsx";
import toast from "react-hot-toast";

const AddUserPage = () => {
  // * USE NAVIGATE
  const navigate = useNavigate();

  // * USE STATE
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");

  // * USE STORE
  const { createUser, error, isLoading } = useUserStore();

  // * HANDLE CREATE USER
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      await createUser(firstName, middleName, lastName);
      toast.success("User created");
      navigate(-1);
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full bg-white bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-auto scrollbar-hidden mx-2"
    >
      <div className="p-8">
        <h2 className="mb-6 text-center bg-clip-text">Create Account</h2>

        <form className="space-y-5" onSubmit={handleSignUp}>
          <TextInput
            icon={User}
            type="text"
            placeholder="Fist Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
          <TextInput
            icon={User}
            type="text"
            placeholder="Middle Name"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
          />
          <TextInput
            icon={User}
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
          {/* <PasswordStrengthMeter password={password} /> */}

          <Button
            buttonSize="full"
            buttonType="primary"
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader className="w-6h-6 animate-spin mx-auto" />
            ) : (
              "Add User"
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
