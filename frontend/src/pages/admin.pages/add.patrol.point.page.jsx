import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader, MapPinCheckInside, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { requestLocation } from "../../utils/location.js";
import { TextInput } from "../../components/Input.jsx";
import { usePatrolPointStore } from "../../stores/patrol.point.store.js";
import Button from "../../components/button.jsx";
import toast from "react-hot-toast";

const AddPatrolPointPage = () => {
  // * USE STORE
  const { createPatrolPoint, isLoading } = usePatrolPointStore();

  // * USE NAVIGATE
  const navigate = useNavigate();

  // * USE STATE
  const [PatrolPointData, setPatrolPointData] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });
  const [locationGranted, setLocationGranted] = useState(null);

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
      toast.error("Patrol Point name is required");
      return;
    }
    if (PatrolPointData.latitude === 0 || PatrolPointData.longitude === 0) {
      toast.error("Please recalibrate your coordinates");
      return;
    }
    await createPatrolPoint(
      PatrolPointData.name,
      PatrolPointData.latitude,
      PatrolPointData.longitude
    );
    toast.success("Success add new patrol point");
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  // * INITIAL CHECK PERMISSION
  useEffect(() => {
    checkLocationPermission();
  }, []);

  if (isLoading) {
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
        <h6>New Patrol Point</h6>
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
          Recalibrate
        </Button>
      </motion.div>
      {/* Shift Name */}
      <TextInput
        type="text"
        label={"Patrol Point Name"}
        placeholder="Outpost Name"
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
          <p className="text-yellow-500">Checking location permission</p>
        </div>
      )}
      {locationGranted === false && (
        <div className="p-2 items-center text-center bg-red-100 rounded-lg">
          <p className="text-red-500">
            ❌ Location permission is required for adding new outpost.
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
        Save
      </Button>
    </form>
  );
};
export default AddPatrolPointPage;
