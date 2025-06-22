import { useState } from "react";
import { useAppContext } from "../../providers/AppProvider";
import useFetchNotes from "../../hooks/useNotes";
import useAuth from "../../hooks/useAuth";
import { updateNoteStatus } from "../../utils/noteAction";
import { useQueryClient } from "@tanstack/react-query";
import useDeleteNote from "../../hooks/useDeleteNote";
import { INoteTypes } from "../../Types";
import { HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import LoadingState from "../../components/Shared/LoadingState";
import EmptyState from "../../components/Shared/EmptyState";
import NoteCard from "../../components/Shared/NoteCard";
import Modal from "../../components/Modal/Modal";

const AchievePage = () => {
  const { isListView } = useAppContext();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<INoteTypes | null>(null);

  const { user } = useAuth();
  const userEmail = user?.email as string;

  const queryClient = useQueryClient();

  const { notes, notesLoading, refetch } = useFetchNotes({
    email: userEmail,
    searchTerm: "",
    isTrashed: false,
    isArchived: true,
  });

  const { deleteNote } = useDeleteNote({
    email: userEmail,
    onSuccess: refetch,
  });

  const openModal = (note: INoteTypes): void => {
    setSelectedNote(note);
    setIsModalOpen(true);
  };

  const handleDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
    await deleteNote(noteId);
  };

  const handleTrash = async (e: React.MouseEvent, note: INoteTypes) => {
    e.stopPropagation();

    const success = await updateNoteStatus({
      noteId: note._id,
      email: userEmail,
      action: "trash",
      currentStatus: note.isTrashed,
      queryClient,
      currentPage: "archive",
    });
  };

  const handleRestoreToHome = async (e: React.MouseEvent, note: INoteTypes) => {
    e.stopPropagation();

    const success = await updateNoteStatus({
      noteId: note._id,
      email: userEmail,
      action: "restore",
      queryClient,
      currentPage: "archive",
    });
  };

  if (notesLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/30 to-yellow-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-amber-100 rounded-xl">
              <HiOutlineArchiveBoxArrowDown className="w-8 h-8 text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Archive</h1>
              <p className="text-slate-600">
                {notes?.length > 0
                  ? `${notes.length} archived ${
                      notes.length === 1 ? "note" : "notes"
                    }`
                  : "No archived notes yet"}
              </p>
            </div>
          </div>

          {/* Archive Info Banner */}
          {notes?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-amber-400 rounded-full mt-0.5 flex-shrink-0"></div>
                <div>
                  <h3 className="font-semibold text-amber-800 mb-1">
                    Archived Notes
                  </h3>
                  <p className="text-amber-700 text-sm">
                    These notes are hidden from your main workspace but
                    preserved for future reference. You can restore them to your
                    home page or move them to trash.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Notes Grid */}
        {notes?.length === 0 ? (
          <EmptyState
            title="No archived notes"
            description="Notes you archive will appear here. Archive notes to keep them safe but out of your main workspace."
            icon="📁"
            actionText="Go to Notes"
            actionLink="/"
          />
        ) : (
          <div className="space-y-6">
            {/* Notes Grid */}
            <div
              className={`grid gap-6 transition-all duration-500 ease-in-out ${
                isListView
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {notes.map((note: INoteTypes) => (
                <NoteCard
                  key={note._id?.toString()}
                  note={note}
                  onEdit={openModal}
                  onTrash={handleTrash}
                  onRestore={handleRestoreToHome}
                  onDelete={handleDelete}
                  showRestoreButton={true}
                  showArchiveButton={false}
                  showTrashButton={true}
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

export default AchievePage;
