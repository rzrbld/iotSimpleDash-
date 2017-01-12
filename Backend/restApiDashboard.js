/*!
 * iotSimpleDash-
 * https://github.com/rzrbld/iotSimpleDash-
 *
 * Copyright 2015 github.com/rzrbld
 * Released under the MIT license (see README.md)
 * https://github.com/rzrbld/iotSimpleDash-
 *
 */

var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data/iotData');

db.serialize(function() {
    db.run("CREATE TABLE IF NOT EXISTS  iotData ( id    INTEGER PRIMARY KEY AUTOINCREMENT, date  TEXT, time  TEXT, uuid  TEXT, temp  INTEGER, humidity  INTEGER, light INTEGER, timestamp INTEGER ); ");
    db.run("CREATE TABLE IF NOT EXISTS uuidToName ( id    INTEGER PRIMARY KEY AUTOINCREMENT, uuid  TEXT, name  TEXT );");
});

function uuidValidate(uuid){
    var uuidIsValid = /^[0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12}$/i.test(uuid);
    return uuidIsValid;
}

function nameValidate(name){
    return nameIsValid = /^[0-9a-z _ . ( ) ]{1,60}$/i.test(name);
}

function dateValidate(date){
    return dateIsValid = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/i.test(date);
}

function hoursValidate(hours){
    return hoursIsValid = /^[0-9]{2}$/i.test(hours);
}

function setHeaders(res){
    res.set({'Content-Type':'application/json',
        'Access-Control-Allow-Origin':'*'
    });
}

function formatDataToChart(rows){
    var temp = [],
        humidity = [],
        light = [],
        rowsLength = rows.length,
        aggregationIndex = Math.floor((rowsLength/1000)*2.5)+1;

    for (var i = 0; i < rowsLength; i+=aggregationIndex) {
        var tobj = {x:rows[i].timestamp,y:rows[i].temp};
        var hobj = {x:rows[i].timestamp,y:rows[i].humidity};
        var lobj = {x:rows[i].timestamp,y:rows[i].light};
        temp.push(tobj);
        humidity.push(hobj);
        light.push(lobj);
    };

    var answ = [
        {key:"temperature",values: temp},
        {key:"humidity",values: humidity},
        {key:"light",values:light}
    ];

    return answ;
}

function formatDataToSelect(rows,field){
    var answ = [],
        formatted = '';

    for (var i = 0; i < rows.length; i++) {
        // console.log(rows[i]);
        switch(field){
            case 'date':
                formatted = new Date(rows[i][field]).toString().slice(0, 15);
            break;
            case 'hour':
                formatted = rows[i][field]+':00 ... '+rows[i][field]+':59';
            break;
        }

        var itemObj = {value:rows[i][field],text:formatted}
        answ.push(itemObj);
    };

    return answ;
}

var express = require('express');
var restapi = express();
var bodyParser = require('body-parser');
restapi.use(bodyParser.urlencoded({ extended: false }));

restapi.get('/data', function(req, res){
    setHeaders(res);
    db.all("SELECT id.uuid AS uuid,id.date AS date, id.time As time, (SELECT name FROM uuidToName AS utn WHERE utn.uuid = id.uuid  ) AS name FROM iotData AS id GROUP BY id.uuid ", function(err, rows){

        res.json({ "error": 0, "results": rows.length ,"items" : rows });
    });
});

restapi.get('/data/:uuid', function(req, res){
    setHeaders(res);
    var uuid = req.params.uuid,
    uuidIsValid = uuidValidate(uuid);

    if(!uuidIsValid){
        res.status(500);
        res.json({"error" : 3, "message" : "invalid uuid"});
        res.end();
    } else {
        db.all("SELECT * FROM iotData WHERE uuid = ?", uuid, function(err, rows){
            res.json({ "error": 0, "results": rows.length ,"items" : rows });
        });
    }
});


restapi.get('/data/getdays/:uuid/', function(req, res){
    setHeaders(res);
    var uuid = req.params.uuid,
    uuidIsValid = uuidValidate(uuid);
    if(!uuidIsValid){
        res.status(500);
        res.json({"error" : 4, "message" : "invalid input params"});
        res.end();
    } else {
        db.all("SELECT DISTINCT date FROM iotData WHERE uuid = ? ", uuid, function(err, rows){
            answ = formatDataToSelect(rows,'date');
            res.json({ "error": 0, "results": rows.length,"items" : answ });
        });
    }
});

