import { useEffect, useState } from "react";
import { useUserStore } from "../../stores/user.store.js";
import { Loader, PenBoxIcon, Trash2 } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Plus } from "lucide-react";
import { DeleteConfirmationForm } from "../../components/delete.confirmation.jsx";
import Button from "../../components/button";
import Modal from "../../components/modal.jsx";

const UserPageDashboard = () => {
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

  // * USE STORE
  const { isLoading, users, fetchUsers, deleteUser } = useUserStore();

  // * USE EFFECT - INITIAL DATA LOAD
  useEffect(() => {
    fetchUsers();
  }, []);

  console.log(users);
  // * DELETE ACTION HANDLER
  const handleDeleteAction = (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (deleteButton) {
      openModal(
        "Delete Account",
        <DeleteConfirmationForm
          itemName={deleteButton.dataset.name}
          onDelete={deleteUser}
          itemId={deleteButton.dataset.id}
          onClose={() => {
            closeModal();
            fetchUsers();
          }}

          // redirect={navigate(-1)}
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
        <h5>User Dashboard</h5>
        <NavLink to={"/admin/user/add"}>
          <Button buttonType="primary" buttonSize="medium" icon={Plus}>
            Add User
          </Button>
        </NavLink>
      </div>
      <div className="grid grid-cols-3 text-center pt-4 pb-2">
        <h6>Full Name</h6>
        <h6>Work Location</h6>
        <h6>Actions</h6>
      </div>
      {users.length === 0 && (
        <p className="text-center mt-4">No users found.</p>
      )}

      <div
        className="flex flex-col gap-2 w-full justify-between pt-2"
        onClick={(e) => handleDeleteAction(e)}
      >
        {users.length > 0 &&
          users.map((user) => (
            <div
              key={user._id}
              className="grid grid-cols-3 gap-4 px-3 py-2 hover:bg-gray-100 items-center ounded-md cursor-pointer"
            >
              <p className="text-center">
                {user.firstName} {user.middleName} {user.lastName}
              </p>
              <p className="text-center">{user.workLocationId.name}</p>

              <div className="ml-auto flex flex-row gap-2 items-end">
                <Button
                  className="delete-btn"
                  buttonSize="small"
                  buttonType="danger"
                  icon={Trash2}
                  data-id={user._id}
                  data-name={user.firstName}
                ></Button>
                <NavLink to={`/admin/user/${user._id}`}>
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

export default UserPageDashboard;
