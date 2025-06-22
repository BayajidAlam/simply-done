import { showErrorToast, showSuccessToast } from "./toast";

interface UpdateNoteStatusParams {
  noteId: string;
  email: string;
  action: "archive" | "trash" | "restore";
  currentStatus?: boolean;
  queryClient: any;
  currentPage: "home" | "archive" | "trash";
}

export const updateNoteStatus = async ({
  noteId,
  email,
  action,
  currentStatus,
  queryClient,
  currentPage,
}: UpdateNoteStatusParams) => {
  try {
    let requestBody;
    
    // Handle different actions
    if (action === "restore") {
      requestBody = {
        isArchived: false,
        isTrashed: false,
      };
    } else {
      requestBody = {
        [action === "archive" ? "isArchived" : "isTrashed"]: !currentStatus,
      };
    }

    const response = await fetch(
      `${
        import.meta.env.VITE_APP_BACKEND_ROOT_URL
      }/notes/${noteId}?email=${email}`,
      {
        method: "PATCH",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result = await response.json();
    if (result.success) {
      const messages = {
        archive: currentStatus ? "Note unarchived!" : "Note archived!",
        trash: currentStatus ? "Note restored!" : "Note moved to trash!",
        restore: "Note restored to home!",
      };
      showSuccessToast(messages[action]);
      
      // Invalidate only specific pages based on current page and action
      await invalidateSpecificPages(queryClient, email, action, currentPage);
      
      return true;
    }
    return false;
  } catch (error) {
    console.error(error);
    showErrorToast(`Failed to ${action} note`);
    return false;
  }
};

// Helper function to invalidate only specific relevant pages
const invalidateSpecificPages = async (
  queryClient: any,
  email: string,
  action: "archive" | "trash" | "restore",
  currentPage: "home" | "archive" | "trash"
) => {
  const queries = [];

  // Define query keys for each page
  const homeQuery = ["notes", email, "", false, false];
  const archiveQuery = ["notes", email, "", false, true];
  const trashQuery = ["notes", email, "", true, false];

  if (currentPage === "home") {
    // From Home page
    queries.push(homeQuery); // Always refresh current page
    
    if (action === "archive") {
      queries.push(archiveQuery); // Also refresh archive page
    } else if (action === "trash") {
      queries.push(trashQuery); // Also refresh trash page
    }
  } 
  else if (currentPage === "archive") {
    // From Archive page
    queries.push(archiveQuery); // Always refresh current page
    
    if (action === "trash") {
      queries.push(trashQuery); // Also refresh trash page
    } else if (action === "restore") {
      queries.push(homeQuery); // Also refresh home page
    }
  } 
  else if (currentPage === "trash") {
    // From Trash page
    queries.push(trashQuery); // Always refresh current page
    
    if (action === "archive") {
      queries.push(archiveQuery); // Also refresh archive page
    } else if (action === "restore") {
      queries.push(homeQuery); // Also refresh home page
    }
  }

  // Invalidate only the specific queries
  for (const queryKey of queries) {
    await queryClient.invalidateQueries({ queryKey });
  }
};