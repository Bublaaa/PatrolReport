import { FolderCogIcon, Link, Loader, Minus, UserCog2 } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { useUserStore } from "../../stores/user.store";
import { useSystemSettingStore } from "../../stores/system.setting.store";
import { useEffect, useState } from "react";
import { Trash2, PenBoxIcon, Plus } from "lucide-react";
import { NavLink } from "react-router-dom";
import { toTitleCase } from "../../utils/toTitleCase";
import { DeleteConfirmationForm } from "../../components/delete.confirmation.jsx";
import Button from "../../components/button";
import Modal from "../../components/modal.jsx";

const SettingPageDashboard = () => {
  const DRIVE_URL_PREFIX = "https://drive.google.com/drive/u/0/folders/";
  //* USE STORE
  const {
    users: admins,
    getAllAuth,
    deleteAuth,
    isLoading: isAdminLoading,
  } = useAuthStore();
  const {
    users,
    fetchUsers,
    updateUser,
    isLoading: isUserLoading,
  } = useUserStore();
  const {
    systemSettingDetail,
    fetchDriveFolderId,
    isLoading: isSystemSettingLoading,
  } = useSystemSettingStore();

  //* USE STATE
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    body: "",
  });
  //* MODAL STATE FUNCTION
  const openModal = (title, body) =>
    setModalState({ isOpen: true, title, body });
  const closeModal = () =>
    setModalState({ isOpen: false, title: "", body: null });
  const getAuthId = (userId) => {
    const auth = admins.find((auth) => auth.userId?._id.toString() === userId);
    return auth ? auth._id : null;
  };
  const getUserDetail = (userId) => {
    const userDetail = users.find((user) => user._id.toString() === userId);
    return userDetail ? userDetail : null;
  };

  // * DELETE ACTION HANDLER
  const handleDeleteAction = (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (!deleteButton) return;
    const userId = deleteButton.dataset.id;
    const authId = getAuthId(userId);

    if (!authId) {
      console.error("Auth ID not found for user:", userId);
      return;
    }
    const userDetail = getUserDetail(userId);
    if (!userDetail) {
      console.error("User detail not found for user:", userId);
      return;
    }

    openModal(
      "Delete Account",
      <DeleteConfirmationForm
        itemName={deleteButton.dataset.name}
        itemId={authId}
        onDelete={async () => {
          await deleteAuth(authId);
          await updateUser(
            userId,
            userDetail.firstName,
            userDetail.middleName,
            userDetail.lastName,
            "user"
          );

          await fetchUsers();
          await getAllAuth();
          closeModal();
        }}
        onClose={() => {
          closeModal();
          fetchUsers();
        }}
      />
    );
  };

  function fetchInitialData() {
    fetchUsers();
    getAllAuth();
    fetchDriveFolderId();
  }
  //* USE EFFECT
  useEffect(() => {
    fetchInitialData();
  }, []);

  if (isAdminLoading || isUserLoading || isSystemSettingLoading) {
    return <Loader className="w-6 h-6 animate-spin mx-auto" />;
  }
  return (
    <div className="flex flex-col w-full gap-5">
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        body={modalState.body}
      />
      <div className="flex flex-row bg-white rounded-lg px-6 py-4 shadow-md justify-between items-center gap-5">
        <h5>Setting Dashboard</h5>
      </div>
      <div className="flex flex-col bg-white rounded-lg px-6 py-4 shadow-md justify-between items-start gap-5">
        <div className="flex flex-row gap-5 items-center w-full">
          <UserCog2 />
          <h6 className="mr-auto">Admin Setting</h6>
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
                className="flex flex-row gap-4 px-3 py-2 hover:bg-gray-100 rounded-md justify-between items-center cursor-pointer"
              >
                <p>{toTitleCase(user.position)}</p>
                <p>
                  {user.firstName} {user.middleName} {user.lastName}
                </p>
                <div className="flex flex-row gap-2">
                  {user.position === "admin" && (
                    <Button
                      className="delete-btn"
                      buttonType="danger"
                      buttonSize="medium"
                      icon={Minus}
                      data-id={user._id}
                      data-name={user.firstName}
                    >
                      Remove Admin
                    </Button>
                  )}
                  {user.position !== "admin" && (
                    <NavLink to={`/admin/setting/account/create/${user._id}`}>
                      <Button
                        buttonType="secondary"
                        buttonSize="medium"
                        icon={Plus}
                      >
                        Add Admin
                      </Button>
                    </NavLink>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="flex flex-col bg-white rounded-lg px-6 py-4 shadow-md justify-between items-center gap-5">
        <div className="flex flex-row gap-5 w-full items-center">
          <FolderCogIcon />
          <h6 className="mr-auto">Storage Setting</h6>
          <NavLink to={`/admin/setting/drive-link/update`}>
            <Button
              buttonType="secondary"
              buttonSize="icon"
              icon={PenBoxIcon}
            />
          </NavLink>
        </div>
        <div className="flex flex-wrap gap-5 w-full items-center">
          <p className="max-w-full break-words">
            Drive link: {DRIVE_URL_PREFIX}${systemSettingDetail}
          </p>
          <a
            href={`${DRIVE_URL_PREFIX}${systemSettingDetail}`}
            buttonType="secondary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Drive Folder
          </a>
        </div>
      </div>
    </div>
  );
};
export default SettingPageDashboard;
