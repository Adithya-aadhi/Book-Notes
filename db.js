import PG, { Pool } from "pg";

export const pool=new Pool({
    user:"postgres",
    host:"localhost",
    database:"to-do",
    password:"root123",
    port:5432
})

// const data= await pool.query("select * from book_data");
// console.log(data.rows);