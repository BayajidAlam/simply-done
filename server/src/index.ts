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
import bcrypt from "bcrypt";
import {
  verifyToken,
  AuthRequest,
  validateRegister,
  validateLogin,
} from "./middleware";
import {
  User,
  ApiResponse,
  LoginResponse,
  INoteTypes,
  INoteStatus,
} from "./types";
import { config } from "./config";
import {
  success,
  error,
  created,
  badRequest,
  notFound,
  unauthorized,
  conflict,
} from "./utils/response";

const app = express();
const port = config.PORT;
const saltRounds = 10;

app.use(
  cors({
    origin: true,
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
    await client.connect();
    console.log("Connected to MongoDB");

    const db: Db = client.db("scalable_todo");
    const usersCollection: Collection<User> = db.collection("users");
    const notesCollection: Collection<INoteTypes> = db.collection("notes");

    // Health check
    app.get("/health", (req: Request, res: Response) => {
      return success(res, "Up and running!", {
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
            return conflict(res, "User already exists");
          }

          user.password = await bcrypt.hash(user.password, saltRounds);
          user.createdAt = new Date();
          const result = await usersCollection.insertOne(user);

          return created(res, "User registered successfully", {
            userId: result.insertedId,
          });
        } catch (err) {
          console.error("Registration error:", err);
          return error(res, "Registration failed");
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
          return unauthorized(res, "Invalid credentials");
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
      } catch (err) {
        console.error("Login error:", err);
        return error(res, "Login failed");
      }
    });

    // Get users (protected, without passwords)
    app.get("/users", verifyToken, async (req: AuthRequest, res: Response) => {
      try {
        const users = await usersCollection
          .find({}, { projection: { password: 0 } })
          .toArray();

        return success(res, "Users fetched successfully", users);
      } catch (err) {
        console.error("Get users error:", err);
        return error(res, "Failed to fetch users");
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
            return badRequest(
              res,
              "Valid current and new passwords required (min 6 chars)"
            );
          }

          const user = await usersCollection.findOne({
            email: req.user!.email,
          });

          if (
            !user ||
            !(await bcrypt.compare(currentPassword, user.password))
          ) {
            return unauthorized(res, "Current password is incorrect");
          }

          const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
          await usersCollection.updateOne(
            { email: req.user!.email },
            { $set: { password: hashedPassword } }
          );

          return success(res, "Password changed successfully");
        } catch (err) {
          console.error("Change password error:", err);
          return error(res, "Failed to change password");
        }
      }
    );

    // ==================== NOTES ENDPOINTS ====================

    // Get all notes with search and filtering
    app.get("/notes", verifyToken, async (req: Request, res: Response) => {
      try {
        const { email, searchTerm, status } = req.query;

        if (!email) {
          return badRequest(res, "Email parameter is required");
        }

        let query: any = { email };

        // Simple status filter
        if (status) {
          if (!Object.values(INoteStatus).includes(status as INoteStatus)) {
            return badRequest(res, "Invalid status filter");
          }
          query.status = status;
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

        return success(res, "Notes fetched successfully", notes);
      } catch (err) {
        console.error("Error fetching notes:", err);
        return error(res, "Error fetching notes");
      }
    });

    // Create a note
    app.post("/notes", verifyToken, async (req: Request, res: Response) => {
      try {
        const { title, content, status, isTodo, todos } = req.body;
        const email = req.query.email;

        if (!email) {
          return badRequest(res, "Email parameter is required");
        }

        const user = await usersCollection.findOne({ email });
        if (!user) {
          return notFound(res, "User not found");
        }

        // Validate status if provided
        const validStatuses = ["active", "archived", "trashed"];
        const noteStatus =
          status && validStatuses.includes(status) ? status : "active";

        const note: INoteTypes = {
          title: title || "",
          content: content || "",
          status: noteStatus,
          email: email as string,
          isTodo: isTodo || false,
          todos: isTodo ? todos || [] : [],
          createdAt: new Date(),
        };

        const result = await notesCollection.insertOne(note);

        // Return the created note with its ID
        const createdNote = await notesCollection.findOne({
          _id: result.insertedId,
        });

        return created(res, "Note created successfully", createdNote);
      } catch (err) {
        console.error("Error creating note:", err);
        return error(res, "Error creating note");
      }
    });

    // Get single note
    app.get("/notes/:id", verifyToken, async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const email = req.query.email;

        if (!ObjectId.isValid(id)) {
          return badRequest(res, "Invalid note ID");
        }

        // Build query - optionally verify the note belongs to the user
        const query: any = { _id: new ObjectId(id) };
        if (email) {
          query.email = email;
        }

        const note = await notesCollection.findOne(query);

        if (!note) {
          return notFound(res, "Note not found");
        }

        return success(res, "Note fetched successfully", note);
      } catch (err) {
        console.error("Error fetching note:", err);
        return error(res, "Error fetching note");
      }
    });

    // Update note
    app.patch(
      "/notes/:id",
      verifyToken,
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;
          const { status, title, content, todos, isTodo } = req.body;
          const email = req.query.email;

          // Validate email
          if (!email) {
            return badRequest(res, "Email parameter is required");
          }

          // Validate id
          if (!ObjectId.isValid(id)) {
            return badRequest(res, "Invalid note ID");
          }

          // Check if note exists and belongs to user
          const existingNote = await notesCollection.findOne({
            _id: new ObjectId(id),
            email,
          });

          if (!existingNote) {
            return notFound(res, "Note not found");
          }

          const updateFields: Partial<INoteTypes> = {};

          // Simple status validation and update
          if (status !== undefined) {
            if (!Object.values(INoteStatus).includes(status)) {
              return badRequest(
                res,
                "Invalid status. Must be 'active', 'archived', or 'trashed'"
              );
            }
            updateFields.status = status;
          }

          // Update todos if provided
          if (todos !== undefined) {
            if (!Array.isArray(todos)) {
              return badRequest(res, "Todos must be an array");
            }

            const isValidTodos = todos.every(
              (todo: any) =>
                todo.id &&
                typeof todo.text === "string" &&
                typeof todo.isCompleted === "boolean"
            );

            if (!isValidTodos) {
              return badRequest(res, "Invalid todo items format");
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
            return badRequest(res, "No changes made to note");
          }

          // Get updated note
          const updatedNote = await notesCollection.findOne({
            _id: new ObjectId(id),
            email,
          });

          return success(res, "Note updated successfully", updatedNote);
        } catch (err) {
          console.error("Error updating note:", err);
          return error(res, "Error updating note");
        }
      }
    );

    // Delete note
    app.delete(
      "/notes/:id",
      verifyToken,
      async (req: Request, res: Response) => {
        try {
          const { id } = req.params;
          const email = req.query.email;

          if (!email || !ObjectId.isValid(id)) {
            return badRequest(res, "Invalid request parameters");
          }

          const result = await notesCollection.deleteOne({
            _id: new ObjectId(id),
            email: email as string,
          });

          if (result.deletedCount === 0) {
            return notFound(res, "Note not found");
          }

          return success(res, "Note deleted successfully");
        } catch (err) {
          console.error("Error deleting note:", err);
          return error(res, "Error deleting note");
        }
      }
    );

    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
  } catch (err) {
    console.error("❌ Database connection error:", err);
    process.exit(1);
  }
}

// Add error handling for the main function
run().catch((err) => {
  console.error("❌ Failed to start server:", err);
  process.exit(1);
});

// Add process error handlers
process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});
