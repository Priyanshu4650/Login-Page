const express = require('express');
const morgan = require('morgan');
const bcrypt = require('bcrypt');
const db = require('./model/user');

const app = express();

app.set("view engine", 'ejs');
app.set("views", "views");
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(morgan('dev'));

db.connect((err) => {
    if (err) throw err;
    app.listen(8080, () => {
        console.log('Server is running on port 8080');
    });
});

app.get("/", (req, res) => {
    res.redirect("/login");
});

app.get("/login", (req, res) => {
    res.render("Login", { title: "Login" });
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const q = "SELECT * FROM credentials.logindata WHERE username = ?";
    db.query(q, [username], (err, row) => {
        if (err) throw err;
        if (row.length > 0) {
            if(bcrypt.compareSync(password, row[0].password)){
                console.log(row);
                res.redirect("/feed");
            }
        } else {
            console.log(row);
            res.redirect("/login");
        }
    });
});

app.get("/register", (req, res) => {
    res.render("Register", { title: "Register" });
})

app.post("/register", (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    const salt = bcrypt.genSaltSync(10);
    const hashPassword = bcrypt.hashSync(password, salt);

    const q = "INSERT INTO credentials.logindata (username, password) values (?, ?)";
    db.query(q, [username, hashPassword], (err, result) => {
        if(err) res.send(err);
        else console.log(result);
        res.redirect("/login");
    })
})

app.get("/feed", (req, res) => {
    res.render("Feed", { title: "Feed" })
})

app.use("/404", (req, res) => {
    res.render("NOT FOUND 404");
});

module.exports = app;
