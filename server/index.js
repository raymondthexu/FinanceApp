require('dotenv').config();
const express = require('express');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Account = require('./models/Account');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(session({
    secret: process.env.COOKIE_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    async (username, password, done) => {
        try {
            const user = await User.findOne({ username: username });
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        } catch (err) {
            return done(err);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err);
    }
});

app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }
        const newUser = new User({ username, password });
        await newUser.save();
        req.login(newUser, (err) => {
            if (err) {
                return res.status(500).send('Error logging in after registration');
            }
            res.status(201).send(newUser);
        });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.post('/api/login', passport.authenticate('local'), (req, res) => {
    res.send(req.user);
});

app.post('/api/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).send('Error during logout');
        }
        res.send('Logged out');
    });
});

app.get('/api/current_user', (req, res) => {
    res.send(req.user);
});

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).send('You must be logged in to do that.');
};

app.post('/api/accounts', isAuthenticated, async (req, res) => {
    const { account_id, name, main_account_type, main_account_category, notes, balance } = req.body;
    try {
        const newAccount = new Account({
            user: req.user.id,
            account_id,
            name,
            main_account_type,
            main_account_category,
            notes,
            balance
        });
        await newAccount.save();
        res.status(201).send(newAccount);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

app.get('/api/accounts', isAuthenticated, async (req, res) => {
    try {
        const accounts = await Account.find({ user: req.user.id });
        res.send(accounts);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.put('/api/accounts/:id', isAuthenticated, async (req, res) => {
    const { account_id, name, main_account_type, main_account_category, notes, balance } = req.body;
    try {
        const updated = await Account.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { account_id, name, main_account_type, main_account_category, notes, balance },
            { new: true }
        );
        if (!updated) return res.status(404).send('Account not found');
        res.send(updated);
    } catch (err) {
        res.status(500).send('Server error');
    }
});

app.delete('/api/accounts/:id', isAuthenticated, async (req, res) => {
    try {
        const deleted = await Account.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!deleted) return res.status(404).send('Account not found');
        res.send({ success: true });
    } catch (err) {
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 