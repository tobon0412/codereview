"use strict";
let Room = require('./room.js');
let Person = require('./person.js');
let utils = require('./utils.js');
let db = require('./db.js');
let response = require('./response.js')
, _ = require('underscore')._
, uuid = require('node-uuid');
let app = require('express')();
let server = require('http').createServer(app);
let io = require('socket.io').listen(server);

let available = {};
let rooms = {};
/*db.getDBRooms(function(response){
  console.log("rooms asigned");
  rooms = response;
});*/
/////

let  userPromise = new Promise(
        // The resolver function is called with the ability to resolve or
        // reject the promise
        function(resolve, reject) {
            console.log('Promise started DBUsers async code started');
            // This is only an example to create asynchronism
            db.getDBUsers(function(val){
                console.log('Promise fulfilled DBUsers async code started');
                if(val.code != null || val.code != undefined)
                  reject(val);
                resolve(val);
              });
        }
    );

let roomsPromise = new Promise(
        // The resolver function is called with the ability to resolve or
        // reject the promise
        function(resolve, reject) {
            console.log('Promise started DBRooms async code started');
            // This is only an example to create asynchronism
            db.getDBRooms(function(val){
                console.log('Promise fulfilled DBRooms async code started');
                if(val.code != null || val.code != undefined)
                  reject(val);
                resolve(val);
              });
        }
    );
    // We define what to do when the promise is resolved/fulfilled with the then() call,
    // and the catch() method defines what to do if the promise is rejected.
    userPromise.then(
        // Log the fulfillment value
        function(val) {
            available = val;
            console.log('Promise fulfilled DBUsers Async code terminated ');
        })
    .catch(
        // Log the rejection reason
        function(reason) {
            console.log('Handle rejected promise  DBUsers ' + reason.code);
        });

    // We define what to do when the promise is resolved/fulfilled with the then() call,
    // and the catch() method defines what to do if the promise is rejected.
    roomsPromise.then(
        // Log the fulfillment value
        function(val) {
           rooms = val;
            console.log('Promise fulfilled DBRooms Async code terminated ');
        })
    .catch(
        // Log the rejection reason
        function(reason) {
            console.log('Handle rejected promise  DBRooms ' + reason.code);
        });

/*db.getAvailableUsers(function(response){
  console.log("users asigned");
  available = response;
});
*/
let sockets = [];
let chatHistory = {};

