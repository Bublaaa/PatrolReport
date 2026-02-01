import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { TextInput, DropdownInput } from "../../components/inputs.jsx";
import { useUserStore } from "../../stores/user.store.js";
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
  const { userDetail, fetchUserDetail, updateUser } = useUserStore();
  const { workLocations, fetchWorkLocations } = useWorkLocationStore();

  // * USE STATE
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [selectedPosition, setSelectedPosition] = useState();
  const [selectedWorkLocation, setSelectedWorkLocation] = useState();

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    fetchUserDetail(id);
    fetchWorkLocations();
  }, [id, fetchUserDetail]);

  useEffect(() => {
    if (userDetail) {
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
    await updateUser(
      id,
      firstName,
      middleName,
      lastName,
      selectedPosition,
      selectedWorkLocation,
    );
    toast.success("User updated");
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
          <DropdownInput
            label=""
            name="position"
            value={selectedWorkLocation}
            options={workLocationOptions}
            placeholder="Select WorkLocation"
            onChange={handleSelectWorkLocation}
          />
          {/* <DropdownInput
            label=""
            name="position"
            value={selectedPosition}
            options={positionOptions}
            placeholder="Select Position"
            onChange={handleSelectPosition}
          /> */}

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
