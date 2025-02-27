const express = require('express')
const {json} = require("express");
const app = express()
const port = 80

//MySQL connection
const mysql = require('mysql2/promise');


const pool = mysql.createPool({
    connectionLimit: 100, //important
    host: "db",
    user: "inNotes",
    password: "randompassword",
    database: "inNotes",
    debug: false
});
pool.query(`
    create table if not exists users
    (
        id int auto_increment primary key,
        username text not null unique,
        password text not null,
        status int default 0 not null,
        creation_date datetime not null default current_timestamp
    );
`);
pool.query(`
    create table if not exists data
    (
        id int auto_increment primary key,
        userId int not null,
        linkedinUser varchar(50) not null,
        linkedinKey varchar(50) null,
        note text null,
        data text null,
        lastUpdate bigint not null,
        constraint data_users_id_fk foreign key ( userId ) references users ( id ),
        constraint user_pk unique (userId, linkedinUser),
        constraint data_pk unique (userId, linkedinUser, linkedinKey)
        );
`);

app.use(json());

//Functions
async function getUserIdFromRequest(req) {
    let username = req.header("username")
    let password = req.header("password")
    let userid = ""
    let [result] = await pool.query(`SELECT id
                                     from users
                                     where username = ?
                                       and password = ?`,[username,password])
    if (!(result && result.length === 1 && result[0].id)) {
        console.log("u -> "+username, " -> unauthorized")
        return undefined
    } else {
        userid = result[0].id;
    }
    console.log("u -> "+username, "id -> "+userid)
    return userid
}


app.options('*', (req, res) => {
    console.log("Handling / OPTIONS")
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    res.sendStatus(200)
})

app.get('/note/', async (req, res) => {
    console.log("Handle GET",req.params.id)
    let userid = await getUserIdFromRequest(req)
    if (!userid) {
        res.sendStatus(401)
        return
    }
    const [queryResult] = await pool.query(`SELECT * from data where userId = ?`,[userid])
    console.log("Result Self Data ["+userid+"]-> "+ JSON.stringify(queryResult || {}))

    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    res.send(JSON.stringify(queryResult || {}))
})

app.get('/note/:id', async (req, res) => {
    console.log("Handle GET",req.params.id)
    let userid = await getUserIdFromRequest(req)
    if (!userid) {
        res.sendStatus(401)
        return
    }
    const requestedId = req.params.id
    const requestedUsername = req.query.username
    let queryResult = [];
    [queryResult] = await pool.query(`SELECT * from data where userId = ? and linkedinKey=?`,[userid,requestedId])
    if((!queryResult || !queryResult.length) && requestedUsername ){
        console.log("Searching by user")
        queryResult = [];
        [queryResult] = await pool.query(`SELECT * from data where userId = ? and linkedinUser=?`,[userid,requestedUsername])
    }
    const result = queryResult[0]
    console.log("Result Query ["+userid+","+requestedId+","+requestedUsername+"]-> "+ JSON.stringify(result || {}))

    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    res.send(JSON.stringify(result || {}))
})

app.get('/note/lastUpdate/:id', async (req, res) => {
    console.log("Handle GET LastUpdate",req.params.id)
    let userid = await getUserIdFromRequest(req)
    if (!userid) {
        res.sendStatus(401)
        return
    }
    const requestedId = req.params.id
    const requestedUsername = req.query.username
    let selectedColumn = "linkedinKey"
    if(requestedUsername){
        selectedColumn = "linkedinUser"
    }
    const [result] = await pool.query(`SELECT lastUpdate
                                       from data
                                       where userId = ?
                                         and ${selectedColumn} = ?`,[userid,requestedId])
    console.log("result", result)

    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    res.send(JSON.stringify({"lastUpdate": result[0]?.lastUpdate || 0, "userId": userid}))
})

app.post('/note/', async (req, res) => {
    console.log("Handle POST",req.body)
    let userid = await getUserIdFromRequest(req)
    if (!userid) {
        res.sendStatus(401)
        return
    }
    let {note,key,linkedinUser,data} = req.body
    if (typeof data === 'object') {
        data = JSON.stringify(data)
    }

    console.log(note,key,linkedinUser,data)

    if(!key){
        key=""
    }

    const result = await pool.query(`INSERT INTO data (userId, linkedinKey,linkedinUser, note, lastUpdate, data)
                                       VALUES (?,?,?,?,?,?) ON DUPLICATE KEY
    UPDATE
        note =?, linkedinUser=?, lastUpdate=?, linkedinKey = ?, data = ?`,[userid,key,linkedinUser,note,new Date().getTime(),data,note,linkedinUser,new Date().getTime(),key,data])
    if(false) {
        console.log("Executing query", result)
    }
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Content-Type", "text/plain")
    res.sendStatus(200)
})

// User Management
app.get('/user/', async (req, res) => {
    console.log("Handle GET User",req.params.id)
    let userid = await getUserIdFromRequest(req)
    if (!userid) {
        res.sendStatus(401)
        return
    }
    let [result] = await pool.query(`SELECT *
                                       from users
                                       where id = ?`,[userid])
    if(!result || !result[0]){
        res.sendStatus(404)
        return
    }
    result=result[0]
    if(result.password){
        delete result.password;
    }
    console.log("result", result)

    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Headers", "*")
    res.send(result)
})

app.post('/user/', async (req, res) => {
    console.log("Handle USER POST",req.body)
    let {username,password} = req.body
    console.log(username,password)

    if(!username || !password){
        res.sendStatus(500)
        return
    }
    try {

        const result = await pool.query(`INSERT INTO users (username,password)
                                       VALUES (?,?)`, [username, password])

        res.header("Access-Control-Allow-Origin", "*")
        res.header("Content-Type", "text/plain")
        res.send(result);
        return;
    }
    catch (e) {
        console.log("Error user registration -> ",e.message)
        res.header("Access-Control-Allow-Origin", "*")
        res.header("Content-Type", "text/plain")
        res.statusCode = 403
        if(e.message.startsWith("Duplicate entry")){
            res.send("Username is already in use")
        }
        else {
            res.send(e.message)
        }
        return;
    }
})

app.get('/search', async (req, res) => {
    console.log("Handle SEARCH", req.query);
    let userid = await getUserIdFromRequest(req);
    if (!userid) {
        res.sendStatus(401);
        return;
    }

    const searchTerm = req.query.searchTerm || '';
    if (!searchTerm) {
        res.status(400).send("Search term is required");
        return;
    }

    try {
        const [results] = await pool.query(`
            SELECT DISTINCT linkedinUser
            FROM data
            WHERE userId = ? AND data LIKE ?
        `, [userid, `%${searchTerm}%`]);

        console.log("Search Results [" + userid + ", " + searchTerm + "] -> " + JSON.stringify(results || {}));

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "*");
        res.send(JSON.stringify(results || {}));
    } catch (error) {
        console.error("Error during search", error);
        res.status(500).send("Search failed");
    }
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