restapi.get('/data/gethours/:uuid/:date/', function(req, res){
    setHeaders(res);
    var uuid = req.params.uuid,
    uuidIsValid = uuidValidate(uuid);
    var date = req.params.date,
    dateIsValid = dateValidate(date);

    if(!uuidIsValid){
        res.status(500);
        res.json({"error" : 4, "message" : "invalid input params"});
        res.end();
    } else {
        db.all("SELECT DISTINCT substr(time,1,2) AS hour FROM iotData WHERE uuid = ? AND date = ? ", uuid, date, function(err, rows){
            answ = formatDataToSelect(rows,'hour');
            res.json({ "error": 0, "results": rows.length,"items" : answ });
        });
    }
});

restapi.get('/data/:uuid/:date', function(req, res){
    setHeaders(res);
    var uuid = req.params.uuid,
    date = req.params.date,
    uuidIsValid = uuidValidate(uuid),
    dateIsValid = dateValidate(date);

    if(!uuidIsValid || !dateIsValid){
        res.status(500);
        res.json({"error" : 4, "message" : "invalid input params"});
        res.end();
    } else {
        db.all("SELECT * FROM iotData WHERE uuid = ? AND date = ?", uuid, date, function(err, rows){
            answ = formatDataToChart(rows);
            res.json({ "error": 0, "results": rows.length,"items" : answ });
        });
    }
});


restapi.get('/data/:uuid/:date/:hours', function(req, res){
    setHeaders(res);
    var uuid = req.params.uuid,
    date = req.params.date,
    hours = req.params.hours+':%',
    uuidIsValid = uuidValidate(uuid),
    hoursIsValid = hoursValidate(req.params.hours),
    dateIsValid = dateValidate(date);

    if(!uuidIsValid || !dateIsValid || !hoursIsValid){
        res.status(500);
        res.json({"error" : 4, "message" : "invalid input params"});
        res.end();
    } else {
        db.all("SELECT * FROM iotData WHERE uuid = ? AND date = ? AND time LIKE ? ", uuid, date, hours, function(err, rows){
            answ = formatDataToChart(rows);
            res.json({ "error": 0, "results": rows.length,"items" : answ });
        });
    }
});


restapi.post('/data/:uuid/t/:temp/h/:humidity/l/:light', function(req, res){
    setHeaders(res);
    var uuid = req.params.uuid,
    uuidIsValid = uuidValidate(uuid),
    temp = Number(req.params.temp),
    humidity = Number(req.params.humidity),
    light = Number(req.params.light);

    if( !uuidIsValid || temp == NaN || humidity == NaN || light == NaN ){
        res.status(500);
        res.json({"error" : 1, "message" : "invalid input params"});
        res.end();
    } else {
        db.run("INSERT INTO iotData (date, time, uuid, temp, humidity, light, timestamp) VALUES (date('now'),time('now'), ?, ?, ?, ?, strftime('%s', 'now'))", uuid, temp, humidity, light, function(err, row){
            if (err){
                console.log(err);
                res.status(500);
                res.json({"error" : 2, "message" : "error while insert data to db"});
            }
            else {
                res.status(202);
                // console.log('insert ok');
                res.json({"error" : 0, "message" : "success"});
            }
            res.end();
        });
    }

});

restapi.post('/data/:uuid/name', function(req, res){

    var name = req.body.name,
    nameIsValid = nameValidate(name),
    uuid = req.params.uuid,
    uuidIsValid = uuidValidate(uuid);
    setHeaders(res);
    // console.log('name:', name,'name is valid:',nameIsValid,' uuid is valid:',uuidIsValid)

    if(!nameIsValid || !uuidIsValid){
        res.status(500);
        res.json({"error" : 5, "message" : "invalid input params"});
        res.end();
    }else{
        db.run("INSERT OR REPLACE INTO uuidToName (uuid, name) VALUES (?, ?);", uuid, name, function(err, row){
            if (err){
                console.log(err);
                res.status(500);
                res.json({"error" : 6, "message" : "error while insert or update data to db"});
            }
            else {
                res.status(202);
                // console.log('insert ok');
                res.json({"error" : 0, "message" : "success"});
            }
            res.end();
        });
    }
});



restapi.listen(4000);

console.log("Submit GET or POST to http://localhost:4000/data");
