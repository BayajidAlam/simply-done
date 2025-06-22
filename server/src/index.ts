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

// Import middleware, types, and config - FIXED: All from single middleware file
import {
  verifyToken,
  AuthRequest,
  validateRegister,
  validateLogin,
} from "./middleware";
import { User, Todo, ApiResponse, LoginResponse } from "./types";
import { config } from "./config";

const app = express();
const port = config.PORT;
const saltRounds = 10;

// CORS - replace with your frontend URL
app.use(
  cors({
    origin:
      config.NODE_ENV === "production"
        ? ["https://your-domain.com"]
        : ["http://localhost:5173"],
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
      ACCESS_TOKEN_SECRET: config.ACCESS_TOKEN_SECRET ? "✅ SET" : "❌ NOT SET"
    });
    console.log("🔗 MongoDB URI:", uri);
    
    await client.connect();
    console.log("Connected to MongoDB");

    const db: Db = client.db("scalable_todo");
    const usersCollection: Collection<User> = db.collection("users");
    const notesCollection: Collection<Todo> = db.collection("notes");

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

    // Get todos (protected)
    app.get("/todos", verifyToken, async (req: AuthRequest, res: Response) => {
      try {
        const todos = await notesCollection
          .find({ userId: req.user!.userId })
          .toArray();
        res.json(todos);
      } catch (error) {
        console.error("Get todos error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: "Failed to fetch todos",
        } as ApiResponse);
      }
    });

    // Create todo (protected)
    app.post("/todos", verifyToken, async (req: AuthRequest, res: Response) => {
      try {
        const {
          title,
          description,
          completed = false,
        }: {
          title: string;
          description?: string;
          completed?: boolean;
        } = req.body;

        if (!title?.trim()) {
          res.status(StatusCodes.BAD_REQUEST).json({
            error: true,
            message: "Title is required",
          } as ApiResponse);
          return;
        }

        const todo: Todo = {
          title: title.trim(),
          description: description?.trim() || "",
          completed,
          userId: req.user!.userId,
          createdAt: new Date(),
        };

        const result = await notesCollection.insertOne(todo);
        res.status(StatusCodes.CREATED).json({
          error: false,
          message: "Todo created",
          data: { ...todo, _id: result.insertedId },
        } as ApiResponse);
      } catch (error) {
        console.error("Create todo error:", error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
          error: true,
          message: "Failed to create todo",
        } as ApiResponse);
      }
    });

    // Update todo (protected) - FIXED
    app.put(
      "/todos/:id",
      verifyToken, // Remove auth.
      async (req: AuthRequest, res: Response) => {
        // Remove auth.
        try {
          const { id } = req.params;
          const {
            title,
            description,
            completed,
          }: { title?: string; description?: string; completed?: boolean } =
            req.body;

          const updateFields: Partial<Todo> = {};
          if (title !== undefined) updateFields.title = title.trim();
          if (description !== undefined)
            updateFields.description = description.trim();
          if (completed !== undefined) updateFields.completed = completed;
          updateFields.updatedAt = new Date();

          const result = await notesCollection.updateOne(
            { _id: new ObjectId(id), userId: req.user!.userId },
            { $set: updateFields }
          );

          if (result.matchedCount === 0) {
            res.status(StatusCodes.NOT_FOUND).json({
              error: true,
              message: "Todo not found",
            } as ApiResponse);
            return;
          }

          res.json({
            error: false,
            message: "Todo updated",
          } as ApiResponse);
        } catch (error) {
          console.error("Update todo error:", error);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Failed to update todo",
          } as ApiResponse);
        }
      }
    );

    // Delete todo (protected) - FIXED
    app.delete(
      "/todos/:id",
      verifyToken, // Remove auth.
      async (req: AuthRequest, res: Response) => {
        // Remove auth.
        try {
          const result = await notesCollection.deleteOne({
            _id: new ObjectId(req.params.id),
            userId: req.user!.userId,
          });

          if (result.deletedCount === 0) {
            res.status(StatusCodes.NOT_FOUND).json({
              error: true,
              message: "Todo not found",
            } as ApiResponse);
            return;
          }

          res.json({
            error: false,
            message: "Todo deleted",
          } as ApiResponse);
        } catch (error) {
          console.error("Delete todo error:", error);
          res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            error: true,
            message: "Failed to delete todo",
          } as ApiResponse);
        }
      }
    );

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
