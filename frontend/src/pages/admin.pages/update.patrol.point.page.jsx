import { useState, useEffect } from "react";
import { Download, Loader, MapPinCheckInside, SaveIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { requestLocation } from "../../utils/location.js";
import { TextInput } from "../../components/inputs.jsx";
import { usePatrolPointStore } from "../../stores/patrol.point.store.js";
import Button from "../../components/button.jsx";
import toast from "react-hot-toast";

const UpdatePatrolPointPage = () => {
  // * USE PARAMS
  const id = useParams().id;

  // * USE NAVIGATE
  const navigate = useNavigate();

  // * USE STORE
  const {
    updatePatrolPoint,
    fetchPatrolPointDetail,
    patrolPointDetail,
    generateQRCode,
    qrCode,
    isLoading,
  } = usePatrolPointStore();

  // * USE STATE
  const [PatrolPointData, setPatrolPointData] = useState({
    name: "",
    latitude: "",
    longitude: "",
  });
  const [locationGranted, setLocationGranted] = useState(null);

  // * CHECK LOCATION PERMISSION HANDLER
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

  // * FORM SUBMIT HANDLER
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
    await updatePatrolPoint(
      id,
      PatrolPointData.name,
      PatrolPointData.latitude,
      PatrolPointData.longitude
    );
    toast.success("Success update new patrol point");
    setTimeout(() => {
      navigate(-1);
    }, 1000);
  };

  // * LOAD QR CODE HANDLER
  const handleDownloadQrCode = () => {
    if (!qrCode) return;

    const link = document.createElement("a");
    link.href = qrCode;
    link.download = PatrolPointData.name + "-qr.png";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    fetchPatrolPointDetail(id);
    generateQRCode(id);
    checkLocationPermission();
  }, [id]);

  useEffect(() => {
    if (patrolPointDetail) {
      setPatrolPointData({
        name: patrolPointDetail.name || "",
        latitude: patrolPointDetail.latitude || "",
        longitude: patrolPointDetail.longitude || "",
      });
    }
  }, [patrolPointDetail]);

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
        <h6>Update Patrol Point</h6>
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
      <div className="grid md:grid-cols-4 grid-cols-1 w-full gap-5">
        <div className="flex flex-col justify-center items-center md:col-span-1 col-span-1">
          {qrCode && (
            <img
              src={qrCode}
              alt="Attendance QR Code"
              className="w-48 h-48 w-full h-auto"
            />
          )}
          {!qrCode && (
            <h6 className="text-center text-red-500">QR Code unavailable</h6>
          )}
          <Button
            buttonType="secondary"
            buttonSize="medium"
            onClick={handleDownloadQrCode}
            icon={Download}
          >
            Download QR
          </Button>
        </div>
        <div className="flex w-full flex-col gap-5 md:col-span-3 col-span-1">
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
        </div>
      </div>
      <Button
        type="submit"
        className="ml-auto"
        buttonType={`${
          PatrolPointData.latitude !== 0 ? "primary" : "disabled"
        }`}
        buttonSize="medium"
        icon={SaveIcon}
      >
        Save
      </Button>
    </form>
  );
};
export default UpdatePatrolPointPage;
