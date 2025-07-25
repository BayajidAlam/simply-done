import { config } from "../config";

const getMongoUri = () => {
  // Production: Use MONGODB_URI set by Pulumi (contains IP from inventory)
  if (process.env.MONGODB_URI) {
    console.log("🏭 Production: Using inventory-managed MongoDB");
    return process.env.MONGODB_URI;
  }

  // Development: Atlas for local development
  if (config.DB_USER && config.DB_PASS) {
    console.log("💻 Development: Using MongoDB Atlas");
    return `mongodb+srv://${config.DB_USER}:${config.DB_PASS}@cluster0.38cdqne.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  }

  throw new Error("No database configuration found");
};

export default getMongoUri;
