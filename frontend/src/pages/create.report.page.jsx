import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { usePatrolPointStore } from "../stores/patrol.point.store.js";
import { useUserStore } from "../stores/user.store.js";
import { Loader } from "lucide-react";
import {
  DropdownInput,
  TextareaInput,
  ImageInput,
  CameraInput,
} from "../components/Input";
import { requestLocation } from "../utils/location";
import { toTitleCase } from "../utils/toTitleCase.js";
import { compressImages } from "../utils/compressImage.js";
import toast from "react-hot-toast";
import Button from "../components/button.jsx";
import {
  saveImagesToIndexedDB,
  getImagesByReportTempId,
} from "../../../backend/database/local.database.js";

const CreateReportPage = () => {
  const { id } = useParams();
  const { fetchPatrolPointDetail, isLoading, patrolPointDetail } =
    usePatrolPointStore();
  const { users, fetchUsers } = useUserStore();
  const [locationGranted, setLocationGranted] = useState(null);

  const checkLocationPermission = async () => {
    try {
      const coords = await requestLocation();
      setLocationGranted(true);
      setReportData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
      }));
    } catch (error) {
      toast.error("Location permission denied");
      setLocationGranted(false);
    }
  };

  const downloadFile = (file, filename) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const reportTempId = crypto.randomUUID();
    const compressedImages = await compressImages(reportData.imageUrl);
    const renamedImages = compressedImages.map((file, index) => {
      return new File([file], `report-${Date.now()}-image-${index + 1}.webp`, {
        type: file.type,
        lastModified: Date.now(),
      });
    });

    await saveImagesToIndexedDB(renamedImages, reportTempId);

    for (let i = 0; i < renamedImages.length - 1; i++) {
      console.log("Before", i, "Size:", reportData.imageUrl[i].size);
      console.log("After", i, "Size:", renamedImages[i].size);
      console.log(
        "Percentage",
        i,
        "Size:",
        ((reportData.imageUrl[i].size - renamedImages[i].size) /
          reportData.imageUrl[i].size) *
          100
      );
    }

    await getImagesByReportTempId(reportTempId).then((images) => {
      console.log("Retrieved from IndexedDB:", images);
    });

    // const compressed = compressedImages[0];
    // downloadFile(compressed, `compressed-${compressed.name}`);
  };

  const [reportData, setReportData] = useState({
    userId: "",
    patrolPointId: "",
    report: "",
    imageUrl: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    if (id) {
      fetchPatrolPointDetail(id);
      fetchUsers();
      checkLocationPermission();
    }
  }, [id, fetchPatrolPointDetail]);

  useEffect(() => {
    setReportData((prev) => ({
      ...prev,
      patrolPointId: id,
    }));
  }, [id]);

  const isReportDataValid = Object.values(reportData).map((value) => {
    value.userId !== "" &&
      value.report !== "" &&
      value.patrolPointId !== "" &&
      value.latitude !== "" &&
      value.longitude !== "";
  });
  // console.log("Report Data:", reportData);
  // console.log("Report Data Valid:", isReportDataValid);
  const userOptions = users.map((user) => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user._id,
  }));

  if (isLoading || !patrolPointDetail) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
    <div className="w-full h-screen items-end bg-white-shadow overflow-y-auto scrollbar-hidden">
      <div className="max-w-3xl w-full mx-auto h-fit p-3">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 justify-between bg-white rounded-lg bg-white shadow-md px-6 py-4">
            <h2> Create Report</h2>
            <h6>Patrol Point : {toTitleCase(patrolPointDetail.name)}</h6>
          </div>

          <div className="flex flex-col gap-5 bg-white shadow-md rounded-lg px-6 py-4">
            <div className="flex flex-row justify-between w-full">
              <h5>Current Location</h5>
              <Button
                buttonSize="medium"
                buttonType="primary"
                onClick={checkLocationPermission}
              >
                Recalibrate
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {/* Start Time Picker */}
              <div className="flex flex-col gap-2 items-center">
                <h6>Latitude</h6>
                {locationGranted === null && (
                  <Loader className="w-6h-6 animate-spin mx-auto" />
                )}
                {locationGranted === true && <p>{reportData.latitude}</p>}
              </div>

              <div className="flex flex-col gap-2 items-center">
                <h6>Longitude</h6>
                {locationGranted === null && (
                  <Loader className="w-6h-6 animate-spin mx-auto" />
                )}
                {locationGranted === true && <p>{reportData.longitude}</p>}
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

          <div className="flex flex-col gap-5 px-6 py-4 bg-white shadow-md rounded-lg">
            <DropdownInput
              label="Select User"
              name="userId"
              value={reportData.userId}
              options={userOptions}
              onChange={(e) =>
                console.log("Selected User ID:", e.target.value) ||
                setReportData((prev) => ({
                  ...prev,
                  userId: e.target.value,
                }))
              }
            />
            <TextareaInput
              label="Report Description"
              name="report"
              value={reportData.report}
              placeholder="Enter report description"
              onChange={(e) =>
                setReportData((prev) => ({
                  ...prev,
                  report: e.target.value,
                }))
              }
            />
            <CameraInput
              label="Upload Report Images"
              maxFiles={5}
              onFilesChange={(files) =>
                setReportData((prev) => ({
                  ...prev,
                  imageUrl: files,
                }))
              }
            />

            <Button
              type="submit"
              className="ml-auto"
              buttonSize="medium"
              buttonType={isReportDataValid ? "primary" : "disabled"}
              disabled={!isReportDataValid}
            >
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportPage;
