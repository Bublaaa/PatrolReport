import { FolderCog, Loader } from "lucide-react";
import { TextInput } from "../../components/Input.jsx";
import { motion } from "framer-motion";
import { useSystemSettingStore } from "../../stores/system.setting.store.js";
import { useState, useEffect } from "react";
import Button from "../../components/button.jsx";
const UpdateDriveLinkPage = () => {
  const DRIVE_URL_PREFIX = "https://drive.google.com/drive/u/0/folders/";
  // * USE STATE
  const [driveLink, setDriveLink] = useState("");

  //* USE STORE
  const {
    systemSettingDetail,
    fetchDriveFolderId,
    updateDriveFolderId,
    isLoading: isSystemSettingLoading,
  } = useSystemSettingStore();

  // * USE EFFECT
  useEffect(() => {
    fetchDriveFolderId();
  }, [systemSettingDetail]);

  useEffect(() => {
    if (systemSettingDetail) {
      setDriveLink(`${DRIVE_URL_PREFIX}${systemSettingDetail}`);
    }
  }, [systemSettingDetail]);

  // * FORM SUBMIT HANDLER
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!driveLink) {
      alert("Invalid Drive folder link");
      return;
    }
    updateDriveFolderId(driveLink);
  };

  if (isSystemSettingLoading) {
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
        <h4 className="mb-6 text-center bg-clip-text">Update Drive Link</h4>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <TextInput
            icon={FolderCog}
            type="text"
            placeholder="Drive Link"
            value={driveLink}
            onChange={(e) => setDriveLink(e.target.value)}
          />

          <Button
            buttonSize="medium"
            buttonType="primary"
            type="submit"
            className="items-start"
          >
            Save
          </Button>
        </form>
      </div>
    </motion.div>
  );
};
export default UpdateDriveLinkPage;
