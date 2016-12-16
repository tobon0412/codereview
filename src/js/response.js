function Response(status, message){
    this.status = status;
    this.message = message;
    this.reponse = new Object();
};

Response.prototype.getStatus = function (){
    return this.status;
};

Response.prototype.getMessage = function (){
    return this.message;
};

Response.prototype.setStatus = function (status){
    return this.status = status;
};

Response.prototype.setMessage = function (message){
    return this.message = message;
};

module.exports = Response;
