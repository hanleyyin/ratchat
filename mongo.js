const path = require('path')
require("dotenv").config({ path: path.resolve(__dirname, '.env') }) 

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;
const db = process.env.MONGO_DB_NAME;
const collection = process.env.MONGO_COLLECTION;
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${username}:${password}@cluster0.d2sgyrn.mongodb.net/?retryWrites=true&w=majority`;

async function addUser(newUser) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();

        if (await userExists(newUser["username"])) {
            return undefined
        }

        return await client.db(db).collection(collection).insertOne(newUser);
    } catch (e) {
        return e;
    } finally {
        await client.close();
    }
}

async function getUser(username, password) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    let filter = {username: username, password: password};
    return await client.db(db).collection(collection).findOne(filter);
}

async function userExists(name) {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    const res = await client.db(db).collection(collection).findOne({username: name});

    return (res && res.username);
}


module.exports = { addUser, getUser };