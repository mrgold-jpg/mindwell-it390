const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const DB_FILE = "db.json";

// Helper: read DB
function readDB() {
    if (!fs.existsSync(DB_FILE)) return {};
    return JSON.parse(fs.readFileSync(DB_FILE));
}

// Helper: write DB
function writeDB(data) {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// GET all moods
app.get("/api/moods", (req, res) => {
    const db = readDB();
    const result = Object.keys(db).map(date => ({
        date,
        mood: db[date].mood
    }));
    res.json(result);
});

// GET one mood
app.get("/api/moods/:date", (req, res) => {
    const db = readDB();
    const entry = db[req.params.date];

    if (!entry) return res.status(404).json({ error: "Not found" });

    res.json({ date: req.params.date, ...entry });
});

// POST (create/update)
app.post("/api/moods", (req, res) => {
    const { date, mood, reflection } = req.body;

    if (!date || !mood || !reflection) {
        return res.status(400).json({ error: "Missing fields" });
    }

    const db = readDB();
    db[date] = { mood, reflection };
    writeDB(db);

    res.json({ success: true });
});

// DELETE
app.delete("/api/moods/:date", (req, res) => {
    const db = readDB();

    delete db[req.params.date];
    writeDB(db);

    res.json({ success: true });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});