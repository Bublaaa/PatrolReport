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
import Pagination from "../../components/pagination.jsx";

const PatrolPointPageDashboard = () => {
  const { t } = useTranslation();
  // * USE STATE
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    body: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterName, setFilterName] = useState("");
  const [selectedWorkLocation, setSelectedWorkLocation] = useState("");
  const [debounceSearch, setDebouncedSearch] = useState(filterName);

  // * MODAL FUNCTION
  const openModal = (title, body) =>
    setModalState({ isOpen: true, title, body });
  const closeModal = () =>
    setModalState({ isOpen: false, title: "", body: null });

  // * USE STORE
  const {
    isLoading,
    patrolPoints,
    pagination,
    deletePatrolPoint,
    fetchPatrolPoints,
  } = usePatrolPointStore();

  const {
    workLocations,
    fetchWorkLocations,
    isLoading: isWorkLocationLoading,
    error: workLocationError,
  } = useWorkLocationStore();

  const fetchPatrolPoint = () => {
    fetchPatrolPoints(
      currentPage,
      pagination.limit,
      debounceSearch,
      selectedWorkLocation,
    );
  };

  useEffect(() => {
    fetchPatrolPoint();
  }, [currentPage, debounceSearch, selectedWorkLocation]);
  useEffect(() => {
    fetchWorkLocations(1, 1000);
  }, []);
  // * DEBOUNCE SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filterName);
    }, 500);

    return () => clearTimeout(timer);
  }, [filterName]);

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
            fetchPatrolPoint();
          }}
        />,
      );
      return;
    }
  };

  const handleFilterName = (e) => {
    setCurrentPage(1);
    setFilterName(e.target.value);
  };

  const handleFilterWorkLocation = (e) => {
    setCurrentPage(1);
    setSelectedWorkLocation(e.target.value);
  };

  const workLocationOptions = useMemo(() =>
    buildDropdownOptions(workLocations, {
      includeAll: true,
      allLabel: t("patrol_point_dashboard_page.location_dropdown_placeholder"),
      allValue: "",
    }),
  );

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

      <div className="grid md:grid-cols-2 grid-cols-1 gap-5 items-center pt-4 pb-2">
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

      {patrolPoints.length === 0 && (
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
        {patrolPoints.length > 0 &&
          patrolPoints.map((point) => (
            <PatrolPointCard key={point._id} patrolPoint={point} />
          ))}
      </div>
      {pagination.totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

const PatrolPointCard = ({ patrolPoint }) => {
  return (
    <div className="grid grid-cols-3 gap-4 px-3 py-2 hover:bg-gray-100 rounded-md justify-between items-center cursor-pointer">
      <p>{toTitleCase(patrolPoint.workLocationId.name)}</p>
      <p>{toTitleCase(patrolPoint.name)}</p>
      <div className="flex flex-row gap-2 justify-end">
        <Button
          className="delete-btn"
          buttonSize="small"
          buttonType="danger"
          icon={Trash2}
          data-id={patrolPoint._id}
          data-name={patrolPoint.name}
        ></Button>
        <NavLink to={`/admin/patrol-point/${patrolPoint._id}`}>
          <Button buttonType="secondary" buttonSize="icon" icon={PenBoxIcon} />
        </NavLink>
      </div>
    </div>
  );
};
export default PatrolPointPageDashboard;
