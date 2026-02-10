import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { TextInput, DropdownInput } from "../../components/inputs.jsx";
import { useAuthStore } from "../../stores/auth.store.js";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { toast } from "react-hot-toast";
import { User } from "lucide-react";
import Button from "../../components/button.jsx";

const UserDetailPage = () => {
  const positionOptions = [
    { label: "Admin", value: "admin" },
    { label: "Security", value: "security" },
  ];

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

  const workLocationOptions = workLocations.map((workLocation) => {
    return {
      label: workLocation.name,
      value: workLocation._id,
    };
  });

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
      toast.error("Please fill all required fields");
      return;
    }
    await updateAuth(
      id,
      username,
      firstName,
      middleName,
      lastName,
      selectedPosition,
      selectedWorkLocation,
    );
    setTimeout(() => {
      navigate(-1);
    }, 1000);
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
        <h4 className="mb-6 text-center bg-clip-text">Update Account</h4>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
            <div className="space-y-5">
              <TextInput
                icon={User}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <DropdownInput
                name="workLocation"
                value={selectedWorkLocation}
                options={workLocationOptions}
                placeholder="Select Work Location"
                onChange={handleSelectWorkLocation}
              />
              <DropdownInput
                name="position"
                value={selectedPosition}
                options={positionOptions}
                placeholder="Select User Position"
                onChange={handleSelectPosition}
              />
            </div>
            <div className="space-y-5">
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
            </div>
          </div>

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
export default UserDetailPage;
