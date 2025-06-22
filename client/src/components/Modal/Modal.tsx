import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Form } from "../ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { GoTrash } from "react-icons/go";
import { HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import { RiAddLine, RiCloseLine, RiSaveLine } from "react-icons/ri";
import { BiHome } from "react-icons/bi";
import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import { updateNoteStatus } from "../../utils/noteAction";
import { INoteTypes, ITodoTypes } from "../../Types";
import useAuth from "../../hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";

interface ModalProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedNote: INoteTypes;
  refetch: () => void;
}

interface FormData {
  title: string;
  content: string;
}

const Modal: React.FC<ModalProps> = ({
  refetch,
  isOpen,
  setIsOpen,
  selectedNote,
}) => {
  const { user } = useAuth();
  const userEmail = user?.email as string;
  const queryClient = useQueryClient();

  const [todos, setTodos] = useState<ITodoTypes[]>(selectedNote?.todos || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      title: selectedNote?.title || "",
      content: selectedNote?.content || "",
    },
  });

  const { register, handleSubmit, reset, setValue, watch } = form;
  const watchedTitle = watch("title");
  const watchedContent = watch("content");

  useEffect(() => {
    if (selectedNote) {
      setValue("title", selectedNote.title);
      setValue("content", selectedNote.content);
      setTodos(selectedNote.todos || []);
    }
  }, [selectedNote, setValue]);

  // Track changes
  useEffect(() => {
    const hasChanges =
      watchedTitle !== selectedNote?.title ||
      watchedContent !== selectedNote?.content ||
      JSON.stringify(todos) !== JSON.stringify(selectedNote?.todos || []);
    setHasUnsavedChanges(hasChanges);
  }, [watchedTitle, watchedContent, todos, selectedNote]);

  const handleAddTodo = () => {
    setTodos([
      ...todos,
      { id: Date.now().toString(), text: "", isCompleted: false },
    ]);
  };

  const handleRemoveTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleTodoChange = (id: string, text: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)));
  };

  const handleTodoToggle = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        todos: selectedNote.isTodo ? todos : [],
      };

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_ROOT_URL}/notes/${
          selectedNote._id
        }?email=${userEmail}`,
        {
          method: "PATCH",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();
      if (result.success) {
        refetch();
        reset();
        showSuccessToast("Note updated successfully!");
        setIsOpen(false);
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error(error);
      showErrorToast((error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async () => {
    const success = await updateNoteStatus({
      noteId: selectedNote._id,
      email: userEmail,
      action: "archive",
      currentStatus: selectedNote.isArchived,
      queryClient,
      currentPage: selectedNote.isTrashed
        ? "trash"
        : selectedNote.isArchived
        ? "archive"
        : "home",
    });
    if (success) {
      setIsOpen(false);
    }
  };

  const handleTrash = async () => {
    const success = await updateNoteStatus({
      noteId: selectedNote._id,
      email: userEmail,
      action: "trash",
      currentStatus: selectedNote.isTrashed,
      queryClient,
      currentPage: selectedNote.isTrashed
        ? "trash"
        : selectedNote.isArchived
        ? "archive"
        : "home",
    });
    if (success) {
      setIsOpen(false);
    }
  };

  const handleRestore = async () => {
    const success = await updateNoteStatus({
      noteId: selectedNote._id,
      email: userEmail,
      action: "restore",
      queryClient,
      currentPage: selectedNote.isTrashed ? "trash" : "archive",
    });
    if (success) {
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  const getCompletedTodos = () => {
    if (!selectedNote.isTodo || !todos) return { completed: 0, total: 0 };
    const completed = todos.filter((todo) => todo.isCompleted).length;
    return { completed, total: todos.length };
  };

  const { completed, total } = getCompletedTodos();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <DialogHeader>
              <DialogTitle className="sr-only">Edit Note</DialogTitle>

              {/* Custom Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {selectedNote.isTodo && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      <span>Todo List</span>
                      <span className="bg-blue-200 px-2 py-0.5 rounded-full text-xs">
                        {completed}/{total}
                      </span>
                    </div>
                  )}

                  {hasUnsavedChanges && (
                    <span className="text-xs text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                      Unsaved changes
                    </span>
                  )}
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              {/* Title Input */}
              <input
                {...register("title", { required: true })}
                className="w-full text-2xl font-bold placeholder-slate-400 border-none 
                  focus:outline-none focus:ring-0 p-0 bg-transparent"
                placeholder="Note title..."
              />

              {/* Progress Bar for Todos */}
              {selectedNote.isTodo && total > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>Progress</span>
                    <span>
                      {Math.round((completed / total) * 100)}% complete
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(completed / total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Content Area */}
              <div className="space-y-4">
                {selectedNote?.isTodo ? (
                  <div className="space-y-3">
                    {todos.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-start gap-3 group"
                      >
                        <button
                          type="button"
                          onClick={() => handleTodoToggle(todo.id)}
                          className="mt-1 flex-shrink-0 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          {todo.isCompleted ? (
                            <MdOutlineCheckBox className="w-5 h-5 text-blue-500" />
                          ) : (
                            <MdOutlineCheckBoxOutlineBlank className="w-5 h-5" />
                          )}
                        </button>

                        <input
                          value={todo.text}
                          onChange={(e) =>
                            handleTodoChange(todo.id, e.target.value)
                          }
                          placeholder="Add a task..."
                          className={`flex-1 border-none focus:outline-none focus:ring-0 p-2 
                            rounded-lg hover:bg-slate-50 focus:bg-slate-50 transition-colors
                            ${
                              todo.isCompleted
                                ? "line-through text-slate-500"
                                : "text-slate-700"
                            }
                          `}
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveTodo(todo.id)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 
                            hover:text-red-500 transition-all"
                        >
                          <RiCloseLine className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddTodo}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 
                        text-sm font-medium p-2 hover:bg-blue-50 rounded-lg transition-all"
                    >
                      <RiAddLine className="w-4 h-4" />
                      Add task
                    </button>
                  </div>
                ) : (
                  <textarea
                    {...register("content")}
                    rows={8}
                    className="w-full placeholder-slate-400 border-none focus:outline-none 
                      focus:ring-0 p-0 bg-transparent resize-none text-slate-700"
                    placeholder="Start writing..."
                  />
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2">
                {/* Restore Button */}
                {(selectedNote.isArchived || selectedNote.isTrashed) && (
                  <Button
                    type="button"
                    onClick={handleRestore}
                    variant="outline"
                    className="flex items-center gap-2 text-emerald-600 border-emerald-200 
                      hover:bg-emerald-50 hover:border-emerald-300"
                  >
                    <BiHome className="w-4 h-4" />
                    Restore
                  </Button>
                )}

                {/* Archive Button */}
                {!selectedNote.isArchived && (
                  <Button
                    type="button"
                    onClick={handleArchive}
                    variant="outline"
                    className="flex items-center gap-2 text-blue-600 border-blue-200 
                      hover:bg-blue-50 hover:border-blue-300"
                  >
                    <HiOutlineArchiveBoxArrowDown className="w-4 h-4" />
                    Archive
                  </Button>
                )}

                {/* Trash Button */}
                {!selectedNote.isTrashed && (
                  <Button
                    type="button"
                    onClick={handleTrash}
                    variant="outline"
                    className="flex items-center gap-2 text-orange-600 border-orange-200 
                      hover:bg-orange-50 hover:border-orange-300"
                  >
                    <GoTrash className="w-4 h-4" />
                    Trash
                  </Button>
                )}
              </div>

              {/* Save Button */}
              <Button
                type="submit"
                disabled={isSubmitting || !hasUnsavedChanges}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 
                  hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
              >
                <RiSaveLine className="w-4 h-4" />
                {isSubmitting ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
