const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const morgan = require('morgan');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require('./models/user');

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

passport.use(
    new LocalStrategy(async(username, password, done) => {
        try {
            const user = await User.findOne({ username: username });
            bcrypt.compare(password, user.password, (err, res) => {
                if (err) throw err;
                if (res) {
                    console.log(user.password, res, password);
                    return done(null, user)
                } 
                else {
                    return done(null, false, { message: "Incorrect password" })
                }
            })
        } 
        catch(err) {
            return done(err);
        };
    })
);   

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch(err) {
        done(err);
    };
});

app.use(morgan("dev"));
app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.render("index", { user: req.user });
})

app.get("/signup", (req, res) => {
    res.render("signup");
})

app.post("/signup", (req, res) => {
    try{
        bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
            if(err) throw err;
            console.log(hashedPassword, req.body);
            const user  = new User({
                username: req.body.username,
                password: hashedPassword,
            })
            const result = user.save()
            res.redirect("/");
        });
    }
    catch(err){
        throw err;
    }
})

app.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            console.log("User not found");
            return res.redirect("/");
        }
        bcrypt.compare(req.body.password, user.password, (err, result) => {
        if (err) {
            return next(err);
        }
        if (result) {
            req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            console.log("User found, Logged In!!!!")
            return res.redirect("/");
            });
        } else {
            return res.redirect("/");
        }
        });
    })(req, res, next);
});


app.get("/logout", (req, res) => {
    req.logout((err) => {
        if(err) throw err;
        res.redirect("/");
    })
});

app.listen(3000, (err) => {
    if(err) throw err;
    console.log("App running on port 3000");
}); 