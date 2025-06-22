import {
  MongoClient,
  ServerApiVersion,
  ObjectId,
  Collection,
  Db,
} from "mongodb";
import express, { Request, Response } from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import bcrypt from "bcrypt";
import {
  verifyToken,
  AuthRequest,
  validateRegister,
  validateLogin,
} from "./middleware";
import { User, ApiResponse, LoginResponse } from "./types";
import { config } from "./config";

// Note interfaces matching your frontend exactly
interface ITodoTypes {
  id: string;
  text: string;
  isCompleted: boolean;
}

interface INoteTypes {
  _id?: ObjectId;
  title: string;
  content: string;
  isTodo: boolean;
  email: string;
  todos?: ITodoTypes[];
  isArchived: boolean;
  isTrashed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

const app = express();
const port = config.PORT;
const saltRounds = 10;

app.use(
  cors({
    origin: config.NODE_ENV === "production" ? [""] : ["http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${config.DB_USER}:${config.DB_PASS}@cluster0.38cdqne.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run(): Promise<void> {
  try {
    // Add startup log
    console.log("Starting server...");
    console.log("📝 Config loaded:", {
      PORT: config.PORT,
      NODE_ENV: config.NODE_ENV,
      DB_USER: config.DB_USER ? "✅ SET" : "❌ NOT SET",
      DB_PASS: config.DB_PASS ? "✅ SET" : "❌ NOT SET",
      ACCESS_TOKEN_SECRET: config.ACCESS_TOKEN_SECRET ? "✅ SET" : "❌ NOT SET",
    });
    console.log("🔗 MongoDB URI:", uri);

    await client.connect();
    console.log("Connected to MongoDB");

    const db: Db = client.db("scalable_todo");
    const usersCollection: Collection<User> = db.collection("users");
    const notesCollection: Collection<INoteTypes> = db.collection("notes");

    // Health check
    app.get("/health", (req: Request, res: Response) => {
      res.json({
        status: "Up and running!",
        timestamp: new Date().toISOString(),
      });
    });

    // Register user
    app.post(
      "/users",
      validateRegister,
      async (req: Request, res: Response) => {
        try {
          const user: User = req.body;
          const existingUser = await usersCollection.findOne({
            email: user.email,
          });

          if (existingUser) {
            res.status(StatusCodes.CONFLICT).json({
              error: true,
              message: "User already exists",
            } as ApiResponse);
            return;
          }

          user.password = await bcrypt.hash(user.password, saltRounds);
          user.createdAt = new Date();
          const result = await usersCollection.insertOne(user);

          res.status(StatusCodes.CREATED).json({
            error: false,
            message: "User registered successfully",
            data: { userId: result.insertedId },
          } as ApiResponse);
        } catch (error) {
          console.error("Registration error:", error);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Registration failed",
          } as ApiResponse);
        }
      }
    );

    // Login user
    app.post("/login", validateLogin, async (req: Request, res: Response) => {
      try {
        const { email, password }: { email: string; password: string } =
          req.body;
        const user = await usersCollection.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
          res.status(StatusCodes.UNAUTHORIZED).json({
            error: true,
            message: "Invalid credentials",
          } as ApiResponse);
          return;
        }

        const token = jwt.sign(
          { email: user.email, userId: user._id!.toString() },
          config.ACCESS_TOKEN_SECRET as string,
          { expiresIn: config.ACCESS_TOKEN_EXPIRES_IN as string }
        );

        res.json({
          error: false,
          token,
          user: {
            id: user._id!.toString(),
            email: user.email,
            userName: user.userName,
          },
        } as LoginResponse);
      } catch (error) {
        console.error("Login error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: "Login failed",
        } as ApiResponse);
      }
    });

    // Get users (protected, without passwords)
    app.get("/users", verifyToken, async (req: AuthRequest, res: Response) => {
      try {
        const users = await usersCollection
          .find({}, { projection: { password: 0 } })
          .toArray();
        res.json(users);
      } catch (error) {
        console.error("Get users error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: "Failed to fetch users",
        } as ApiResponse);
      }
    });

