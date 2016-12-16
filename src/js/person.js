
function Person(id){
    this.id = id;
    this.username = "";
    this.avatar = "";
    this.socket = "";
    this.online = false;
    this.available = true;
    this.image = "";
};

Person.prototype.setAvatar = function(avatar){
    this.avatar = avatar;
}

Person.prototype.getAvatar = function(){
    return this.avatar;
}

Person.prototype.setUsername = function(username){
    this.username = username;
}

Person.prototype.getUsername = function(){
   return this.username;
}

Person.prototype.setSocket = function(socket){
    this.socket = socket;
}

Person.prototype.getSocket = function(){
    return this.socket;
}

Person.prototype.setOnline = function(online){
    this.online = online;
}

Person.prototype.getOnline = function(){
    return this.online;
}

Person.prototype.setImage = function(image){
    this.image = image;
}

Person.prototype.getImage = function(){
    return this.image;
}

module.exports = Person;
