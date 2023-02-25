"use strict"

const fs = require("fs");
const Sqlite = require("better-sqlite3");


let db = new Sqlite('db.sqlite');

var entries = JSON.parse(fs.readFileSync('basket.json').toString());

var load = function (filename) {
    const  courts = JSON.parse(fs.readFileSync(filename));

    db.prepare('DROP TABLE IF EXISTS court').run();
    db.prepare('DROP TABLE IF EXISTS image').run();

    db.prepare('CREATE TABLE court(id INTEGER PRIMARY KEY AUTOINCREMENT, nameCourt TEXT, imgLogo TEXT, imgMaps TEXT,httpMaps TEXT,description TEXT,adresse TEXT, capacity TEXT)').run();    
    db.prepare('CREATE TABLE image (court INT,rank INT, img TEXT) ').run();

    var insert1 = db.prepare('INSERT INTO court VALUES (@id, @nameCourt , @imgLogo ,@imgMaps,@httpMaps,@description,@adresse , @capacity)');
    var insert2 = db.prepare('INSERT INTO image VALUES (@court , @rank , @img )');

    var transaction = db.transaction((courts) =>{

        for(var id = 0;id < courts.length; id++) {
            var court = courts[id];
            court.id = id;
            insert1.run(court);
            for(var j = 0; j < court.images.length; j++) {
              insert2.run({court: id, rank: j, img: court.images[j].img});
            }
        }
    });
    
    transaction(courts);
}


db.prepare('DROP TABLE IF EXISTS user').run();
db.prepare('CREATE TABLE user (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT)').run();

load('basket.json')