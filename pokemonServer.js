const fs = require('fs');
const express = require('express');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const bodyParser = require("body-parser");
const path = require('path')
const app = express();
const mongo = require("./mongo");
const pokemon = require("./pokemon");
const portNumber = process.argv[2] ?? 3000;
const path = require('path')
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 
const url = process.env.CYCLIC_URL;
app.use(bodyParser.urlencoded({extended:false}));

/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));
app.use("/styles", express.static(__dirname + "/styles"));
app.use("/images", express.static(__dirname + "/images"));
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "pokemonareawsomefhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

app.use(cookieParser());

/* view/templating engine */
app.set("view engine", "ejs");

app.listen(portNumber);
console.log(`Web server started and running at ${url}:${portNumber}`);

app.get("/", (request, response) => {
    const variables = {
        "loginLink" : `${url}:${portNumber}/login`,
        "registerLink" : `${url}:${portNumber}/register`,
        "errorText" : ``,
        "buttonClass" : `input`
    };
    response.render("index.ejs", variables);
 });

 app.get("/register", (request, response) => {
    const variables = {
        "registerLink" : `${url}:${portNumber}/register`,
        "loginLink" : `${url}:${portNumber}/`,
        "spriteLink" : `${url}:${portNumber}/spriteLink`,
        "url" : `${url}:${portNumber}`,
        "userClass" : "input",
        "userEText" : "",
    };
    response.render("register.ejs", variables);
 });

 app.get("/spriteLink/:pokemon", async (request, response) => {
    const spritePromise = pokemon.getPokemonSprite(request.params.pokemon);
    const sprite = await spritePromise;

    response.send({ "sprite" : sprite });
 });

app.get("/userPage", async (request, response) => {
    if (!request.session.username) {
        response.redirect("/");
    } else {
        variables = {
            "username" : request.session.username,
            "pokemon" : request.session.pokemon,
            "sprite" : request.session.sprite,
            "logoutLink" : `${url}:${portNumber}/logout`
        }

        response.render("userPage.ejs", variables);
    }
});

 app.post("/login", async (request, response) => {
    const res = await mongo.getUser(request.body["name"], request.body["password"])
    if (res) {
        const spritePromise = pokemon.getPokemonSprite(res["pokemon"]);
        const sprite = await spritePromise;

        request.session.username = request.body["name"];
        request.session.pokemon = res["pokemon"];
        request.session.sprite = sprite;

        response.redirect("userPage");
    } else {
        const variables = {
            "loginLink" : `${url}:${portNumber}/login`,
            "registerLink" : `${url}:${portNumber}/register`,
            "errorText" : `<p class="errorText">Something went wrong logging in!</p>`,
            "buttonClass" : `error`
        };

        response.render("index.ejs", variables);
    }
 });

 app.post("/register", async (request, response) => {
    const newUser = {
        "username" : request.body["name"],
        "password" : request.body["password"],
        "pokemon" : request.body["pokemon"],
    };
    const res = await mongo.addUser(newUser);

    if (res != undefined) {
        const spritePromise = pokemon.getPokemonSprite(request.body["pokemon"]);
        const sprite = await spritePromise;
        
        request.session.username = request.body["name"];
        request.session.pokemon = request.body["pokemon"];
        request.session.sprite = sprite;

        response.redirect("userPage");
    } else {
        const variables = {
            "registerLink" : `${url}:${portNumber}/register`,
            "loginLink" : `${url}:${portNumber}/`,
            "spriteLink" : `${url}:${portNumber}/spriteLink`,
            "url" : `${url}:${portNumber}`,
            "userClass" : "error",
            "userEText" : `<p id="userEText" class="eText">A user with that username already exists!</p>`,
        };
        response.render("register.ejs", variables);
    }
 });

 app.post("/logout", async (request, response) => {
    request.session.username = undefined;
    request.session.pokemon = undefined;
    request.session.sprite = undefined;

    response.redirect("/");
 });