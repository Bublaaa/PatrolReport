import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader } from "lucide-react";
import { usePatrolPointStore } from "../../stores/patrol.point.store.js";
import { useReportStore } from "../../stores/report.store.js";
import {
  DropdownInput,
  TextareaInput,
  CameraInput,
} from "../../components/inputs.jsx";
import { requestLocation } from "../../utils/location.js";
import { toTitleCase } from "../../utils/toTitleCase.js";
import { compressImages } from "../../utils/compressImage.js";
import toast from "react-hot-toast";
import Button from "../../components/button.jsx";
import { useAuthStore } from "../../stores/auth.store.js";
import { useTranslation } from "react-i18next";

const CreateReportPage = () => {
  const { t } = useTranslation();
  // * USE PARAMS
  const { id } = useParams();
  // * USE STORE
  const { fetchPatrolPointDetail, isLoading, patrolPointDetail } =
    usePatrolPointStore();
  const { loggedInUserDetail } = useAuthStore();
  const { createReport } = useReportStore();

  // * USE STATE
  const initialReportData = {
    userId: loggedInUserDetail._id,
    patrolPointId: "",
    report: "",
    images: [],
    latitude: "",
    longitude: "",
    accuracy: "",
  };
  const [cameraKey, setCameraKey] = useState(0);
  const [locationGranted, setLocationGranted] = useState(null);
  const [reportData, setReportData] = useState(initialReportData);

  const checkLocationPermission = async () => {
    try {
      const coords = await requestLocation();
      setLocationGranted(true);
      setReportData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
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

  const resetReportData = () => {
    setReportData(initialReportData);
    setCameraKey((k) => k + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (!reportData.images.length) {
        toast.error("Please upload at least one image");
        return;
      }
      // ** COMPRESS IMAGE
      const compressedImages = await compressImages(reportData.images);

      const formData = new FormData();
      formData.append("userId", reportData.userId);
      formData.append("patrolPointId", reportData.patrolPointId);
      formData.append("report", reportData.report);
      formData.append("latitude", reportData.latitude);
      formData.append("longitude", reportData.longitude);
      formData.append("accuracy", reportData.accuracy);

      compressedImages.forEach((file) => {
        formData.append("images", file);
      });

      // ** CREATE REPORT
      const newReport = await createReport(formData);
      if (newReport?._id) {
        resetReportData();
        toast.success("Report submitted successfully");
      }
    } catch (error) {
      toast.error("Failed to create report: " + error.message);
    }
  };

  // * USE EFFECT - LOAD DATA
  useEffect(() => {
    if (id) {
      fetchPatrolPointDetail(id);
      checkLocationPermission();
    }
  }, [id, fetchPatrolPointDetail]);

  useEffect(() => {
    setReportData((prev) => ({
      ...prev,
      patrolPointId: id,
    }));
  }, [id]);

  // * REPORT DATA VALIDATION
  const isReportDataValid =
    reportData.userId &&
    reportData.report &&
    reportData.patrolPointId &&
    reportData.latitude &&
    reportData.longitude;

  if (isLoading || !patrolPointDetail) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
    <div className="w-full h-screen items-end bg-white-shadow overflow-y-auto scrollbar-hidden">
      <div className="max-w-3xl w-full mx-auto h-fit p-3">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4 justify-between bg-white rounded-lg bg-white shadow-md px-6 py-4">
            <h2>{t("create_report_page.title")}</h2>
            <h6>
              {t("create_report_page.title")} :
              {toTitleCase(patrolPointDetail.name)}
            </h6>
          </div>

          <div className="flex flex-col gap-5 bg-white shadow-md rounded-lg px-6 py-4">
            <div className="flex flex-row justify-between w-full">
              <h5>{t("create_report_page.current_location_label")}</h5>
              <Button
                type="button"
                buttonSize="medium"
                buttonType="primary"
                onClick={checkLocationPermission}
              >
                {t("create_report_page.recalibrate_button_label")}
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
                <p className="text-yellow-500">
                  {t("create_report_page.checking_location_permission_message")}
                </p>
              </div>
            )}
            {locationGranted === false && (
              <div className="p-2 items-center text-center bg-red-100 rounded-lg">
                <p className="text-red-500">
                  ❌{" "}
                  {t("create_report_page.location_permission_denied_message")}
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-5 px-6 py-4 bg-white shadow-md rounded-lg">
            <TextareaInput
              label={t("create_report_page.report_description_label")}
              name="report"
              value={reportData.report}
              placeholder={t(
                "create_report_page.report_description_placeholder",
              )}
              onChange={(e) =>
                setReportData((prev) => ({
                  ...prev,
                  report: e.target.value,
                }))
              }
            />
            <CameraInput
              key={cameraKey}
              label={t("create_report_page.upload_report_images_label")}
              maxFiles={5}
              onFilesChange={(files) =>
                setReportData((prev) => ({
                  ...prev,
                  images: files,
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
              {t("create_report_page.save_report_button_label")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReportPage;
