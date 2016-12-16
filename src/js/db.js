var mysql = require('mysql');
var numUsers = 0;
var Room = require('./room.js'),
    Person = require('./person.js'),
    utils = require('./utils.js');

//TODO: CREATE POOL CONECTION

/*var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'grandmatch',
});*/

module.exports = {

    getDBNewMessage: function (available, user_id, room_id, socket, callback){
       pool.getConnection(function(err, connection) {
        var query = "SELECT receiver_id, text, user_id FROM chat_message WHERE receive=0 AND receiver_id='" + user_id
                  + "' AND room_id='" + room_id + "';";
        var elements = {};
        var rows = connection.query(query, function (err, rows, fields) {
        //console.log("getDBNewMessage");
        console.log(query);
        connection.release();
        if(err)
            callback(err);

          if( rows != undefined && Object.keys(rows).length != 0){
            console.log("There are " + Object.keys(rows).length  + " new messages");
            for (var i in rows) {
              var person = utils.getAvailableUser(available, rows[i].user_id);
              var nickname = person.getUsername();
              var message = {username:rows[i].user_id, message:rows[i].text, user: rows[i].receiver_id, nickname: nickname};
              //console.log(message.message);
              elements[i] = message;
            }

              if(elements != null && elements != undefined){
                //'console.log("New messages to user: " + socket.id);
                console.log("Numero de mensajes: " + Object.keys(elements).length);
                socket.emit("update messages",{messages: elements, room: room_id});
               // socket.broadcast.to(socket.id).emit('send', {elements: elements, id:socket.id});
              }
          } else {
            console.log("Not new messages");
          }
          callback("");
        });



       });
    },

    setDBNewMessage: function (rooms, room_id, user_id, message, callback){

      console.log("setDBNewMessage");
      people = utils.getUsersByRoom(rooms, room_id);
      if(people != undefined){
        pool.getConnection(function(err, connection) {
          for(var item in people){
            console.log(people[item].id + " != " + user_id)
              if(people[item].id != user_id){
                  query = "INSERT INTO chat_message(room_id, user_id, receiver_id, text, receive, is_active, creation_date, modify_date, position) "
                        + "VALUES ('" + room_id + "', '" + user_id + "', '" + people[item].id + "', '" + message + "', '0', 1, "
                        + connection.escape(new Date()) + ", " + connection.escape(new Date())
                        + ", 0) ON DUPLICATE KEY UPDATE modify_date=" + connection.escape(new Date()) +";" ;
                  console.log(query);
                  connection.query(query, function(err, rows){
                    connection.release();
                    if(err)
                      callback(err);
                    callback("Success");
                  });
              }
          }
        });
      }else{
        console.log("In general room.");
      }
    },

    isDBReceiveMessage: function (room_id, user_id){
      /*console.log("isDBReceiveMessage  sender " + user_id + " , receiver: " + receiver);*/
      query = "UPDATE chat_message SET receive=1 WHERE room_id='" + room_id +"' AND receiver_id='" + user_id + "';";
      console.log(query);
        pool.getConnection(function(err, connection) {
          connection.query(query, function(err, rows){
            connection.release();
            if(err)
              callback(err);
            callback("Success");

          });
        });
    },

    setDBUserRoom: function (room, user, callback){
          query = "INSERT INTO chat_roomuser(room_id, user_id, is_active, creation_date, modify_date, position) "
                + "VALUES ('" + room.id+ "', '" + user.id+"', 1, "
                + connection.escape(new Date()) + ", " + connection.escape(new Date())
                + ", 0) ON DUPLICATE KEY UPDATE modify_date=" + connection.escape(new Date()) +";" ;

          var rows = connection.query(query,function(err, rows){
            connection.end();
            if(err)
              callback(err);
            callback("Success");
          });

          /*{
                //console.log("User: " + user.username +" registered in database.");
                callback("Success");
          }else{
              // console.log("Error trying to save user.");
               callback("Error");
          }
*/
    },

    getDBRooms: function (callback){
      var query = "SELECT r.uuid, u.user_id, user.nickname  FROM chat_room AS r JOIN chat_roomuser AS u "
      + "JOIN account_user AS user WHERE r.uuid=u.room_id AND user.id=u.user_id  ORDER BY r.uuid;";
      var array = {};
      //console.log(query);
      pool.getConnection(function(err, connection){
        var rows = connection.query(query, function(err, rows, fields) {
          connection.release();
          if (err)
            callback(err);
      //console.log("Rows: " + Object.keys(rows).length);

          for (var i in rows) {
            if(array[rows[i].uuid] == null || array[rows[i].uuid] == undefined){
                    var room = new Room(rows[i].uuid);
                    var person = new Person(rows[i].user_id);
                    person.setUsername(rows[i].nickname);
                    room.addPerson(person);
                    array[rows[i].uuid] = room;
                    //console.log("Person: " + person.id);
                    console.log("Room[" + room.id + "].people[" + person.id+ "] - " + person.getUsername());
                }else{
                    var person = new Person(rows[i].user_id);
                    person.setUsername(rows[i].nickname);
                    array[rows[i].uuid].people[person.id] = person;
                    console.log("Room[" + room.id + "].people[" + person.id+ "] - " + person.getUsername());
                    //console.log("Person: " + person.id);
                };
            };
            //console.log("callback!!");
            callback(array);
        });

      });
     },

     getDBUsers: function (callback){
      var query = "SELECT u.id, u.nickname, a.complete_image FROM account_user AS u "
            + "join account_avataruser AS a WHERE u.id=a.user_id;";
      var array = {};
      console.log(query);
      pool.getConnection(function(err, connection){
        var rows = connection.query(query, function(err, rows, fields) {
        connection.release();
          if (err)
            callback(err);
          //console.log(rows);
          for (var i in rows) {
            if(array[rows[i].id] == null || array[rows[i].id] == undefined){
                    var person = new Person(rows[i].id);
                    //console.log(rows[i].nickname);
                    person.setUsername(rows[i].nickname);
                    person.setImage(rows[i].complete_image);
                    array[rows[i].id] = person;
                    console.log("Person: " + person.getUsername());
                };
            };
            callback(array);
        });
      });
    },

    getDBUserById: function (id, callback){
      query = "SELECT nickname FROM account_user "
            + " WHERE id=" + id + ";"
      var person = new Person(id);
      console.log(query);
      var rows = connection.query(query, function(err, rows, fields) {
        if (err) callback(err);

        for (var i in rows) {
          console.log("getDBUserById: " + rows[i].nickname);
          person.setUsername(rows[i].nickname);
        };

      });
       callback(person);
    },

    setDBRoom: function (rooms, room, callback){
      pool.getConnection(function(err, connection) {
        query="INSERT INTO chat_room (uuid, name, is_active, creation_date, modify_date, position) VALUES ('"
             + room.id + "', 'room_name', 1, " + connection.escape(new Date()) + ", " + connection.escape(new Date())
             + ", 0) ON DUPLICATE KEY UPDATE modify_date=" + connection.escape(new Date()) +";" ;
        console.log(query);
        connection.query(query, function(err, rows, fields){ //Insertando nuestro comentario
            if(err)
              callback(err);

            utils.setRoom(rooms, room);
            people = utils.getUsersFromRoom(rooms, room.id);
            if(people != undefined && Object.keys(people).length != 0){
              for(var person in people){
                query = "INSERT INTO chat_roomuser(room_id, user_id, is_active, creation_date, modify_date, position) "
                + " VALUES ('" + room.id+ "', '" + people[person].id+"', 1, " + connection.escape(new Date()) + ", " + connection.escape(new Date())
                + ", 0) ON DUPLICATE KEY UPDATE modify_date=" + connection.escape(new Date()) +";" ;
                console.log(query);
                var rows = connection.query(query, function(err, rows){
                    if(err)
                       console.log(err);
                });
              }
            }
            else {
                console.log("No one in the room " + room );
            }
            connection.release();
            callback("Success");
          });
      });
    },

    getDBRoomsByUser: function (id){
      userRooms = {};
      query = "SELECT c.uuids, c.name FROM chat_room  AS c "
            + "JOIN chat_roomuser AS  r ON r.room_id=c.room_id "
            + "WHERE r.user_id ='" + id + "';"

      var rows = connection.query(query, function(err, rows, fields) {
        if (err) throw err;

/*        console.log("User with id:" + id + " are in " + Object.keys(rows).length + " rooms");*/
        for (var i in rows) {
          userRooms[rows[i].id] = rows[i];
/*            console.log('User: ' + id + ' belong to Room: ' + rows[i].name);*/
        };

        if(Object.keys(userRooms).length != 0){
          return userRooms;
        }else{
          console.log("User don't belong to any room");
        }
      });
    },

  /*  getDBRooms: function (rooms){
      query = "select r.uuid, u.user_id, user.nickname  from chat_room as r join chat_roomuser as u "
      + "join account_user as user where r.uuid=u.room_id and user.id=u.user_id  order by r.uuid;";
      var rows = connection.query(query, function(err, rows, fields) {
        console.log(err);
        if (err) throw err;
        var rooms = {};
        for (var i in rows) {
            if(rooms[rows[i].uuid] == null || rooms[rows[i].uuid] == undefined){
                var room = new Room(rows[i].uuid);
                var person = new Person(rows[i].user_id);
                person.setUsername(rows[i].nickname);
                room.addPerson(person);
                rooms[rows[i].uuid] = room;
                console.log("Person: " + person.id);
                console.log("Room: " + room.id);
            }else{
                var person = new Person(rows[i].user_id);
                person.setUsername(rows[i].nickname);
                rooms[rows[i].uuid].people[person.id] = person;
                console.log("Person: " + person.id);
            }
        }
        console.log("getDBRooms:" + Object.keys(rooms).length);
        return rooms;
      });
    },

    removeDBUserFromRoom: function (room, id){
      query = "Delete from chat_roomuser where user_id="+ id;
      if(connection.query(query)){
          utils.removeUser(rooms, room.id, id);
      }
      else{
        console.log("Error trying to delete.");
      }
    },*/

    removeDBRoom: function  (id){
      query = "Delete from chat_room where uuid="+ id;
      if(connection.query(query)){
          console.log("Room:" + id + " delete.")
          utils.removeRoom(rooms, id);
      }
      else{
        console.log("Error trying to delete.");
      }
    }
};
