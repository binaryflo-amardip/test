const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/connectDB");
const userRouter = require("./routes/userRoutes");
const courseRouter = require("./routes/courseRoutes");
const contactRouter = require("./routes/contactRoutes");
const purchaseRouter = require("./routes/purchaseRoutes");
const webhookRouter = require("./routes/webhookRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow non-browser requests
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS: " + origin));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Platform",
      "Cache-Control",
    ],
    credentials: true,
  })
);

app.use("/api/webhook", webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("API running!");
});

app.use("/api/users", userRouter);
app.use("/api/courses", courseRouter);
app.use("/api/contacts", contactRouter);
app.use("/api/purchases", purchaseRouter);

// Start the server
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
