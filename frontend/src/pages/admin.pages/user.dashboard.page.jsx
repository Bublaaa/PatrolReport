import { useEffect, useState, useMemo } from "react";
import { Loader, PenBoxIcon, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { DeleteConfirmationForm } from "../../components/delete.confirmation.jsx";
import { useAuthStore } from "../../stores/auth.store.js";
import { toTitleCase } from "../../utils/toTitleCase.js";
import { DropdownInput, TextInput } from "../../components/inputs.jsx";
import Button from "../../components/button";
import Modal from "../../components/modal.jsx";
import { useWorkLocationStore } from "../../stores/work.location.store.js";
import {
  buildDropdownOptions,
  buildPositionDropdownOptions,
} from "../../utils/constants.js";

const UserPageDashboard = () => {
  // * USE STATE
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    body: "",
  });
  const [filterName, setFilterName] = useState("");
  const [selectedWorkLocation, setSelectedWorkLocation] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  // * MODAL STATE FUNCTION
  const openModal = (title, body) =>
    setModalState({ isOpen: true, title, body });
  const closeModal = () =>
    setModalState({ isOpen: false, title: "", body: null });

  // * USE STORE
  const { isLoading, users, getAllAuth, deleteAuth } = useAuthStore();
  const {
    isLoading: isWorkLocationLoading,
    fetchWorkLocations,
    workLocations,
  } = useWorkLocationStore();

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    getAllAuth();
    fetchWorkLocations();
  }, []);

  // * DROPDOWN OPTIONS
  const workLocationOptions = useMemo(() =>
    buildDropdownOptions(workLocations, {
      includeAll: true,
      allLabel: "All Locations",
      allValue: "",
    }),
  );
  const positionOptions = useMemo(() =>
    buildPositionDropdownOptions({
      includeAll: true,
      allLabel: "All Positions",
      allValue: "",
    }),
  );

  // * FILTER FUNCTIONS
  const handleFilterPosition = (e) => {
    setSelectedPosition(e.target.value);
  };

  const handleFilterWorkLocation = (e) => {
    setSelectedWorkLocation(e.target.value);
  };
  const handleFilterName = (e) => {
    setFilterName(e.target.value);
  };
  // * DELETE ACTION HANDLER
  const handleDeleteAction = (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (deleteButton) {
      openModal(
        "Delete Account",
        <DeleteConfirmationForm
          itemName={deleteButton.dataset.name}
          onDelete={deleteAuth}
          itemId={deleteButton.dataset.id}
          onClose={() => {
            closeModal();
            getAllAuth();
          }}
        />,
      );
      return;
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchPosition =
      !selectedPosition || user.position === selectedPosition;

    const matchWorkLocation =
      !selectedWorkLocation ||
      user.workLocationId?._id === selectedWorkLocation;

    const fullName =
      `${user.firstName} ${user.middleName ?? ""} ${user.lastName}`
        .toLowerCase()
        .trim();

    const matchName =
      !filterName || fullName.includes(filterName.toLowerCase());

    return matchPosition && matchWorkLocation && matchName;
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
        <h5>User Dashboard</h5>
        <NavLink to={"/admin/user/add"}>
          <Button buttonType="primary" buttonSize="medium" icon={Plus}>
            Add User
          </Button>
        </NavLink>
      </div>
      <div className="grid md:grid-cols-4 grid-cols-2 gap-5 items-center pt-4 pb-2">
        <DropdownInput
          name="position"
          value={selectedPosition}
          options={positionOptions}
          placeholder="Filter Position"
          onChange={handleFilterPosition}
        />

        <TextInput
          type="text"
          placeholder="Search name"
          value={filterName}
          onChange={handleFilterName}
        />
        <DropdownInput
          className="span-2"
          name="workLocation"
          value={selectedWorkLocation}
          options={workLocationOptions}
          placeholder="Filter Work Location"
          onChange={handleFilterWorkLocation}
        />
      </div>
      <div className="grid grid-cols-4 text-center pt-4 pb-2">
        <h6>Position</h6>
        <h6>Full Name</h6>
        <h6>Work Location</h6>
        <h6>Actions</h6>
      </div>
      {filteredUsers.length === 0 && (
        <p className="text-center mt-4">No users found.</p>
      )}

      <div
        className="flex flex-col gap-2 w-full justify-between pt-2"
        onClick={(e) => handleDeleteAction(e)}
      >
        {filteredUsers.length > 0 &&
          filteredUsers.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-4 gap-4 px-3 py-2 hover:bg-gray-100 items-center rounded-md cursor-pointer"
            >
              <div className="bg-white-shadow bg-opacity-50 rounded-full items-center text-center">
                <h6 className="text-accent">{toTitleCase(user.position)}</h6>
              </div>
              <p className="text-center">
                {user.firstName} {user.middleName} {user.lastName}
              </p>
              <p className="text-center">{user.workLocationId.name}</p>

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

      <div className="flex flex-row gap-3"></div>
    </div>
  );
};

export default UserPageDashboard;
