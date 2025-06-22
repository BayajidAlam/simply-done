import { useState } from "react";
import { showSuccessToast, showErrorToast } from "../utils/toast";

interface UseDeleteNoteParams {
  email: string;
  onSuccess?: () => void;
}

const useDeleteNote = ({ email, onSuccess }: UseDeleteNoteParams) => {
  const [isLoading, setIsLoading] = useState(false);

  const deleteNote = async (noteId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_ROOT_URL}/notes/${noteId}?email=${email}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Your backend returns { success: true, message: "Note deleted successfully" }
      if (data.success) {
        showSuccessToast(data.message || "Note deleted successfully");
        onSuccess?.();
        return true;
      } else {
        showErrorToast(data.message || "Failed to delete note");
        return false;
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      showErrorToast("Error deleting note");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteNote, isLoading };
};

export default useDeleteNote;