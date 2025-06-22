import { useQuery } from "@tanstack/react-query";
import { NoteStatus } from "../Types";

interface NotesParams {
  email: string;
  searchTerm?: string;
  status?: NoteStatus;
}

const useFetchNotes = ({
  email,
  searchTerm,
  status,
}: NotesParams) => {
  const {
    data: notes = [],
    isLoading: notesLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notes", email, searchTerm, status],
    queryFn: async () => {
      if (!email) {
        throw new Error("Email is required");
      }
      
      const params = new URLSearchParams();
      params.append("email", email);
      if (searchTerm) params.append("searchTerm", searchTerm);
      if (status) params.append("status", status);

      const url = `${
        import.meta.env.VITE_APP_BACKEND_ROOT_URL
      }/notes?${params.toString()}`;
      console.log("Fetching URL:", url);

      try {
        // Get token from localStorage
        const token = localStorage.getItem("access-token");
        
        const res = await fetch(url, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        
        const result = await res.json();
        console.log("API Response:", result);
        
        // Extract data field from response if it exists, otherwise return as-is
        const notesData = result.data || result;
        console.log("Extracted notes data:", notesData);
        
        // Ensure we return an array
        return Array.isArray(notesData) ? notesData : [];
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
    enabled: !!email,
    retry: 1,
    staleTime: 30000,
  });

  console.log("Query state:", {
    email,
    searchTerm,
    status,
    isLoading: notesLoading,
    error,
    notes,
  });

  return { notes, notesLoading, error, refetch };
};

export default useFetchNotes;