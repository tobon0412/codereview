function Room(id) {
  this.id = id;
  this.owner = "";
  this.people = {};
  this.peopleLimit = 5;
  this.status = "available";
  this.private = false;

};

/*function People(name, id){
    this.username = name;
    this.id = id;
    this.inroom = false;
    this.owns = false;
};
*/
//add functions to people

Room.prototype.addPerson = function(person) {
  //console.log("add person...");
  if (this.status === "available" && this.people[person.id] == null || this.people[person.id] == undefined) {
     //console.log("person added.");
    this.people[person.id] = person;
  }else{
    console.log("He is already in the room");
  }
};

Room.prototype.removePerson = function(person) {
  var personIndex = -1;
  for(var i = 0; i < this.people.length; i++){
    if(this.people[i].id === person.id){
      personIndex = i;
      break;
    }
  }
  this.people.remove(personIndex);
};

Room.prototype.getPerson = function(personID) {
  var person = null;
  for(var i = 0; i < this.people.length; i++) {
    if(this.people[i].id == personID) {
      person = this.people[i];
      break;
    }
  }
  return person;
};

Room.prototype.isAvailable = function() {
  return this.available === "available";
};

Room.prototype.isPrivate = function() {
  return this.private;
};

module.exports = Room;
