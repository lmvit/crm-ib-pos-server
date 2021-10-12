require('dotenv').config();
const { Client } = require("pg");

class DataBase {

    // for production
    static URL = `postgres://${process.env.DATA_Base_USER}:${process.env.DATA_BASE_PASSWORD}${process.env.DATA_BASE_ADDRESS}:${process.env.DATA_BASE_PORT}/${process.env.DATA_BASE_NAME}`;
    static DB = new Client({ connectionString: DataBase.URL,ssl:{rejectUnauthorized:false}});
  
    static Connect() {
      DataBase.DB.connect();
    }
  }
 


module.exports = DataBase;