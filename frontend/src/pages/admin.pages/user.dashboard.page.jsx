import { useEffect, useState, useMemo } from "react";
import {
  ChartNoAxesColumnIcon,
  Loader,
  MoveLeft,
  MoveRight,
  PenBoxIcon,
  Trash2,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { DeleteConfirmationForm } from "../../components/delete.confirmation.jsx";
import { useAuthStore } from "../../stores/auth.store.js";
import { toTitleCase } from "../../utils/toTitleCase.js";
import { DropdownInput, TextInput } from "../../components/inputs.jsx";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import { useTranslation } from "react-i18next";
import {
  buildDropdownOptions,
  buildPositionDropdownOptions,
} from "../../utils/constants.js";
import Button from "../../components/button";
import Modal from "../../components/modal.jsx";
import Pagination from "../../components/pagination.jsx";

const UserPageDashboard = () => {
  const { t } = useTranslation();
  // * USE STATE
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    body: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [filterName, setFilterName] = useState("");
  const [filterWorkLocation, setFilterWorkLocation] = useState("");
  const [filterPosition, setFilterPosition] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(filterName);

  const fetchUsers = async () => {
    await getAllAuth(
      currentPage,
      pagination.limit,
      debouncedSearch,
      filterPosition,
      filterWorkLocation,
    );
  };

  // * MODAL STATE FUNCTION
  const openModal = (title, body) =>
    setModalState({ isOpen: true, title, body });
  const closeModal = () =>
    setModalState({ isOpen: false, title: "", body: null });

  // * USE STORE
  const {
    isLoading: isAuthLoading,
    users,
    pagination,
    getAllAuth,
    deleteAuth,
  } = useAuthStore();
  const {
    isLoading: isWorkLocationLoading,
    fetchWorkLocations,
    workLocations,
  } = useWorkLocationStore();

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    fetchUsers();
  }, [currentPage, debouncedSearch, filterPosition, filterWorkLocation]);

  //* FETCH WORK LOCATIONS
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

  // * DROPDOWN OPTIONS
  const workLocationOptions = useMemo(
    () =>
      buildDropdownOptions(workLocations, {
        includeAll: true,
        allLabel: t("user_dashboard_page.location_dropdown_placeholder"),
        allValue: "",
      }),
    [workLocations, t],
  );

  const positionOptions = useMemo(
    () =>
      buildPositionDropdownOptions({
        includeAll: true,
        allLabel: t("user_dashboard_page.position_dropdown_placeholder"),
        allValue: "",
      }),
    [t],
  );

  // * FILTER FUNCTIONS
  const handleFilterPosition = (e) => {
    setCurrentPage(1);
    setFilterPosition(e.target.value);
  };

  const handleFilterWorkLocation = (e) => {
    setCurrentPage(1);
    setFilterWorkLocation(e.target.value);
  };
  const handleFilterName = (e) => {
    setCurrentPage(1);
    const firstWord = e.target.value.trim().split(" ")[0];
    setFilterName(firstWord);
  };

  // * DELETE ACTION HANDLER
  const handleDeleteAction = (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (deleteButton) {
      openModal(
        t("user_dashboard_page.delete_modal_title"),
        <DeleteConfirmationForm
          itemName={deleteButton.dataset.name}
          onDelete={deleteAuth}
          itemId={deleteButton.dataset.id}
          onClose={() => {
            closeModal();
            getAllAuth(
              currentPage,
              pagination.limit,
              debouncedSearch,
              filterPosition,
              filterWorkLocation,
            );
          }}
        />,
      );
      return;
    }
  };

  if (isAuthLoading || isWorkLocationLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
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
        <h5>{t("user_dashboard_page.title")}</h5>
        <NavLink to={"/admin/user/add"}>
          <Button buttonType="primary" buttonSize="medium" icon={Plus}>
            {t("user_dashboard_page.add_user_button_label")}
          </Button>
        </NavLink>
      </div>
      <div className="grid md:grid-cols-3 grid-cols-1 gap-5 items-center pt-4 pb-2">
        <DropdownInput
          name="position"
          value={filterPosition}
          options={positionOptions}
          placeholder="Filter Position"
          onChange={handleFilterPosition}
        />

        <TextInput
          type="text"
          placeholder={t("user_dashboard_page.search_name_placeholder")}
          value={filterName}
          onChange={handleFilterName}
        />
        <DropdownInput
          className="span-2"
          name="workLocation"
          value={filterWorkLocation}
          options={workLocationOptions}
          placeholder="Filter Work Location"
          onChange={handleFilterWorkLocation}
        />
      </div>
      <div className="grid grid-cols-4 text-center pt-4 pb-2">
        <h6>{t("user_dashboard_page.table_header_position")}</h6>
        <h6>{t("user_dashboard_page.table_header_full_name")}</h6>
        <h6>{t("user_dashboard_page.table_header_work_location")}</h6>
        <h6>{t("user_dashboard_page.table_header_actions")}</h6>
      </div>
      {users.length === 0 && (
        <p className="text-center mt-4">
          {t("user_dashboard_page.user_not_found")}
        </p>
      )}
      <div
        className="flex flex-col gap-2 w-full justify-between pt-2"
        onClick={(e) => handleDeleteAction(e)}
      >
        {users.length > 0 &&
          users.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-4 gap-4 px-3 py-2 hover:bg-gray-100 items-center rounded-md cursor-pointer"
            >
              <div className="bg-white-shadow bg-opacity-50 rounded-full items-center text-center">
                <h6 className="text-accent md:hidden">
                  {toTitleCase(user.position).charAt(0)}
                </h6>
                <h6 className="text-accent hidden md:inline">
                  {toTitleCase(user.position)}
                </h6>
              </div>
              <p className="text-center  md:hidden">{user.lastName}</p>
              <p className="text-center hidden md:inline">
                {user.firstName} {user.middleName} {user.lastName}
              </p>
              <p className="text-center">{user.workLocationId?.name || "-"}</p>

              <div className="grid md:grid-cols-2 grid-cols-1 gap-2">
                <NavLink to={`/admin/user/${user._id}`}>
                  <Button
                    buttonType="secondary"
                    buttonSize="icon"
                    icon={PenBoxIcon}
                  />
                </NavLink>
                <Button
                  className="delete-btn"
                  buttonSize="icon"
                  buttonType="danger"
                  icon={Trash2}
                  data-id={user._id}
                  data-name={user.firstName + user.lastName}
                ></Button>
              </div>
            </div>
          ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={pagination.totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default UserPageDashboard;
