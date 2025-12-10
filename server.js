import express from "express";
import { pool } from "./db.js";
import axios from "axios";

const app=express();
const port =4000;
app.set('view engine', 'ejs'); 

app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({extended:true}));

app.get("/",(req,res)=>{
    res.render("home.ejs")
})

app.get("/add", (req, res) => {
    res.render("add.ejs")
});

app.post('/submit',async (req,res)=>{
    const {name, date,descr,rating}=req.body;
    try {
        const resp=await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(name)}`)
        const book_id=resp.data.docs[0].cover_i;
        const coverUrl = `https://covers.openlibrary.org/b/id/${book_id}-L.jpg`;
        await pool.query("insert into book_data(date,name,image,descr,rating) values($1,$2,$3,$4,$5);",[date,name,coverUrl,descr,rating]);

    } catch (error) {
        console.log(error);
    }
    res.redirect('/add');
})

app.get('/cover',async (req,res)=>{

    let name="the lost world"
    const resp=await axios.get(`https://openlibrary.org/search.json?title=${encodeURIComponent(name)}`)
    //res.send(resp.data.docs[0].cover_i);
    const book=resp.data.docs[0];
    const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`;
    res.render("list.ejs",{coverUrl});
})

  
app.get('/list', async(req,res)=>{
    let sort=req.query.sort;
    let query='select * from book_data';

    if(sort==="recency"){
        query='select *from book_data order by date desc;';
    }
    else if(sort==="rating"){
        query='select * from book_data order by rating desc;';
    }
    try {
        const list=await pool.query(query);
        const data=list.rows;
        res.render("list.ejs",{data,sort})
    }

    catch (error) {
        console.log(error);
    }
})


app.get('/delete/:id',async(req,res)=>{
    const {id}=req.params
    try {
        await pool.query('delete from book_data where id=$1;',[id]);
        res.redirect('/list')
    } catch (error) {
        console.log(error);
    }
})


app.listen(port,()=>{
    console.log(`Listening on port ${port}`);
})