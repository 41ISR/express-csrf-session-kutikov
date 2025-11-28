const db = require("./db")
const express = require("express")
const cors = require("cors")
const bcrypt = require("bcrypt")
const cookieParser = require("cookie-parser")
const session = require("express-session")

const app = express()

app.use(cookieParser())
app.use(express.json())
// app.use(cors({
// origin: "https://shiny-broccoli-7r4gg65p9gr2xxr6-5173.app.github.dev/",
// credentials: false,
// methods: ["GET", "POST", "DELETE", "PUT"],
// allowedHeaders: ["Content-Type"]
// }))
app.use(cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true
}));

app.use(session({
    secret: "asdasdasdasdasdasd",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
        sameSite: "none",
        secure: true,
        path: "/"
    }
}))

app.get("/me", (req, res) => {
    console.log(req.session)
    if (req.session.userId) {
        return res.json({
            loggedIn: true,
            user: {
                id: req.session.userId,
                email: req.session.email
            }
        });
    }

    res.json({ loggedIn: false });
});

app.post("/signup", (req, res) => {
    try {
        const hashed = bcrypt.hashSync(req.body.password, 10)
        const newUser = db
            .prepare(`INSERT INTO users (email, password) VALUES (?, ?)`)
            .run(req.body.email, hashed);
        const createdUser = db
            .prepare(`SELECT * FROM users WHERE id = ?`)
            .get(newUser.lastInsertRowid);

        req.session.userId = createdUser.id;
        req.session.email = createdUser.email;

        res.status(201).json({
            message: "User registered",
            user: createdUser
        });
    } catch (error) {
        console.error(error)
        res.json(error)
    }
})

app.listen("3000", () => {
    console.log("Порт3000")
})