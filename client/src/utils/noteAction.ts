import { showErrorToast, showSuccessToast } from "./toast";
import { NoteStatus } from "../Types";

interface UpdateNoteStatusParams {
  noteId: string;
  email: string;
  status: NoteStatus;
}

export const updateNoteStatus = async ({
  noteId,
  email,
  status,
}: UpdateNoteStatusParams) => {
  try {
    const token = localStorage.getItem("access-token");
    const response = await fetch(
      `${
        import.meta.env.VITE_APP_BACKEND_ROOT_URL
      }/notes/${noteId}?email=${email}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    const result = await response.json();
    if (result.success) {
      const messages = {
        [NoteStatus.ARCHIVED]: "Note archived!",
        [NoteStatus.TRASHED]: "Note moved to trash!",
        [NoteStatus.ACTIVE]: "Note restored!",
      };
      showSuccessToast(messages[status]);
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    showErrorToast(`Failed to update note status`);
    return false;
  }
};

// Specific action functions for easier usage
export const archiveNote = (noteId: string, email: string) =>
  updateNoteStatus({ noteId, email, status: NoteStatus.ARCHIVED });

export const trashNote = (noteId: string, email: string) =>
  updateNoteStatus({ noteId, email, status: NoteStatus.TRASHED });

export const restoreNote = (noteId: string, email: string) =>
  updateNoteStatus({ noteId, email, status: NoteStatus.ACTIVE });