    // Change password (protected)
    app.post(
      "/change-password",
      verifyToken,
      async (req: AuthRequest, res: Response) => {
        try {
          const {
            currentPassword,
            newPassword,
          }: { currentPassword: string; newPassword: string } = req.body;

          if (!currentPassword || !newPassword || newPassword.length < 6) {
            res.status(StatusCodes.BAD_REQUEST).json({
              error: true,
              message: "Valid current and new passwords required (min 6 chars)",
            } as ApiResponse);
            return;
          }

          const user = await usersCollection.findOne({
            email: req.user!.email,
          });
          if (
            !user ||
            !(await bcrypt.compare(currentPassword, user.password))
          ) {
            res.status(StatusCodes.UNAUTHORIZED).json({
              error: true,
              message: "Current password is incorrect",
            } as ApiResponse);
            return;
          }

          const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
          await usersCollection.updateOne(
            { email: req.user!.email },
            { $set: { password: hashedPassword } }
          );

          res.json({
            error: false,
            message: "Password changed successfully",
          } as ApiResponse);
        } catch (error) {
          console.error("Change password error:", error);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Failed to change password",
          } as ApiResponse);
        }
      }
    );

    // ==================== NOTES ENDPOINTS (matching your frontend exactly) ====================

    // Get all notes with search and filtering
    app.get("/notes", async (req: Request, res: Response) => {
      try {
        const { email, searchTerm, isArchived, isTrashed } = req.query;

        if (!email) {
          return res.status(400).json({
            error: true,
            message: "Email parameter is required",
          });
        }

        let query: any = { email };

        // Add archive/trash filters if provided
        if (isArchived !== undefined) {
          query.isArchived = isArchived === "true";
        }

        if (isTrashed !== undefined) {
          query.isTrashed = isTrashed === "true";
        }

        // Add search if provided
        if (searchTerm) {
          query = {
            ...query,
            $or: [
              { title: { $regex: searchTerm, $options: "i" } },
              { content: { $regex: searchTerm, $options: "i" } },
            ],
          };
        }

        const notes = await notesCollection
          .find(query)
          .sort({ createdAt: -1 })
          .toArray();

        res.json(notes);
      } catch (error) {
        console.error("Error fetching notes:", error);
        res.status(500).json({
          error: true,
          message: "Error fetching notes",
        });
      }
    });

    // Create a note
    app.post("/notes", async (req: Request, res: Response) => {
      try {
        const { title, content, isArchived, isTrashed, isTodo, todos } =
          req.body;
        const email = req.query.email;

        if (!email) {
          return res.status(400).json({
            error: true,
            message: "Email parameter is required",
          });
        }

        const user = await usersCollection.findOne({ email });
        if (!user) {
          return res.status(404).json({
            error: true,
            message: "User not found",
          });
        }

        const note: INoteTypes = {
          title,
          content,
          isArchived: isArchived || false,
          isTrashed: isTrashed || false,
          email: email as string,
          isTodo: isTodo || false,
          todos: isTodo ? todos || [] : [],
          createdAt: new Date(),
        };

        const result = await notesCollection.insertOne(note);
        res.json(result);
      } catch (error) {
        console.error("Error creating note:", error);
        res.status(500).json({
          error: true,
          message: "Error creating note",
        });
      }
    });

    // Get single note
    app.get("/notes/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            error: true,
            message: "Invalid note ID",
          });
        }

        const note = await notesCollection.findOne({
          _id: new ObjectId(id),
        });

        if (!note) {
          return res.status(404).json({
            error: true,
            message: "Note not found",
          });
        }

        res.json(note);
      } catch (error) {
        console.error("Error fetching note:", error);
        res.status(500).json({
          error: true,
          message: "Error fetching note",
        });
      }
    });

    // Update note (matches your frontend modal exactly)
    app.patch("/notes/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const { isArchived, isTrashed, title, content, todos, isTodo } =
          req.body;
        const email = req.query.email;

        // Validate email
        if (!email) {
          return res.status(400).json({
            error: true,
            message: "Email parameter is required",
          });
        }

        // Validate id
        if (!ObjectId.isValid(id)) {
          return res.status(400).json({
            error: true,
            message: "Invalid note ID",
          });
        }

        // Check if note exists and belongs to user
        const existingNote = await notesCollection.findOne({
          _id: new ObjectId(id),
          email,
        });

        if (!existingNote) {
          return res.status(404).json({
            error: true,
            message: "Note not found",
          });
        }

        const updateFields: Partial<INoteTypes> = {};

        // Handle mutually exclusive states for archive/trash
        if (isArchived !== undefined || isTrashed !== undefined) {
          if (isArchived === true) {
            // When archiving: set archived=true, trashed=false
            updateFields.isArchived = true;
            updateFields.isTrashed = false;
          } else if (isTrashed === true) {
            // When trashing: set trashed=true, archived=false
            updateFields.isTrashed = true;
            updateFields.isArchived = false;
          } else if (isArchived === false && isTrashed === false) {
            // When restoring to home: both false
            updateFields.isArchived = false;
            updateFields.isTrashed = false;
          } else if (isArchived === false) {
            // When un-archiving: archived=false
            updateFields.isArchived = false;
          } else if (isTrashed === false) {
            // When un-trashing: trashed=false
            updateFields.isTrashed = false;
          }
        }

        // Update todos if provided (matches your frontend todo structure)
        if (todos !== undefined) {
          if (!Array.isArray(todos)) {
            return res.status(400).json({
              error: true,
              message: "Todos must be an array",
            });
          }
          // Validate todo items structure: {id, text, isCompleted}
          const isValidTodos = todos.every(
            (todo: any) =>
              todo.id &&
              typeof todo.text === "string" &&
              typeof todo.isCompleted === "boolean"
          );
          if (!isValidTodos) {
            return res.status(400).json({
              error: true,
              message: "Invalid todo items format",
            });
          }
          updateFields.todos = todos;
        }

        // Update content fields if provided
        if (title !== undefined) {
          updateFields.title = title;
        }

        if (content !== undefined) {
          updateFields.content = content;
        }

        updateFields.updatedAt = new Date();

        // Update note
        const result = await notesCollection.updateOne(
          { _id: new ObjectId(id), email },
          { $set: updateFields }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).json({
            error: true,
            message: "No changes made to note",
          });
        }

        // Get updated note
        const updatedNote = await notesCollection.findOne({
          _id: new ObjectId(id),
          email,
        });

        res.json({
          success: true,
          message: "Note updated successfully",
          note: updatedNote,
        });
      } catch (error) {
        console.error("Error updating note:", error);
        res.status(500).json({
          error: true,
          message: "Error updating note",
        });
      }
    });

    // Delete note (permanent deletion)
    app.delete("/notes/:id", async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const email = req.query.email;

        if (!email || !ObjectId.isValid(id)) {
          return res.status(400).json({
            error: true,
            message: "Invalid request parameters",
          });
        }

        const result = await notesCollection.deleteOne({
          _id: new ObjectId(id),
          email,
        });

        if (result.deletedCount === 0) {
          return res.status(404).json({
            error: true,
            message: "Note not found",
          });
        }

        res.json({
          success: true,
          message: "Note deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting note:", error);
        res.status(500).json({
          error: true,
          message: "Error deleting note",
        });
      }
    });

    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
}

// Add error handling for the main function
run().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});

// Add process error handlers
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
