import { useNavigate, useParams } from "react-router-dom";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { useEffect, useState } from "react";
import { Building, MapPinHouse } from "lucide-react";
import { motion } from "framer-motion";
import { TextInput } from "../../components/inputs.jsx";
import { Loader } from "lucide-react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Button from "../../components/button";

const WorkLocationDetailPage = () => {
  const { t } = useTranslation();
  //* USE PARAMS
  const { id } = useParams();

  //* USE NAVIGATE
  const navigate = useNavigate();

  //* USE STORE
  const {
    workLocation,
    fetchWorkLocationDetail,
    updateWorkLocation,
    isLoading,
  } = useWorkLocationStore();

  // * USE STATE
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchWorkLocationDetail(id);
  }, [id, fetchWorkLocationDetail]);

  useEffect(() => {
    if (workLocation) {
      setName(workLocation.name);
      setAddress(workLocation.address);
    }
  }, [workLocation]);

  // * FORM SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateWorkLocation(id, name, address);
    toast.success("Work location updated");
    setTimeout(() => {
      navigate(-1);
    }, 1000);
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
          {t("update_work_location_page.title")}
        </h4>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <TextInput
            icon={Building}
            type="text"
            placeholder={t(
              "update_work_location_page.work_location_name_placeholder",
            )}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextInput
            icon={MapPinHouse}
            type="text"
            placeholder={t(
              "update_work_location_page.work_location_address_placeholder",
            )}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

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
export default WorkLocationDetailPage;
