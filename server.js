const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 4000;
const BOOKINGS_PATH = path.join(__dirname, "bookings.json");

const loadBookings = async () => {
  try {
    const data = await fs.readFile(BOOKINGS_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(BOOKINGS_PATH, "[]", "utf8");
      return [];
    }
    throw error;
  }
};

const saveBookings = async (bookings) => {
  await fs.writeFile(BOOKINGS_PATH, JSON.stringify(bookings, null, 2));
};

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(express.static(__dirname));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/bookings", async (_req, res, next) => {
  try {
    const bookings = await loadBookings();
    res.json({ total: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
});

app.post("/api/bookings", async (req, res, next) => {
  try {
    const { fullName, email, phone, service, date, time, notes = "" } = req.body;

    if (!fullName || !email || !phone || !service || !date || !time) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const bookings = await loadBookings();
    const reference = crypto.randomBytes(4).toString("hex").toUpperCase();
    const newBooking = {
      id: crypto.randomUUID(),
      reference,
      fullName,
      email,
      phone,
      service,
      date,
      time,
      notes,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    bookings.push(newBooking);
    await saveBookings(bookings);

    res.status(201).json({
      message: "Booking received. We'll confirm shortly.",
      reference,
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`Booking server running on http://localhost:${PORT}`);
});

