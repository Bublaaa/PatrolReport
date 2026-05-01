import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, MapPinCheckInside, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { requestLocation } from "../../utils/location.js";
import { TextInput, DropdownInput } from "../../components/inputs.jsx";
import { usePatrolPointStore } from "../../stores/patrol.point.store.js";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { buildDropdownOptions } from "../../utils/constants.js";
import { useTranslation } from "react-i18next";
import Button from "../../components/button.jsx";
import toast from "react-hot-toast";

const AddPatrolPointPage = () => {
  const { t } = useTranslation();
  // * USE STORE
  const { createPatrolPoint, isLoading: isPatrolPointLoading } =
    usePatrolPointStore();
  const {
    workLocations,
    fetchWorkLocations,
    isLoading: isWorkLocationLoading,
  } = useWorkLocationStore();

  // * USE NAVIGATE
  const navigate = useNavigate();

  // * USE STATE
  const [PatrolPointData, setPatrolPointData] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });
  const [locationGranted, setLocationGranted] = useState(null);
  const [selectedWorkLocation, setSelectedWorkLocation] = useState(null);

  // * LOCATION PERMISSION REQUEST
  const checkLocationPermission = async () => {
    try {
      const coords = await requestLocation();
      setLocationGranted(true);
      setPatrolPointData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } catch (error) {
      console.error("Location permission denied:", error);
      setLocationGranted(false);
    }
  };

  // * HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (PatrolPointData.name.trim() === "") {
      toast.error(t("patrol_point_utils.patrol_point_name_required"));
      return;
    }
    if (PatrolPointData.latitude === 0 || PatrolPointData.longitude === 0) {
      toast.error(t("patrol_point_utils.patrol_point_coordinates_required"));
      return;
    }
    if (!selectedWorkLocation) {
      toast.error(t("patrol_point_utils.work_location_required"));
      return;
    }
    const newPatrolPoint = await createPatrolPoint(
      PatrolPointData.name,
      PatrolPointData.latitude,
      PatrolPointData.longitude,
      selectedWorkLocation,
    );
    if (newPatrolPoint) {
      setTimeout(() => {
        navigate(-1);
      }, 1000);
    }
  };

  const handleSelectWorkLocation = (e) => {
    setSelectedWorkLocation(e.target.value);
  };

  // * INITIAL CHECK PERMISSION
  useEffect(() => {
    checkLocationPermission();
    fetchWorkLocations();
  }, []);

  const workLocationOptions = useMemo(() =>
    buildDropdownOptions(workLocations),
  );

  if (isPatrolPointLoading || isWorkLocationLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }
  return (
    <form
      className="flex w-full flex-col gap-5 p-4 bg-white rounded-lg mx-2"
      onSubmit={handleSubmit}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-row w-full items-center justify-between"
      >
        <h6>{t("add_patrol_point_page.title")}</h6>
        <Button
          buttonType={`${
            PatrolPointData.latitude !== 0 ? "primary" : "disabled"
          }`}
          buttonSize="medium"
          icon={MapPinCheckInside}
          onClick={(e) => {
            e.preventDefault();
            checkLocationPermission();
          }}
        >
          {t("add_patrol_point_page.recalibrate_location_button_label")}
        </Button>
      </motion.div>
      <DropdownInput
        label=""
        name="workLocation"
        value={selectedWorkLocation}
        options={workLocationOptions}
        placeholder={t(
          "add_patrol_point_page.select_work_location_placeholder",
        )}
        onChange={handleSelectWorkLocation}
      />
      {/* Patrol Point Name */}
      <TextInput
        type="text"
        label={t("add_patrol_point_page.patrol_point_name_filed_label")}
        placeholder={t("add_patrol_point_page.patrol_point_name_placeholder")}
        value={PatrolPointData.name}
        onChange={(e) =>
          setPatrolPointData((prev) => ({
            ...prev,
            name: e.target.value,
          }))
        }
      />

      <div className="grid grid-cols-2 gap-5">
        {/* Start Time Picker */}
        <div className="flex flex-col gap-2 items-center">
          <h6>Latitude</h6>
          {locationGranted === null && (
            <Loader className="w-6h-6 animate-spin mx-auto" />
          )}
          {locationGranted === true && <p>{PatrolPointData.latitude}</p>}
        </div>

        <div className="flex flex-col gap-2 items-center">
          <h6>Longitude</h6>
          {locationGranted === null && (
            <Loader className="w-6h-6 animate-spin mx-auto" />
          )}
          {locationGranted === true && <p>{PatrolPointData.longitude}</p>}
        </div>
      </div>
      {locationGranted === null && (
        <div className="p-2 items-center text-center bg-yellow-100 rounded-lg">
          <p className="text-yellow-500">
            {t("patrol_point_utils.location_permission_checking")}
          </p>
        </div>
      )}
      {locationGranted === false && (
        <div className="p-2 items-center text-center bg-red-100 rounded-lg">
          <p className="text-red-500">
            {t("patrol_point_utils.location_permission_denied")}
          </p>
        </div>
      )}
      <Button
        type="submit"
        className="ml-auto"
        buttonType={`${
          PatrolPointData.latitude !== 0 ? "primary" : "disabled"
        }`}
        buttonSize="medium"
        icon={Plus}
      >
        {t("add_patrol_point_page.save_patrol_point_button_label")}
      </Button>
    </form>
  );
};
export default AddPatrolPointPage;
