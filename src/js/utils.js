var request = require('request');
//var Response = require('./response.js')
module.exports = {

//TODO:Make it work
  /*Promises: function(type){
    var newMessagePromise = new Promise(
          // The resolver function is called with the ability to resolve or
          // reject the promise
          function(resolve, reject) {
              console.log('Promise started getDBNewMessages async code started');
              // This is only an example to create asynchronism
                  Switch(type){
                    case "setDBRoom": db.setDBRoom(rooms,room);
                      break;
                  }
                  asynFunction(data.room, data.username, function(val){
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
  },
*/
  PushNotification: function(user_id){
   console.log("push_notifications");
    var postData = {
      user: user_id,
      text: "Message from chat"
    };

    var options = {
      url: 'http://localhost:7000/api/chat/push_notifications/create/',
      headers: {
        'User-Agent': 'request',
        'Content-Type': 'application/json'
      },
      form: postData
    };

    function optionalCallback(err, httpResponse, body) {
        if (err) {
          return console.error('upload failed:', err);
        }
        console.log('Upload successful!  Server responded with:');
      }
    request.post(options , optionalCallback);
  },

  setStatusUser(rooms, room_id, user_id, status){
    console.log(rooms[room_id].people[user_id].online);
    rooms[room_id].people[user_id].setOnline(status);
    console.log(rooms[room_id].people[user_id].online);
  },

  getAvailableUser: function (available, id){
    console.log("setAvailableUser: " + id);
    return available[id];
  },

  showAvailableUsers: function (available, id){
    console.log("Id "  + id);
    for(var i in available){
          console.log("user: " + available[i].id);
    }
  },

  setAvailableUser: function(available, user){
    available[user.id] = user;
    available[user.id].available = true;
    console.log("setONlineUser: " + available[user.id].id);
  },

  removeAvailableUser: function (available, id){
    available[id].available = false;
  },

/*   showOnlineUsers: function (online){
    console.log("-- Users online --");
    for(var item in online){
        console.log("  " + online[item].username + " id: " + online[item].id);
    }
    console.log("-- Users online end--");
  },*/


  sendPushNotificationToOffline: function(rooms, room_id){
    var offline = this.getOfflineUsers(rooms, room_id);

    if(Object.keys(offline).length != 0){
      for(var user in offline){
        this.PushNotification(user);
      }
    }

  },
  getOfflineUsers: function (rooms, room_id){
    console.log("Room id for search: " + room_id);
    offline = {};
    users = this.getUsersByRoom(rooms, room_id);
    //var response = new Response("Success", "Existen usuarios offline");
    for(var user in users){
      console.log(users[user].online);
      if(!users[user].online){
         console.log("User not available "+ users[user].id);
         offline[users[user].id] = users[user];
      }
        /*console.log(online[users[user].id].online + " != " + users[user].id);
        if(online[users[user].id] == null || online[users[user].id] == undefined && online[users[user].id].online == false){
          //console.log("user offline: " + users[user].id);
          offline[users[user].id] = users[user];
        }*/
        /*else{
          console.log("user online: " + users[user].id)
        }*/
    }
    return offline;
/*
      if(Object.keys(offline).length != 0){
        return offline);
      } else{
          retur
      }*/
  },

  getUsersFromRoom: function (rooms, id){
    //console.log("id room:" + id);
    if(rooms[id] != null && rooms[id] != undefined){
      if(rooms[id].people != null && rooms[id].people != undefined){
          console.log("List people: " + Object.keys(rooms[id].people).length);
          return rooms[id].people;
            }else{
              console.log("room without peoples");
            }
      }else{
        console.log("room not found");
      }
  },

   removeRoom: function (rooms, id){
    if(delete rooms[id]){
      console.log("Room " + id + "remove.");
    }
    else {
      console.log("Error trying to remove room:" + id);
    }
  },

   setRoom: function (rooms, room){
    if(rooms[room.id] != undefined && rooms[room.id] != null){
      console.log("Room: " + room.id + ", id:" + room.id + " already exist");
    }else{
      rooms[room.id] = room;

      console.log("Room added: " +  room.id);
    }
  },

   removeUser: function (rooms, room_id, user_id){
    if(delete rooms[room_id].people[user_id]){
      console.log("User" + user_id + "remove from room: " + room_id);
    }
    else {
      console.log("Error trying to remove user:" + user_id + " from " + room_id);
    }
  },

   /*setUserToRoom: function (rooms, room, user) {
    console.log("Set user to room in database:" + room.name + ", " + user.username);
     rooms[room.id].people[user.id] = user;
    if(rooms[room.id].people[user.id] != undefined && rooms[room.id].people[user.id] != null){
      console.log("User: " + user.username + " added to room: " + room.name);
    }else{
      console.log("Error trying to add user:" +  user.username + "to room: " + room.name);
    }
  },*/

   /*showRooms: function (){
    console.log("List rooms: " + rooms.length);
      rooms.forEach(item, index){
           console.log("  room: " + item.name);
      });
  }*/

   showClientsInRooms: function (rooms){
    console.log(" -- Clients in rooms --");
    console.log("Size: " + Object.keys(rooms).length);
    if(Object.keys(rooms).length != 0){
      for(var item in rooms){
           console.log("room: " + item);
           console.log("people object: " + rooms[item].people);
           if(rooms[item].people != null && rooms[item].people != undefined){
              console.log("List people: " + Object.keys(rooms[item].people).length);
           for(var person in rooms[item].people){
              var personRoom = rooms[item].people[person];
              console.log("person: " + personRoom.id + " " +personRoom.getUsername() + " " + personRoom.getOnline());
           }
         }else{
            console.log("Room without people");
         }

      }
  }else{
    console.log("Not rooms found");
  }
    console.log(" -- Clients in rooms end --");
  },

   getUsersByRoom: function (rooms, id){
    //console.log("getUsersByRoom: " + id + " " + rooms[id]);
    //this.showClientsInRooms(rooms);
    if(rooms[id] != undefined){
      //console.log("getusersbyroom id:" + id);
      if(Object.keys(rooms[id].people).length != 0){
        return rooms[id].people;
      }else{
        console.log("Room without people.");
      }
    }else{
      console.log("Room not found.");
    }
  },

  existRoom: function (array, user_id_1, user_id_2){

    for(var i in array){
      var initId = user_id_1 + user_id_2;
      var initId_revert = user_id_2 + user_id_1 ;
      console.log(initId + "==" + i.split("-")[0] + " || " + initId_revert + " == " + i.split("-")[0]);
      if(i.split("-").length > 1){
        if(initId == i.split("-")[0]  || initId_revert == i.split("-")[0] ){
          return i;
        }
      }
    }
  }

};
