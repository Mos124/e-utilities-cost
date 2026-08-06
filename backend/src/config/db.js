const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config();

const dialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dialect === 'sqlite') {
  const storagePath = process.env.DB_STORAGE 
    ? path.resolve(process.env.DB_STORAGE) 
    : path.resolve(__dirname, '../../database.sqlite');
  
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'e_utilities_cost',
    process.env.DB_USER || 'app_user',
    process.env.DB_PASSWORD || 'changeme',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mariadb',
      logging: false,
      pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      dialectOptions: {
        connectTimeout: 10000
      }
    }
  );
}

module.exports = sequelize;
