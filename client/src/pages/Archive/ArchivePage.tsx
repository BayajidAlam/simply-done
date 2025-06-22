import { useState } from "react";
import { useAppContext } from "../../providers/AppProvider";
import useFetchNotes from "../../hooks/useNotes";
import useAuth from "../../hooks/useAuth";
import { trashNote, restoreNote } from "../../utils/noteAction";
import useDeleteNote from "../../hooks/useDeleteNote";
import { INoteTypes, NoteStatus } from "../../Types";
import LoadingState from "../../components/Shared/LoadingState";
import EmptyState from "../../components/Shared/EmptyState";
import NoteCard from "../../components/Shared/NoteCard";
import Modal from "../../components/Modal/Modal";
import { useQueryClient } from "@tanstack/react-query";

const ArchivePage = () => {
  const { isListView, searchTerm } = useAppContext();
  const { user } = useAuth();
  const userEmail = user?.email as string;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<INoteTypes | null>(null);

  const queryClient = useQueryClient();

  const { notes, notesLoading, refetch } = useFetchNotes({
    email: userEmail,
    searchTerm: searchTerm || "",
    status: NoteStatus.ARCHIVED, // Only get archived notes
  });

  const { deleteNote } = useDeleteNote({
    email: userEmail,
    onSuccess: refetch,
  });

  const openModal = (note: INoteTypes) => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    await deleteNote(noteId);
  };

  const handleTrash = async (e: React.MouseEvent, note: INoteTypes) => {
    e.stopPropagation();
    const success = await trashNote(note._id, userEmail);
    if (success) {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  };

  const handleRestore = async (e: React.MouseEvent, note: INoteTypes) => {
    e.stopPropagation();
    const success = await restoreNote(note._id, userEmail);
    if (success) {
      refetch();
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    }
  };

  if (notesLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50/30 to-orange-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Archived Notes
              </h1>
              <p className="text-slate-600">
                {notes?.length > 0
                  ? `${notes.length} archived ${
                      notes.length === 1 ? "note" : "notes"
                    }`
                  : "No archived notes yet"}
              </p>
            </div>

            {/* Quick Stats */}
            {notes?.length > 0 && (
              <div className="hidden md:flex items-center gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">
                    {notes.filter((note) => note.isTodo).length}
                  </div>
                  <div className="text-xs text-slate-500">Todo Lists</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {notes.filter((note) => !note.isTodo).length}
                  </div>
                  <div className="text-xs text-slate-500">Text Notes</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes Grid */}
        {notes?.length === 0 ? (
          <EmptyState
            title="No archived notes"
            description="Archive notes from your home page to see them here."
            icon="📋"
          />
        ) : (
          <div className="space-y-6">
            {/* Search Results Info */}
            {searchTerm && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800">
                  Found <span className="font-semibold">{notes.length}</span>{" "}
                  archived notes matching "
                  <span className="font-semibold">{searchTerm}</span>"
                </p>
              </div>
            )}

            {/* Notes Grid */}
            <div
              className={`transition-all duration-500 ease-in-out ${
                isListView
                  ? "space-y-4" // List view with vertical spacing
                  : "grid gap-6 auto-rows-fr grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              }`}
            >
              {notes.map((note: INoteTypes) => (
                <NoteCard
                  key={note._id?.toString()}
                  note={note}
                  onEdit={openModal}
                  onTrash={handleTrash}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                  showArchiveButton={false}
                  showTrashButton={true}
                  showRestoreButton={true}
                  showDeleteButton={true}
                  isListView={isListView}
                />
              ))}
            </div>
          </div>
        )}

        {/* Modal */}
        <Modal
          refetch={refetch}
          isOpen={isModalOpen}
          setIsOpen={setIsModalOpen}
          selectedNote={selectedNote as INoteTypes}
        />
      </div>
    </div>
  );
};

export default ArchivePage;