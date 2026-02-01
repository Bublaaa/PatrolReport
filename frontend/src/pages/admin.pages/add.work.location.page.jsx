import { Building, Loader, MapPinHouse } from "lucide-react";
import { useState } from "react";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TextInput } from "../../components/inputs.jsx";
import toast from "react-hot-toast";
import Button from "../../components/button";

const AddWorkLocationPage = () => {
  //* USE NAVIGATE
  const navigate = useNavigate();

  // * USE STATE
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  // * USE STORE
  const { createWorkLocation, error, isLoading } = useWorkLocationStore();

  // * HANDLE CREATE WORK LOCATION
  const handleCreateWorkLocation = async (e) => {
    e.preventDefault();
    try {
      await createWorkLocation(name, address);
      toast.success("Work location created");
      navigate(-1);
    } catch (error) {
      toast.error(error);
    }
  };

  if (isLoading) {
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
        <h2 className="mb-6 text-center bg-clip-text">Add Work Location</h2>

        <form className="space-y-5" onSubmit={handleCreateWorkLocation}>
          <TextInput
            icon={Building}
            type="text"
            placeholder="Work Location Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            icon={MapPinHouse}
            type="text"
            placeholder="Work Location Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
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
              "Add Location"
            )}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default AddWorkLocationPage;
