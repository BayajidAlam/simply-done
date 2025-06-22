import React from "react";
import { RiInboxArchiveLine } from "react-icons/ri";
import { GoTrash } from "react-icons/go";
import { BiHome } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";
import { MdAccessTime } from "react-icons/md";
import { BsListCheck } from "react-icons/bs";
import { INoteTypes, NoteStatus } from "../../Types";

interface NoteCardProps {
  note: INoteTypes;
  onEdit: (note: INoteTypes) => void;
  onArchive?: (e: React.MouseEvent, note: INoteTypes) => void;
  onTrash?: (e: React.MouseEvent, note: INoteTypes) => void;
  onRestore?: (e: React.MouseEvent, note: INoteTypes) => void;
  onDelete?: (e: React.MouseEvent, noteId: string) => void;
  showRestoreButton?: boolean;
  showArchiveButton?: boolean;
  showTrashButton?: boolean;
  showDeleteButton?: boolean;
  isListView?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onArchive,
  onTrash,
  onRestore,
  onDelete,
  showRestoreButton = false,
  showArchiveButton = true,
  showTrashButton = true,
  showDeleteButton = false,
  isListView = false,
}) => {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCompletedTodos = () => {
    if (!note.isTodo || !note.todos) return { completed: 0, total: 0 };
    const completed = note.todos.filter((todo) => todo.isCompleted).length;
    return { completed, total: note.todos.length };
  };

  const { completed, total } = getCompletedTodos();
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;

  // Determine card styling based on note status
  const getCardStyling = () => {
    switch (note.status) {
      case NoteStatus.TRASHED:
        return "border-red-200 bg-red-50/50 hover:bg-red-50/80";
      case NoteStatus.ARCHIVED:
        return "border-amber-200 bg-amber-50/50 hover:bg-amber-50/80";
      case NoteStatus.ACTIVE:
      default:
        return "border-slate-200 bg-white hover:bg-slate-50/50";
    }
  };

  const getLeftBorder = () => {
    switch (note.status) {
      case NoteStatus.TRASHED:
        return "border-l-red-400";
      case NoteStatus.ARCHIVED:
        return "border-l-amber-400";
      case NoteStatus.ACTIVE:
      default:
        return note.isTodo ? "border-l-blue-400" : "border-l-emerald-400";
    }
  };

  return (
    <div
      className={`group relative rounded-xl border-2 border-l-4 p-3 sm:p-4 transition-all duration-300 ease-in-out cursor-pointer
        hover:shadow-lg hover:shadow-slate-200/50 hover:-translate-y-1 transform flex flex-col
        ${getCardStyling()} ${getLeftBorder()} 
        ${isListView 
          ? "w-full max-w-4xl mx-auto min-h-[120px]" 
          : "w-full md:w-80 min-h-[280px] sm:h-80"
        }
      `}
      onClick={() => onEdit(note)}
    >
      {/* Header Section */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate pr-2">
            {note.title || "Untitled Note"}
          </h3>

          {/* Note Type Badge */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {note.isTodo && (
              <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                <BsListCheck className="w-3 h-3" />
                <span>Todo</span>
                <span className="bg-blue-200 px-1.5 py-0.5 rounded-full text-xs">
                  {completed}/{total}
                </span>
              </div>
            )}

            {/* Date Badge */}
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs">
              <MdAccessTime className="w-3 h-3" />
              <span className="hidden xs:inline">{formatDate(note.createdAt)}</span>
              <span className="xs:hidden">{new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 mb-3 sm:mb-4 overflow-hidden">
        {note.isTodo && note.todos && note.todos.length > 0 ? (
          <div className="space-y-2 h-full flex flex-col">
            {/* Progress Bar */}
            {total > 0 && (
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2 sm:mb-3 flex-shrink-0">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            )}

            {/* Todo List Preview */}
            <div className="flex-1 overflow-hidden">
              <div className="space-y-1">
                {note.todos.slice(0, isListView ? 5 : 4).map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <div
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${
                        todo.isCompleted
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {todo.isCompleted && <span className="text-xs">✓</span>}
                    </div>
                    <span
                      className={`flex-1 truncate ${
                        todo.isCompleted
                          ? "line-through text-slate-500"
                          : "text-slate-700"
                      }`}
                    >
                      {todo.text || "Empty todo item"}
                    </span>
                  </div>
                ))}

                {note.todos.length > (isListView ? 5 : 4) && (
                  <div className="text-xs text-slate-500 mt-2">
                    +{note.todos.length - (isListView ? 5 : 4)} more items
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <p
              className={`text-slate-600 text-sm leading-relaxed flex-1 ${
                isListView ? "line-clamp-3" : "line-clamp-4 sm:line-clamp-6"
              } overflow-hidden`}
            >
              {note.content || "No content"}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-auto pt-2 sm:pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Secondary Actions */}
          {showArchiveButton && onArchive && (
            <button
              onClick={(e) => {
                onArchive(e, note);
                // Add visual feedback
                e.currentTarget.style.transform = "scale(0.95)";
                setTimeout(() => {
                  e.currentTarget.style.transform = "scale(1)";
                }, 150);
              }}
              className="group relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border-2 border-slate-200 hover:bg-blue-50 
          hover:border-blue-300 text-slate-600 hover:text-blue-600 transition-all duration-200 
          hover:shadow-lg shadow-sm active:shadow-inner btn-click-animate"
              title="Archive Note"
            >
              <RiInboxArchiveLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-150 group-active:scale-110" />
            </button>
          )}

          {showTrashButton && onTrash && (
            <button
              onClick={(e) => {
                onTrash(e, note);
                // Add visual feedback
                e.currentTarget.style.transform = "scale(0.95)";
                setTimeout(() => {
                  e.currentTarget.style.transform = "scale(1)";
                }, 150);
              }}
              className="group relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border-2 border-slate-200 hover:bg-orange-50 
          hover:border-orange-300 text-slate-600 hover:text-orange-600 transition-all duration-200 
          hover:shadow-lg shadow-sm active:shadow-inner btn-click-animate"
              title="Move to Trash"
            >
              <GoTrash className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-150 group-active:scale-110" />
            </button>
          )}

          {showDeleteButton && onDelete && (
            <button
              onClick={(e) => {
                onDelete(e, note._id!);
                // Add visual feedback
                e.currentTarget.style.transform = "scale(0.95)";
                setTimeout(() => {
                  e.currentTarget.style.transform = "scale(1)";
                }, 150);
              }}
              className="group relative p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white border-2 border-red-200 hover:bg-red-50 
          hover:border-red-300 text-red-500 hover:text-red-600 transition-all duration-200 
          hover:shadow-lg shadow-sm active:shadow-inner btn-click-animate"
              title="Delete Forever"
            >
              <AiFillDelete className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-150 group-active:scale-110" />
            </button>
          )}
        </div>

        <div>
          {/* Primary Action */}
          {showRestoreButton && onRestore && (
            <button
              onClick={(e) => {
                onRestore(e, note);
                // Add visual feedback
                e.currentTarget.style.transform = "scale(0.95)";
                setTimeout(() => {
                  e.currentTarget.style.transform = "scale(1)";
                }, 150);
              }}
              className="group relative flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 
          text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:from-emerald-600 hover:to-emerald-700 
          transition-all duration-200 hover:shadow-xl shadow-lg active:shadow-inner btn-click-animate"
              title="Restore to Home"
            >
              <BiHome className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-150 group-active:scale-110" />
              <span className="hidden xs:inline">Restore</span>
            </button>
          )}
        </div>
      </div>

      {/* Status Indicator */}
      {(note.status === NoteStatus.ARCHIVED || note.status === NoteStatus.TRASHED) && (
        <div className="absolute top-2 right-2">
          {note.status === NoteStatus.TRASHED ? (
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          ) : (
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default NoteCard;