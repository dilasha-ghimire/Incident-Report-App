const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
const sanitizeInputs = require("./middleware/sanitize");
const helmet = require("helmet");

const authRoutes = require("./routes/auth");
const complaintRoutes = require("./routes/complaint");
const adminRoutes = require("./routes/admin");

const app = express();
app.use(express.json());
app.use(sanitizeInputs);
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "X-XSRF-TOKEN"],
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

app.use((req, res, next) => {
  try {
    const token = req.csrfToken();
    res.cookie("XSRF-TOKEN", token, {
      httpOnly: false,
      secure: false,
      sameSite: "Strict",
    });
  } catch (err) {}
  next();
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => res.send("Server running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
