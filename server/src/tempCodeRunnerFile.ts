app.use(
  cors({
    origin: config.NODE_ENV === "production" ? [""] : ["http://localhost:5173"],
    credentials: true,
  })
);