app.get('/', function(req, res){
 /* if(rooms != undefined){
      console.log("Rooms: " + Object.keys(rooms).length);
   }else{

   }*/
  //res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  // when the client emits 'new message', this listens and executes
  socket.on('message', function (data) {

    console.log("socket id server side " + socket.room);
    utils.sendPushNotificationToOffline(rooms, socket.room);
    console.log("Message: " + data.username);
    let person = utils.getAvailableUser(available, data.username);
    if(person != undefined){
      console.log("Nickname message:" + person.getUsername());
      let nickname = person.getUsername();

       let MessagePromise = new Promise(
          // The resolver function is called with the ability to resolve or
          // reject the promise
          function(resolve, reject) {
              console.log('Promise started setDBNewMessage async code started');
              // This is only an example to create asynchronism
              db.setDBNewMessage(rooms, socket.room, data.username ,data.message, function(val){
                  console.log('Promise fulfilled setDBNewMessage async code started');
                  if(val.code != null || val.code != undefined)
                    reject(val);
                  resolve(val);
                });
          }
      );
      MessagePromise.then(
          // Log the fulfillment value
          function(val) {
              console.log('Promise fulfilled setDBNewMessage Async code terminated ' + val);
              socket.broadcast.to(socket.room).emit('new message', {
                username: data.username,
                message: data.message,
                nickname: nickname
              });
          })
      .catch(
          // Log the rejection reason
          function(reason) {
              console.log('Handle rejected promise setDBNewMessage ' + reason.code);
          });
    }
  });

  socket.on("receive", function(data){
    console.log("Receive event:" + data.room + " " + data.username);
    if(data.msg == "ok"){
      let newMessagePromise = new Promise(
          // The resolver function is called with the ability to resolve or
          // reject the promise
          function(resolve, reject) {
              console.log('Promise started getDBNewMessages async code started');
              // This is only an example to create asynchronism
                  db.isDBReceiveMessage(data.room, data.username, function(val){
                  console.log('Promise fulfilled isDBReceiveMessage async code started');
                  if(val.code != null || val.code != undefined)
                    reject(val);
                  resolve(val);
                });
          }
      );
      newMessagePromise.then(
          // Log the fulfillment value
          function(val) {
              console.log('Promise fulfilled isDBReceiveMessage Async code terminated ');
          })
      .catch(
          // Log the rejection reason
          function(reason) {
              console.log('Handle rejected promise isDBReceiveMessage ' + reason.code);
          });


      console.log(data.msg + " by " + data.username);
    }else{
      console.log("not ok!!");
    }
    //console.log(data.msg + " by " + data.username);
  });

  // when the user disconnects.. perform this
/*  socket.on('offline', function (data) {
    socket.broadcast.to(data.room).emit("update", {message: "offline", username: data.username, room: data.room});
    socket.leave(data.room);
    console.log("Join personal room: " + data.username + " data.room :" + data.room);
    socket.room = data.username;
    socket.join(socket.room);
    console.log("Joined personal room: " + data.username + " data.room :" + socket.room);
    utils.setStatusUser(rooms, data.room, data.username, false);
    //utils.setOfflineUser(available, socket.id);
  });*/

  socket.on('disconnect', function () {
    console.log("disconnect");
    utils.setStatusUser(rooms, socket.room, socket.username, false);
    //socket.broadcast.to(data.room).emit("update", {message: "offline", username: data.username, room: data.room});
    socket.leave(socket.room);
    console.log("socket.username: " + socket.username + " socket.room :" + socket.room + " " + socket.id);
    //utils.setStatusUser(rooms, socket.room, socket.username, false);
    socket.room = socket.username;
    socket.join(socket.room);
    console.log("socket.username: " + socket.username + " socket.room :" + socket.room);
    utils.showClientsInRooms(rooms);
    //utils.setOfflineUser(available, socket.id);
  });
 /* socket.on("user rooms", function(id){
    console.log("All rooms of user: " + id);
    db.getDBRoomsByUser(id);
  });*/

  //Add user to database
  socket.on('add user', function (data) {
    //if (addedUser) return;
    //people[socket.id] = new People(data.username, socket.id);
    //if(data.user_id != null && data.user_id != undefined){
    if(data.room == null || data.room == undefined){
      console.log("server add user");
      let userRoom = new Room(data.id);
      let person = utils.getAvailableUser(available, data.id);
      if(person != undefined){
        socket.username = person.id;
        //person = db.getDBUserById(data.id);
        console.log("Person.id: " + person.id);
        //person.addSocket(socket);
        //person.addUsername(data.id);
        userRoom.addPerson(person);
      //console.log("Personal room: " + userRoom.name +" - id "+ userRoom.id);
        console.log("Numero de rooms:" + Object.keys(rooms).length);
        let userRoomPromise = new Promise(
          // The resolver function is called with the ability to resolve or
          // reject the promise
          function(resolve, reject) {
              console.log('Promise started setDBRoom async code started');
              // This is only an example to create asynchronism
               db.setDBRoom(rooms, userRoom, function(val){
                  console.log('Promise fulfilled setDBRoom async code started');
                  if(val.code)
                    reject(val.code);
                  resolve(val);
                });
          }
      );
      userRoomPromise.then(
          // Log the fulfillment value
          function(val) {
              console.log('Promise fulfilled setDBRoom Async code terminated: ' + val);

          })
      .catch(
          // Log the rejection reason
          function(reason) {
              console.log('Handle rejected promise  setDBRoom ' + reason);
          });

        socket.room = userRoom.id;
        socket.join(socket.room);

        socket.emit('login user', {
          room: userRoom.id,
          username: person.id
        });
      }{
        console.log("Person don't found");
      }

    }else{
      socket.room = data.room;
      socket.join(socket.room);
    //  utils.setAvailableUser(available, person);
    }
      //console.log("Personal room joined: " + socket.room);

      /*let clients = io.sockets.clients();
      console.log(clients);*/
    /* }else{
      console.log("User don't exist");
    }*/

  });
//TODO:Check why from iphone can't save room in database
//Room functions
  socket.on("create room", function(data) {
    let usersRoom = utils.existRoom(rooms, data.user_id_1, data.user_id_2);
    console.log("Room exist?: " + usersRoom);
    if(data.user_id_1 != undefined && data.user_id_2 != undefined
      && utils.getAvailableUser(available, data.user_id_1) != undefined
      && utils.getAvailableUser(available, data.user_id_2) != undefined
      && usersRoom == undefined){


      //console.log("En create room:");
      //console.log("socket id server side " + socket.id);
      let id = data.user_id_1 + data.user_id_2 + "-";
      let v4 = uuid.v4();
      id = id.concat(v4);
      console.log("New id: " + id);
      let room = new Room(id);
      let person_1 = utils.getAvailableUser(available, data.user_id_1);
      person_1.setOnline(true);
      let person_2 = utils.getAvailableUser(available, data.user_id_2);
      room.addPerson(person_1);
      room.addPerson(person_2);
      socket.username = person_1.id;
      let setDBRoomPromise = new Promise(
          // The resolver function is called with the ability to resolve or
          // reject the promise
          function(resolve, reject) {
              console.log('Promise started setDBRoom Transaction async code started');
              // This is only an example to create asynchronism
               db.setDBRoom(rooms, room, function(val){
                  console.log('Promise fulfilled setDBRoom Transaction async code started');
                  if(val.code)
                    reject(val.code);
                  resolve(val);
                });
          }
      );
      setDBRoomPromise.then(
          // Log the fulfillment value
          function(val) {
              console.log('Promise fulfilled setDBRoom Async Transactioncode terminated: ' + val);
               socket.room = room.id;
               socket.join(socket.room);
               console.log("send PushNotification to: " + person_2.id);
               utils.PushNotification(person_2.id, room.id);

               socket.emit('login user', {
                 username: socket.username,
                 room: socket.room
               });

               socket.emit("update", {username: socket.username, room: socket.room, message: " online "});
          })
      .catch(
          // Log the rejection reason
          function(reason) {
              console.log('Handle rejected promise  setDBRoom Transaction ' + reason);
          });
    }
    else{
      if(usersRoom != undefined){
          socket.room = usersRoom;
          socket.join(socket.room);
          console.log(socket.room);
          socket.emit('login user', {
             username: socket.username,
             room: socket.room
             //numUsers: numUsers
             });
        }
      socket.emit("update", {username: socket.username, room: socket.room, message: "Faltan los id de usuarios o el room ya existe "});
    }
  });

  socket.on("join room", function(data) {
      //console.log(Object.keys(rooms).length);
      console.log("DATA: " + data);
      let room = undefined;
      let person = utils.getAvailableUser(available, data.username);
      if(rooms[data.room] != undefined && rooms[data.room] != null
        && person != undefined && person != null){

        room = rooms[data.room];
        socket.room = room.id;
        socket.join(socket.room);
        socket.username = person.id;
        //let newMessages = {};
        console.log("User " + data.username + " in room: " + socket.room);
        utils.showAvailableUsers(available, data.username);
      /*let person = new Person(socket.id);*/
        room.addPerson(person);
        utils.setStatusUser(rooms, room.id, data.username, true);

        let setDBUserRoomPromise = new Promise(
        // The resolver function is called with the ability to resolve or
        // reject the promise
        function(resolve, reject) {
            console.log('Promise started setDBUserRoom async code started');
            // This is only an example to create asynchronism
            db.setDBUserRoom(room, person,  function(val){
                console.log('Promise fulfilled setDBUserRoom async code started');
                if(val.code)
                  reject(val.code);
                resolve(val);
              });
        }
        );
        setDBUserRoomPromise.then(
            // Log the fulfillment value
            function(val) {
                console.log('Promise fulfilled setDBUserRoom Async code terminated: ' + val);

            })
        .catch(
            // Log the rejection reason
            function(reason) {
                console.log('Handle rejected promise  setDBUserRoom ' + reason);
            });

        utils.showClientsInRooms(rooms);
        socket.emit('login user', {
              username: socket.username,
              room: socket.room
              //numUsers: numUsers
              });

        socket.broadcast.to(socket.room).emit("update", {username: socket.username, room: socket.room, message: " online "});
    }
 // });
  });
  //Room

  //Send emit update to the room
  socket.on("user connected", function(data){
    console.log("user connected: " + data.username);
    if(data.username != undefined || data.room != undefined){
      let newMessagePromise = new Promise(
          // The resolver function is called with the ability to resolve or
          // reject the promise
          function(resolve, reject) {
              console.log('Promise started getDBNewMessages async code started');
              // This is only an example to create asynchronism
              db.getDBNewMessage(available, data.username, data.room, socket, function(val){
                  console.log('Promise fulfilled getDBNewMessages async code started');
                  if(val.code != null || val.code != undefined)
                    reject(val);
                  resolve(val);
                });
          }
      );
      newMessagePromise.then(
          // Log the fulfillment value
          function(val) {
              console.log('Promise fulfilled getDBNewMessages Async code terminated ');
          })
      .catch(
          // Log the rejection reason
          function(reason) {
              console.log('Handle rejected promise  getDBNewMessages ' + reason.code);
          });
    }
      /*db.getDBNewMessage(available, data.username, data.room, socket);*/
      socket.broadcast.to(data.room).emit("update", {username: data.username, room: data.room, message: " connected " });

  });

  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function (data) {
    console.log("typing to: " + data.room);
    let person = utils.getAvailableUser(available, data.username);
    console.log("Nickname typing:" + person.getUsername());
    let nickname = person.getUsername();
    socket.broadcast.to(data.room).emit('typing', {
      username: socket.username,
      nickname: nickname
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function (data) {
    let person = utils.getAvailableUser(available, data.username);
    console.log("Nickname stop typing:" + person.getUsername());
    let nickname = person.getUsername();
    socket.broadcast.to(data.room).emit('stop typing', {
      username: socket.username,
      nickname: nickname
    });
  });
});


server.listen(3000, function(){
  console.log('listening on *:3000');
});
