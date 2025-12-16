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
        name: "sessionId",
        // sameSite: "strict",
        sameSite: "none", // ТОЛЬКО ДЛЯ CODESPACES
        secure: true, // false если localhost
        domain: undefined // ТОЛЬКО ДЛЯ CODESPACES
    }
}))

app.get("/auth/me", (req, res) => {
    console.log(req.session)
    if (req.session.userId) {
        return res.status(200).json({logged: true, user: {
            userId: req.session.userId,
            email: req.session.email
        }})
    }

    return res.status(401).json({logged: false})
})

app.post("/auth/signup", (req, res) => {
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
        res.status(400).json(error)
    }
})

app.post("/auth/signin", (req, res) => {
    const { email, password } = req.body
    const user = db
        .prepare(`SELECT * FROM users WHERE email = ?`)
        .get(email)
    if (!user) 
        res
            .status(401)
            .json({ error: "Неправильные данные" })
    const validPassword = bcrypt.compareSync(password, user.password)
    if (!validPassword) 
        res
            .status(401)
            .json({ error: "Неправильные данные" })

    req.session.email = user.email
    req.session.userId = user.id

    res.status(200).json(user)
})

app.post("/auth/logout", (req, res) => {
    req.session.destroy((err) => {
        err && res.status(500).json({error: "Не получилось выйти"})
        res.clearCookie("sessionId")
        res.status(200).json({message: "Выход успешен"})
    })
})

app.post("/click", (req, res) => {
    const { clicks } = req.body
    const updateClicks = db
        .prepare("UPDATE users SET clicks = ? WHERE id = ?")
        .run(clicks, req.session.userId)

    console.log(updateClicks)
    res.status(200).json({message: "Значение кликов обновлено"})
})

app.listen("3000", () => {
    console.log("Порт3000")
})