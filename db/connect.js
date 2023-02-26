import mysql from 'mysql'
import dotenv from 'dotenv'
dotenv.config()

const connectDB = mysql.createConnection({
    host:process.env.DB_Host,
    user:process.env.DB_USER,
    password:process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port:process.env.DB_PORT
});


export default connectDB