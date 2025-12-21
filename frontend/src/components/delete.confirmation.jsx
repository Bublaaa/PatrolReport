import { useState } from "react";
import { toast } from "react-hot-toast";
import { TextInput } from "./Input";
import Button from "./button.jsx";
import { Trash2Icon } from "lucide-react";

export const DeleteConfirmationForm = ({
  itemName, // required string: name to display & match
  onDelete, // async delete function: receives itemId
  itemId, // the ID to delete
  onClose, // function to close the modal
  redirect, // optional function like navigate(-1)
}) => {
  const [confirmationText, setConfirmationText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (confirmationText.trim() !== itemName.trim()) {
      toast.error("Confirmation text does not match");
      return;
    }

    try {
      await onDelete(itemId);
      if (redirect) redirect();
    } catch (error) {
      // toast.error(`Failed to delete ${itemLabel}`);
    } finally {
      onClose(); // close the modal
    }
  };

  return (
    <form
      className="flex flex-col gap-3 overflow-y-auto p-2 scrollbar-hidden"
      onSubmit={handleSubmit}
    >
      <p className="select-none">
        Please type <span className="font-semibold">{itemName}</span> to confirm
        deletion.
      </p>
      <TextInput
        type="text"
        label="Confirmation"
        name="confirmation"
        onChange={(e) => setConfirmationText(e.target.value)}
      />
      <Button
        type="submit"
        buttonType="danger"
        buttonSize="medium"
        className="w-fit items-end"
      >
        Confirm
        <Trash2Icon />
      </Button>
    </form>
  );
};
