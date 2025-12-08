const db = require("./db")
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const session = require("express-session")

const app = express()

app.set("trust proxy", 1) // ТОЛЬКО ДЛЯ CODESPACES

app.use(cookieParser())
app.use(express.json())
app.use(cors({
    origin: true, // ТОЛЬКО ДЛЯ CODESPACES
    credentials: true,
    methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"]
}))
app.use(session({
    secret: "asdasdasdasdasdasd",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        // sameSite: "strict",
        sameSite: "none", // ТОЛЬКО ДЛЯ CODESPACES
        secure: true, // false если localhost
        domain: undefined // ТОЛЬКО ДЛЯ CODESPACES
    }
}))

app.post("/signup", (req, res) => {
    try {
        const hashed = bcrypt.hashSync(req.body.password, 10)
        const newUser = db
            .prepare(`INSERT INTO users (email, password) VALUES (?, ?)`)
            .run(req.body.email, hashed);
        const createdUser = db
            .prepare(`SELECT * FROM users WHERE id = ?`)
            .get(newUser.lastInsertRowid);

        req.session.userId = createdUser.id
        req.session.email = createdUser.email

        res.status(201).json(createdUser)
    } catch (error) {
        console.error(error)
        res.json(error)
    }
})

app.listen("3000", () => {
    console.log("Порт3000")
})