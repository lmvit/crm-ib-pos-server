const { Client } = require("pg");

class DataBase {

    // for production
    static URL = "postgres://pwmfshdqfowqqd:c8805286182ac4334e78bd64abbd80564dcebb3209b0c24ba9fb03052d6774c9@ec2-3-218-71-191.compute-1.amazonaws.com:5432/d2ltiulfg6itno";
    static DB = new Client({ connectionString: DataBase.URL,ssl:{rejectUnauthorized:false}});
  
    static Connect() {
      DataBase.DB.connect();
    }
  }
 


module.exports = DataBase;