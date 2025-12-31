import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { formatDateToString, formatTime } from "../../utils/dateTimeFormatter";
import { DeleteConfirmationForm } from "../../components/delete.confirmation.jsx";
import Modal from "../../components/modal";
import Button from "../../components/button.jsx";
import { useReportStore } from "../../stores/report.store";
import { ChevronLeft, Loader, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toTitleCase } from "../../utils/toTitleCase.js";
import { useReportImagesStore } from "../../stores/report.images.store.js";
import { getImagesByReportId } from "../../../../backend/database/local.database.js";

const ReportDetailPage = () => {
  // * USE NAVIGATE
  const navigate = useNavigate();
  // * USE PARAMS
  const { id } = useParams();
  // * USE STATE
  const [images, setImages] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    body: "",
  });
  // * MODAL STATE
  const openModal = (title, body) =>
    setModalState({ isOpen: true, title, body });
  const closeModal = () =>
    setModalState({ isOpen: false, title: "", body: null });

  // * USE STORE
  const { fetchReportDetail, reportDetail, deleteReport, isLoading } =
    useReportStore();
  const { fetchReportImagesByReportId, reportImages } = useReportImagesStore();

  // * DELETE HANDLER
  const handleDeleteAction = (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (deleteButton) {
      openModal(
        "Delete Report",
        <DeleteConfirmationForm
          itemName={deleteButton.dataset.name}
          onDelete={deleteReport}
          itemId={deleteButton.dataset.id}
          onClose={() => {
            closeModal();
            fetchReportDetail(id);
          }}
        />
      );
      return;
    }
  };

  // * INITIAL DATA LOAD
  useEffect(() => {
    fetchReportDetail(id);
    fetchReportImagesByReportId(id);
  }, []);

  // * LOAD THE IMAGES FORM INDEXED DB
  useEffect(() => {
    const loadImages = async () => {
      const imgs = await getImagesByReportId(id);
      setImages(
        imgs.map((img) => ({
          ...img,
          url: URL.createObjectURL(img.blob),
        }))
      );
    };

    loadImages();
  }, [id]);

  if (isLoading || !reportDetail) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col w-full bg-white rounded-lg px-6 py-4 shadow-md gap-5"
    >
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        body={modalState.body}
      />
      <div className="flex flex-row justify-between items-center">
        <Button
          buttonSize="medium"
          buttonType="secondary"
          icon={ChevronLeft}
          onClick={() => navigate("/admin/report")}
        ></Button>
        <h5>Report Detail</h5>
        <Button
          className="delete-btn"
          buttonSize="small"
          buttonType="danger"
          icon={Trash2}
          data-id={id}
          data-name={id.slice(0, 5)}
        ></Button>
      </div>
      <div
        className="flex flex-col gap-5"
        onClick={(e) => handleDeleteAction(e)}
      >
        <div className="flex flex-row gap-2 items-center">
          <h6>Date : </h6>
          <p>
            {formatDateToString(reportDetail.createdAt)} -{" "}
            {formatTime(reportDetail.createdAt)}
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <h6>User : </h6>
          <p>
            {reportDetail.userId.firstName} {reportDetail.userId.lastName}
          </p>
        </div>
        <div className="flex flex-row gap-2 items-center">
          <h6>Patrol Point : </h6>
          <p>{toTitleCase(reportDetail.patrolPointId.name)}</p>
        </div>
        <div className="flex flex-col gap-2 items-start mt-3">
          <h6>Report : </h6>
          <div className="flex flex-col w-full gap-2 bg-white-shadow px-3 py-4 rounded-md">
            {reportDetail.report}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <h6>Images : </h6>
          {images.length === 0 && (
            <p className="text-center mt-4">No patrol images found.</p>
          )}
          <div className="flex flex-wrap gap-2">
            {images.map((img) => (
              <img
                key={img.id}
                src={URL.createObjectURL(img.blob)}
                alt={img.fileName}
                className="rounded object-cover"
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default ReportDetailPage;
