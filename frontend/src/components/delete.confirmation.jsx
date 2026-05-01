import { useState } from "react";
import { toast } from "react-hot-toast";
import { TextInput } from "./inputs.jsx";
import { Trash2Icon } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "./button.jsx";

export const DeleteConfirmationForm = ({
  itemName, // required string: name to display & match
  onDelete, // async delete function: receives itemId
  itemId, // the ID to delete
  onClose, // function to close the modal
  redirect, // optional function like navigate(-1)
}) => {
  const { t } = useTranslation();
  const [confirmationText, setConfirmationText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (confirmationText.trim() !== itemName.trim()) {
      toast.error(t("delete_modal.confirmation_error"));
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
        {t("delete_modal.confirmation_body_1")}{" "}
        <span className="font-semibold">{itemName}</span>{" "}
        {t("delete_modal.confirmation_body_2")}
      </p>
      <TextInput
        type="text"
        label={t("delete_modal.field_label")}
        name="confirmation"
        onChange={(e) => setConfirmationText(e.target.value)}
      />
      <Button
        type="submit"
        buttonType="danger"
        buttonSize="medium"
        className="w-fit items-end"
      >
        {t("delete_modal.confirm_button_label")}
        <Trash2Icon />
      </Button>
    </form>
  );
};
