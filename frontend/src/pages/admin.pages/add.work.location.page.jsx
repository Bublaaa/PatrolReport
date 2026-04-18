import { Building, Loader, MapPinHouse } from "lucide-react";
import { useState } from "react";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { TextInput } from "../../components/inputs.jsx";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Button from "../../components/button";

const AddWorkLocationPage = () => {
  const { t } = useTranslation();
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
      const newWorkLocation = await createWorkLocation(name, address);
      if (newWorkLocation) {
        navigate(-1);
      }
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
        <h2 className="mb-6 text-center bg-clip-text">
          {t("add_work_location_page.title")}
        </h2>

        <form className="space-y-5" onSubmit={handleCreateWorkLocation}>
          <TextInput
            icon={Building}
            type="text"
            placeholder={t(
              "add_work_location_page.work_location_name_placeholder",
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            icon={MapPinHouse}
            type="text"
            placeholder={t(
              "add_work_location_page.work_location_address_placeholder",
            )}
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
