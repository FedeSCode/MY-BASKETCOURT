"use strict"
const Sqlite = require('better-sqlite3');
let db = new Sqlite('db.sqlite');



exports.read = (id) => {
    var found = db.prepare('SELECT * FROM court WHERE id = ?').get(id);
    if(found !== undefined) {
      found.image = db.prepare('SELECT img FROM image WHERE court = ? ORDER BY rank').all(id);
      return found;
    } else {
      return null;
    }
  };
  
exports.search = (query, page) => {
  const num_per_page = 32;
  query = query || "";
  page = parseInt(page || 1);

  // on utiliser l'opérateur LIKE pour rechercher dans le titre 
  var num_found = db.prepare('SELECT count(*) FROM court WHERE nameCourt LIKE ?').get('%' + query + '%')['count(*)'];
  var results = db.prepare('SELECT id as entry, nameCourt, imgLogo FROM court WHERE nameCourt LIKE ? ORDER BY id LIMIT ? OFFSET ?').all('%' + query + '%', num_per_page, (page - 1) * num_per_page);

  return {
    results: results,
    num_found: num_found, 
    query: query,
    next_page: page + 1,
    page: page,
    num_pages: parseInt(num_found / num_per_page) + 1,
  };
};




exports.login = function(name,password){
    let result = db.prepare("SELECT * FROM user WHERE name = ? and password = ?").get(name,password);
    if (result === undefined){
      return "no user find", -1 ;
    }else{
      return result.id;
    }
  }
  
  exports.new_user=function(name, password) {
    if(!name || !password) return -1;
    try {
      let insert = db.prepare('INSERT INTO user VALUES (?,?,?)').run(null,name, password);
      console.log("insert: "+insert);
      console.log("result.lastInsertRowid: "+insert.lastInsertRowid);
      return insert.lastInsertRowid;
    } catch(e) {
      if(e.code == 'SQLITE_CONSTRAINT_PRIMARYKEY') return -1;
      throw e;
    }
    
  }

  exports.create = function(courts) {
  var id = db.prepare('INSERT INTO court (nameCourt, imgLogo,imgMaps,httpMaps, description, adresse,capacity) VALUES (@nameCourt,@imgLogo,@imgMaps,@httpMaps, @description, @adresse,@capacity)').run(courts).lastInsertRowid;

  var insert1 = db.prepare('INSERT INTO image VALUES (@court, @rank, @img)');


  return id;
}