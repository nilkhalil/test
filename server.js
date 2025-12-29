const express = require('express');
const app = express();
const fs =require("fs");

app.get('/', function (req, res) {
    
    fs.readFile('./data.json',  'utf8', (err, data) => {
        if(err) {
            console.log(err);
        }
        else {
            res.send(data);
        }
        // res.send("Isci melumatlari gosterilir.");
        res.send(data);
    });
});

app.listen(3000, () => {
    console.log("Server is working");
});
