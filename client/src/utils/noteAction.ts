import { showErrorToast, showSuccessToast } from "./toast";

interface UpdateNoteStatusParams {
  noteId: string;
  email: string;
  action: "archive" | "trash";
  currentStatus: boolean;
}

export const updateNoteStatus = async ({
  noteId,
  email,
  action,
  currentStatus,
}: UpdateNoteStatusParams) => {
  try {
    const updateField = action === "archive" ? "isArchived" : "isTrashed";
    const newStatus = !currentStatus;

    const response = await fetch(
      `${import.meta.env.VITE_APP_BACKEND_ROOT_URL}/notes/${noteId}?email=${email}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [updateField]: newStatus,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success) {
      const messages = {
        archive: newStatus ? "Note archived!" : "Note unarchived!",
        trash: newStatus ? "Note moved to trash!" : "Note restored!",
      };
      showSuccessToast(messages[action]);
      return true;
    } else {
      showErrorToast(result.message || `Failed to ${action} note`);
      return false;
    }
  } catch (error) {
    console.error(`Error ${action}ing note:`, error);
    showErrorToast(`Failed to ${action} note`);
    return false;
  }
};
