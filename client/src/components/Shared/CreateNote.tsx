import { useState } from "react";
import { useForm } from "react-hook-form";
import { RiAddLine, RiCloseLine } from "react-icons/ri";
import { BsListCheck, BsFileText } from "react-icons/bs";
import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";
import { showErrorToast, showSuccessToast } from "../../utils/toast";
import useAuth from "../../hooks/useAuth";
import { ITodoTypes, NoteStatus } from "../../Types";

interface CreateNoteProps {
  refetch: () => void;
}

interface FormData {
  title: string;
  content: string;
}

const CreateNote: React.FC<CreateNoteProps> = ({ refetch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTodo, setIsTodo] = useState(false);
  const [todos, setTodos] = useState<ITodoTypes[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const userEmail = user?.email as string;

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<FormData>();

  const addTodo = () => {
    setTodos([
      ...todos,
      { id: Date.now().toString(), text: "", isCompleted: false },
    ]);
  };

  const removeTodo = (id: string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const updateTodo = (id: string, text: string) => {
    setTodos(todos.map((todo) => (todo.id === id ? { ...todo, text } : todo)));
  };

  const toggleTodo = (id: string) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
      )
    );
  };

  const handleClose = () => {
    setIsExpanded(false);
    setIsTodo(false);
    setTodos([]);
    reset();
  };

  const onSubmit = async (data: FormData) => {
    if (!data.title.trim() && !data.content.trim() && todos.length === 0) {
      showErrorToast("Please add some content to your note");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("access-token");
      
      const payload = {
        title: data.title || "Untitled",
        content: data.content || "",
        isTodo,
        todos: isTodo ? todos.filter((todo) => todo.text.trim()) : [],
        status: NoteStatus.ACTIVE, // Use new status field instead of isArchived/isTrashed
      };

      const response = await fetch(
        `${import.meta.env.VITE_APP_BACKEND_ROOT_URL}/notes?email=${userEmail}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, 
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        showSuccessToast(isTodo ? "Todo list created!" : "Note created!");
        refetch();
        handleClose();
      } else {
        showErrorToast(result.message || "Failed to create note");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      showErrorToast("Failed to create note");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="mb-8 mt-2">
        <div
          onClick={() => setIsExpanded(true)}
          className="bg-white border-2 border-slate-200 rounded-2xl p-4 cursor-pointer 
            hover:border-blue-300 hover:shadow-lg transition-all duration-300 
            group max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <RiAddLine className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-slate-500 group-hover:text-slate-700 transition-colors">
              Take a note...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 mt-2">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl mx-auto">
        <div className="bg-white border-2 border-blue-200 rounded-2xl shadow-lg overflow-hidden">
          {/* Header with Note Type Toggle */}
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsTodo(false);
                  setTodos([]);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    !isTodo
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <BsFileText className="w-4 h-4" />
                Note
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsTodo(true);
                  if (todos.length === 0) {
                    addTodo();
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${
                    isTodo
                      ? "bg-blue-100 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <BsListCheck className="w-4 h-4" />
                Todo List
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              <RiCloseLine className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="p-4 space-y-4">
            {/* Title Input */}
            <input
              {...register("title")}
              placeholder={isTodo ? "List title..." : "Note title..."}
              className="w-full text-lg font-semibold placeholder-slate-400 border-none 
                focus:outline-none focus:ring-0 p-0 bg-transparent"
            />

            {/* Todo List */}
            {isTodo && (
              <div className="space-y-2">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 group">
                    <button
                      type="button"
                      onClick={() => toggleTodo(todo.id)}
                      className="flex-shrink-0 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      {todo.isCompleted ? (
                        <MdOutlineCheckBox className="w-5 h-5 text-blue-500" />
                      ) : (
                        <MdOutlineCheckBoxOutlineBlank className="w-5 h-5" />
                      )}
                    </button>

                    <input
                      value={todo.text}
                      onChange={(e) => updateTodo(todo.id, e.target.value)}
                      placeholder="List item"
                      className={`flex-1 border-none focus:outline-none focus:ring-0 p-0 bg-transparent
                        ${
                          todo.isCompleted
                            ? "line-through text-slate-500"
                            : "text-slate-700"
                        }
                      `}
                    />

                    {todos.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 
                          hover:text-red-500 transition-all"
                      >
                        <RiCloseLine className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTodo}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 
                    text-sm font-medium transition-colors"
                >
                  <RiAddLine className="w-4 h-4" />
                  Add item
                </button>
              </div>
            )}

            {/* Content Textarea (for regular notes) */}
            {!isTodo && (
              <textarea
                {...register("content")}
                placeholder="Start writing..."
                rows={4}
                className="w-full placeholder-slate-400 border-none focus:outline-none 
                  focus:ring-0 p-0 bg-transparent resize-none"
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 bg-slate-50">
            <div className="text-xs text-slate-500 hidden lg:block">
              {isTodo ? `${todos.length} items` : "Press Ctrl+Enter to save"}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white 
                  font-medium rounded-lg hover:from-blue-600 hover:to-blue-700 
                  disabled:opacity-50 disabled:cursor-not-allowed transition-all 
                  duration-200 shadow-sm hover:shadow-md"
              >
                {isSubmitting ? "Creating..." : "Create Note"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateNote;