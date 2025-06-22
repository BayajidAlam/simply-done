import { useState } from "react";
import { useAppContext } from "../../providers/AppProvider";
import useFetchNotes from "../../hooks/useNotes";
import useAuth from "../../hooks/useAuth";
import { updateNoteStatus } from "../../utils/noteAction";
import { useQueryClient } from "@tanstack/react-query";
import useDeleteNote from "../../hooks/useDeleteNote";
import { INoteTypes } from "../../Types";
import { GoTrash } from "react-icons/go";
import { RiDeleteBin2Line } from "react-icons/ri";
import LoadingState from "../../components/Shared/LoadingState";
import EmptyState from "../../components/Shared/EmptyState";
import NoteCard from "../../components/Shared/NoteCard";
import Modal from "../../components/Modal/Modal";

const TrashPage = () => {
  const { isListView } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<INoteTypes | null>(null);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [isSelectMode, setIsSelectMode] = useState(false);

  const { user } = useAuth();
  const userEmail = user?.email as string;

  const queryClient = useQueryClient();

  const { notes, notesLoading, refetch } = useFetchNotes({
    email: userEmail,
    searchTerm: "",
    isTrashed: true,
    isArchived: false,
  });

  const { deleteNote } = useDeleteNote({
    email: userEmail,
    onSuccess: refetch,
  });

  const openModal = (note: INoteTypes): void => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleArchive = async (e: React.MouseEvent, note: INoteTypes) => {
    e.stopPropagation();

    const success = await updateNoteStatus({
      noteId: note._id,
      email: userEmail,
      action: "archive",
      currentStatus: note.isArchived,
      queryClient,
      currentPage: "trash",
    });
  };

  const handleRestoreToHome = async (e: React.MouseEvent, note: INoteTypes) => {
    e.stopPropagation();

    const success = await updateNoteStatus({
      noteId: note._id,
      email: userEmail,
      action: "restore",
      queryClient,
      currentPage: "trash",
    });
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    if (
      window.confirm(
        "Are you sure you want to permanently delete this note? This action cannot be undone."
      )
    ) {
      await deleteNote(noteId);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedNotes.length === 0) return;

    if (window.confirm(`Restore ${selectedNotes.length} notes to home?`)) {
      for (const noteId of selectedNotes) {
        const note = notes?.find((n) => n._id === noteId);
        if (note) {
          await updateNoteStatus({
            noteId: note._id,
            email: userEmail,
            action: "restore",
            queryClient,
            currentPage: "trash",
          });
        }
      }
      setSelectedNotes([]);
      setIsSelectMode(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedNotes.length === 0) return;

    if (
      window.confirm(
        `Permanently delete ${selectedNotes.length} notes? This action cannot be undone.`
      )
    ) {
      for (const noteId of selectedNotes) {
        await deleteNote(noteId);
      }
      setSelectedNotes([]);
      setIsSelectMode(false);
    }
  };

  const toggleNoteSelection = (noteId: string) => {
    setSelectedNotes((prev) =>
      prev.includes(noteId)
        ? prev.filter((id) => id !== noteId)
        : [...prev, noteId]
    );
  };

  const selectAllNotes = () => {
    if (selectedNotes.length === notes?.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes?.map((note) => note._id!) || []);
    }
  };

  if (notesLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50/30 to-rose-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-xl">
                <GoTrash className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Trash</h1>
                <p className="text-slate-600">
                  {notes?.length > 0
                    ? `${notes.length} ${
                        notes.length === 1 ? "note" : "notes"
                      } in trash`
                    : "Trash is empty"}
                </p>
              </div>
            </div>

            {/* Select Mode Toggle */}
            {notes?.length > 0 && (
              <button
                onClick={() => {
                  setIsSelectMode(!isSelectMode);
                  setSelectedNotes([]);
                }}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg 
                  hover:bg-slate-50 transition-colors text-sm font-medium"
              >
                {isSelectMode ? "Cancel" : "Select"}
              </button>
            )}
          </div>

          {/* Trash Info Banner */}
          {notes?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-400 rounded-full mt-0.5 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">
                    Notes in Trash
                  </h3>
                  <p className="text-red-700 text-sm">
                    These notes will be permanently deleted after 30 days. You
                    can restore them to your home page, archive them, or delete
                    them permanently.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {notes?.length === 0 ? (
          <EmptyState
            title="Trash is empty"
            description="Deleted notes will appear here. You can restore them to your home page or delete them permanently."
            icon="🗑️"
            actionText="Go to Notes"
            actionLink="/"
          />
        ) : (
          <div className="space-y-6">
            {/* Bulk Actions Bar */}
            {isSelectMode && (
              <div className="bg-white border border-red-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={selectAllNotes}
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 
                        hover:text-slate-800 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedNotes.length === notes?.length}
                        readOnly
                        className="rounded"
                      />
                      Select All ({notes?.length})
                    </button>

                    {selectedNotes.length > 0 && (
                      <span className="text-sm text-slate-600">
                        {selectedNotes.length} selected
                      </span>
                    )}
                  </div>

                  {selectedNotes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleBulkRestore}
                        className="px-4 py-2 text-sm bg-emerald-100 text-emerald-700 rounded-lg 
                          hover:bg-emerald-200 transition-colors font-medium"
                      >
                        Restore ({selectedNotes.length})
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg 
                          hover:bg-red-200 transition-colors font-medium"
                      >
                        Delete Forever ({selectedNotes.length})
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Notes Grid */}
            <div
              className={`grid gap-6 transition-all duration-500 ease-in-out ${
                isListView
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {notes.map((note: INoteTypes) => (
                <div key={note._id?.toString()} className="relative">
                  {/* Selection Checkbox */}
                  {isSelectMode && (
                    <div className="absolute top-2 left-2 z-10">
                      <input
                        type="checkbox"
                        checked={selectedNotes.includes(note._id!)}
                        onChange={() => toggleNoteSelection(note._id!)}
                        className="w-4 h-4 text-blue-600 bg-white border-2 border-slate-300 
                          rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                  )}

                  <NoteCard
                    note={note}
                    onEdit={openModal}
                    onArchive={handleArchive}
                    onRestore={handleRestoreToHome}
                    onDelete={handleDelete}
                    showRestoreButton={true}
                    showArchiveButton={true}
                    showTrashButton={false}
                    showDeleteButton={true}
                    isListView={isListView}
                  />
                </div>
              ))}
            </div>

            {/* Empty Trash Button */}
            {notes.length > 0 && !isSelectMode && (
              <div className="flex justify-center pt-8">
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to permanently delete ALL notes in trash? This action cannot be undone."
                      )
                    ) {
                      notes.forEach((note) => deleteNote(note._id!));
                    }
                  }}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white 
                    rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg 
                    hover:shadow-xl transform hover:scale-105"
                >
                  <RiDeleteBin2Line className="w-5 h-5" />
                  Empty Trash
                </button>
              </div>
            )}
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

export default TrashPage;
