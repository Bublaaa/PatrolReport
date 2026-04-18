import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { DeleteConfirmationForm } from "../../components/delete.confirmation.jsx";
import { useEffect, useState } from "react";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { Loader, PenBoxIcon, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal from "../../components/modal.jsx";
import Button from "../../components/button.jsx";

const WorkLocationDashboardPage = () => {
  const { t } = useTranslation();
  // * USE STATE
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    body: "",
  });
  // * MODAL STATE FUNCTION
  const openModal = (title, body) =>
    setModalState({ isOpen: true, title, body });
  const closeModal = () =>
    setModalState({ isOpen: false, title: "", body: null });

  //* USE STORE
  const { isLoading, workLocations, fetchWorkLocations, deleteWorkLocation } =
    useWorkLocationStore();

  //* USE EFFECT
  useEffect(() => {
    fetchWorkLocations();
  }, []);

  // * DELETE ACTION HANDLER
  const handleDeleteAction = (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (deleteButton) {
      openModal(
        t("work_location_dashboard_page.delete_modal_title"),
        <DeleteConfirmationForm
          itemName={deleteButton.dataset.name}
          onDelete={deleteWorkLocation}
          itemId={deleteButton.dataset.id}
          onClose={() => {
            closeModal();
            fetchWorkLocations();
          }}
        />,
      );
      return;
    }
  };

  if (isLoading) {
    return <Loader className="w-6h-6 animate-spin mx-auto" />;
  }

  return (
    <div className="flex flex-col w-full bg-white rounded-lg px-6 py-4 shadow-md">
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        body={modalState.body}
      />
      <div className="flex flex-row justify-between">
        <h5>{t("work_location_dashboard_page.title")}</h5>
        <NavLink to={"/admin/work-location/add"}>
          <Button buttonType="primary" buttonSize="medium" icon={Plus}>
            {t("work_location_dashboard_page.add_work_location_button_label")}
          </Button>
        </NavLink>
      </div>

      {workLocations.length === 0 && (
        <p className="text-center mt-4">
          {t("work_location_dashboard_page.work_locations_not_found")}
        </p>
      )}

      <div
        className="grid md:grid-cols-2 grid-cols-1 gap-2 w-full justify-between pt-2"
        onClick={(e) => handleDeleteAction(e)}
      >
        {workLocations.length > 0 &&
          workLocations.map((workLocation) => (
            <div
              key={workLocation._id}
              className="flex flex-row gap-4 px-3 py-2 hover:bg-gray-100 rounded-md justify-between items-center cursor-pointer"
            >
              <div className="flex flex-col items-start">
                <h6>{workLocation.name}</h6>
                <p className="line-clamp-2">{workLocation.address}</p>
              </div>

              <div className="flex flex-row gap-2">
                <Button
                  className="delete-btn"
                  buttonSize="small"
                  buttonType="danger"
                  icon={Trash2}
                  data-id={workLocation._id}
                  data-name={workLocation.name}
                ></Button>
                <NavLink to={`/admin/work-location/${workLocation._id}`}>
                  <Button
                    buttonType="secondary"
                    buttonSize="icon"
                    icon={PenBoxIcon}
                  />
                </NavLink>
              </div>
            </div>
          ))}
      </div>

      <div className="flex flex-row gap-3"></div>
    </div>
  );
};

export default WorkLocationDashboardPage;
