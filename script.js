"use strict";
const express = require("express");
const app = express();
app.listen(8080);
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb://localhost:27017/";
let mongoClient = MongoClient;
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
const nodemailer = require('nodemailer');
let transporter;
let mailOptions;

function getALLUsers() {
    let db;
    return mongoClient.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
        .then((client) => {
            db = client.db("receiverDB");
            return db.collection("users").find().toArray();
        })
        .then(function (results) {
                let values = [];
                if (results) {
                    for (let i = 0; i < results.length; ++i) {
                        let person = {
                            firstName: results[i].firstName,
                            lastName: results[i].lastName,
                            patronymic: results[i].patronymic,
                            email: results[i].email
                        };
                        values.push(person);
                    }
                }
                return values;
            }
        )
        .catch(err => {
            console.log(err);
        });
}

function addUser(firstName, lastName, patronymic, email) {
    console.log("lets add - " + firstName + " " + lastName + " " + patronymic + " " + email);
    let db;
    mongoClient.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }).then((client) => {
                console.log("Connected successfully to server");
                db = client.db("receiverDB");
                let myquery = {firstName: firstName, lastName: lastName, patronymic: patronymic, email: email};
                db.collection("users").insertOne(myquery, function (err, obj) {
                    if (err) throw err;
                    console.log("Person " + firstName + " " + lastName + " " + patronymic + " " + email + " was added.");
                });
            }
        ).catch(err => {
            console.log(err);
        });
}

function deleteUser(firstName, lastName, patronymic, email) {
    console.log("lets delete - " + firstName + " " + lastName + " " + patronymic + " " + email);
    let db;
    mongoClient.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
        .then((client) => {
                console.log("Connected successfully to server");
                db = client.db("receiverDB");
                let myquery = {firstName: firstName, lastName: lastName, patronymic: patronymic, email: email};
                db.collection("users").deleteOne(myquery, function (err, obj) {
                    if (err) throw err;
                    console.log("Person " + firstName + " " + lastName + " " + patronymic + " " + email + " was deleted.");
                });
            }
        )
        .catch(err => {
            console.log(err);
        });
}

function editTarget(oldFirstName, oldLastName, oldPatronymic, oldEmail, surname, name, patronymic, email) {
    console.log("lets edit - " + surname + " " + name + " " + patronymic + " " + email);
    let db;
    mongoClient.connect(url, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    })
        .then((client) => {
                console.log("Connected successfully to server");
                db = client.db("targetsDB");
                let myQuery = {firstName: oldFirstName, lastName: oldLastName, patronymic: oldPatronymic, email: oldEmail};
                let newVal = {$set: {firstName: surname, lastName: name, patronymic: patronymic, email: email}};
                console.log("oldFirstName " + oldFirstName);
                console.log("oldLastName " + oldLastName);
                console.log("oldPatronymic " + oldPatronymic);
                console.log("oldEmail " + oldEmail);
                db.collection("users").updateOne(myQuery, newVal, function (err, res) {
                    if (err) throw err;
                    console.log("1 document updated");
                });
            }
        )
        .catch(err => {
            console.log(err);
        });
}

//letters functionality
const letters = [
    {subject: "Topic1", text: "someText1"},
    {subject: "Topic2", text: "someText2"},
    {subject: "Topic3", text: "someText3"},
];

function send(dist, subject, text) {
    console.log(`Sending letter with subject "${subject}" to mail "${dist}"`);

    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'email',
            pass: 'pass'
        }
    });
    mailOptions = {
        from: 'leosmithspammer@gmail.com',
        to: dist,
        subject: subject,
        text: text
    };
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.get('/', function (req, res) {
    getALLUsers().then(users => {
        res.render('index', { name: 'Main page', arr: users });
    });
})

app.get('/letters', function (req, res) {
    res.render('index', {name: 'Send letter', arr: letters})
})

app.post('/addUser', function (req, res) {
    let body = req.body;
    addUser(body.firstName, body.lastName, body.patronymic, body.email);
    res.redirect("/");
})

app.post('/deleteUser', function (req, res) {
    let body = req.body;
    console.log(body)
    const info = body.removeBtn.split(" ");
    console.log("info - ");
    console.log(info);
    deleteUser(info[0],info[1],info[2],info[3]);
    res.redirect("/");
})

app.post('/editUser', function (req, res) {
    // TODO
    res.redirect("/");
})

app.post('/sendLetters', function (req, res) {
    let body = req.body;
    getALLUsers().then(users => {
        users.forEach(user => {
            send(user.email, body.subject, body.text);
        });
    });
    res.redirect("/");
})
