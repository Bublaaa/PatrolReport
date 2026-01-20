import { useEffect, useState } from "react";
import { Plus, Loader, Trash2, PenBoxIcon } from "lucide-react";
import { NavLink } from "react-router-dom";
import { usePatrolPointStore } from "../../stores/patrol.point.store.js";
import { DeleteConfirmationForm } from "../../components/delete.confirmation";
import { toTitleCase } from "../../utils/toTitleCase.js";
import Modal from "../../components/modal";
import Button from "../../components/button";

const PatrolPointPageDashboard = () => {
  // * USE STATE
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    body: "",
  });
  // * MODAL FUNCTION
  const openModal = (title, body) =>
    setModalState({ isOpen: true, title, body });
  const closeModal = () =>
    setModalState({ isOpen: false, title: "", body: null });

  // * USE STORE
  const { isLoading, patrolPoints, deletePatrolPoint, fetchPatrolPoints } =
    usePatrolPointStore();
  useEffect(() => {
    fetchPatrolPoints();
  }, []);

  // * DELETE ACTION HANDLER
  const handleDeleteAction = (e) => {
    const deleteButton = e.target.closest(".delete-btn");
    if (deleteButton) {
      openModal(
        "Delete Account",
        <DeleteConfirmationForm
          itemName={deleteButton.dataset.name}
          onDelete={deletePatrolPoint}
          itemId={deleteButton.dataset.id}
          onClose={() => {
            closeModal();
            fetchPatrolPoints();
          }}
        />
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
        <h5>Patrol Points Dashboard</h5>
        <NavLink to={"/admin/patrol-point/add"}>
          <Button buttonType="primary" buttonSize="medium" icon={Plus}>
            Add Patrol Point
          </Button>
        </NavLink>
      </div>

      {patrolPoints.length === 0 && (
        <p className="text-center mt-4">No patrol points found.</p>
      )}

      <div
        className="flex flex-col gap-2 w-full justify-between pt-2"
        onClick={(e) => handleDeleteAction(e)}
      >
        {patrolPoints.length > 0 &&
          patrolPoints.map((point) => (
            <div
              key={point._id}
              className="flex flex-row gap-4 px-3 py-2 hover:bg-gray-100 rounded-md justify-between items-center cursor-pointer"
            >
              <p>{toTitleCase(point.name)}</p>
              <div className="flex flex-row gap-2">
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
