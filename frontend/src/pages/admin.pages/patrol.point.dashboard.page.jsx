import { useEffect, useState, useMemo } from "react";
import { Plus, Loader, Trash2, PenBoxIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { usePatrolPointStore } from "../../stores/patrol.point.store.js";
import { DeleteConfirmationForm } from "../../components/delete.confirmation";
import { toTitleCase } from "../../utils/toTitleCase.js";
import { DropdownInput, TextInput } from "../../components/inputs.jsx";
import { buildDropdownOptions } from "../../utils/constants.js";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { useTranslation } from "react-i18next";
import Modal from "../../components/modal";
import Button from "../../components/button";

const PatrolPointPageDashboard = () => {
  const { t } = useTranslation();
  // * USE STATE
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    body: "",
  });
  const [filterName, setFilterName] = useState("");
  const [selectedWorkLocation, setSelectedWorkLocation] = useState("");
  // * MODAL FUNCTION
  const openModal = (title, body) =>
    setModalState({ isOpen: true, title, body });
  const closeModal = () =>
    setModalState({ isOpen: false, title: "", body: null });

  // * USE STORE
  const { isLoading, patrolPoints, deletePatrolPoint, fetchPatrolPoints } =
    usePatrolPointStore();

  const {
    workLocations,
    fetchWorkLocations,
    isLoading: isWorkLocationLoading,
    error: workLocationError,
  } = useWorkLocationStore();

  useEffect(() => {
    fetchPatrolPoints();
    fetchWorkLocations();
  }, []);

  // * DELETE ACTION HANDLER
  const handleDeleteAction = (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (deleteButton) {
      openModal(
        t("patrol_point_dashboard_page.delete_modal_title"),
        <DeleteConfirmationForm
          itemName={deleteButton.dataset.name}
          onDelete={deletePatrolPoint}
          itemId={deleteButton.dataset.id}
          onClose={() => {
            closeModal();
            fetchPatrolPoints();
          }}
        />,
      );
      return;
    }
  };

  const handleFilterName = (e) => {
    setFilterName(e.target.value);
  };

  const handleFilterWorkLocation = (e) => {
    setSelectedWorkLocation(e.target.value);
  };

  const workLocationOptions = useMemo(() =>
    buildDropdownOptions(workLocations, {
      includeAll: true,
      allLabel: t("patrol_point_dashboard_page.location_dropdown_placeholder"),
      allValue: "",
    }),
  );

  // * FILTERED LIST
  const filteredPatrolPoints = patrolPoints.filter((point) => {
    const matchWorkLocation =
      !selectedWorkLocation ||
      point.workLocationId._id === selectedWorkLocation;

    const matchName =
      !filterName || point.name.includes(filterName.toLowerCase());

    return matchWorkLocation && matchName;
  });

  if (isLoading || isWorkLocationLoading) {
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
        <h5>{t("patrol_point_dashboard_page.title")}</h5>
        <NavLink to={"/admin/patrol-point/add"}>
          <Button buttonType="primary" buttonSize="medium" icon={Plus}>
            {t("patrol_point_dashboard_page.add_patrol_point_button_label")}
          </Button>
        </NavLink>
      </div>

      <div className="grid md:grid-cols-3 grid-cols-2 gap-5 items-center pt-4 pb-2">
        <DropdownInput
          className="span-2"
          name="workLocation"
          value={selectedWorkLocation}
          options={workLocationOptions}
          placeholder="Filter Work Location"
          onChange={handleFilterWorkLocation}
        />
        <TextInput
          type="text"
          placeholder={t("patrol_point_dashboard_page.search_name_placeholder")}
          value={filterName}
          onChange={handleFilterName}
        />
      </div>

      {filteredPatrolPoints.length === 0 && (
        <p className="text-center mt-4">
          {t("patrol_point_dashboard_page.patrol_points_not_found")}
        </p>
      )}
      <div className="grid grid-cols-3 text-center pt-4 pb-2">
        <h6>
          {t("patrol_point_dashboard_page.table_header_patrol_point_name")}
        </h6>
        <h6>{t("patrol_point_dashboard_page.table_header_work_location")}</h6>
        <h6>{t("patrol_point_dashboard_page.table_header_actions")}</h6>
      </div>
      <div
        className="flex flex-col gap-2 w-full justify-between pt-2"
        onClick={(e) => handleDeleteAction(e)}
      >
        {filteredPatrolPoints.length > 0 &&
          filteredPatrolPoints.map((point) => (
            <div
              key={point._id}
              className="grid grid-cols-3 gap-4 px-3 py-2 hover:bg-gray-100 rounded-md justify-between items-center cursor-pointer"
            >
              <p>{toTitleCase(point.workLocationId.name)}</p>
              <p>{toTitleCase(point.name)}</p>
              <div className="flex flex-row gap-2 justify-end">
                <Button
                  className="delete-btn"
                  buttonSize="small"
                  buttonType="danger"
                  icon={Trash2}
                  data-id={point._id}
                  data-name={point.name}
                ></Button>
                <NavLink to={`/admin/patrol-point/${point._id}`}>
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
    </div>
  );
};

export default PatrolPointPageDashboard;
