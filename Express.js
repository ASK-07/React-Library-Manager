const { MongoClient} = require('mongodb');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const uri = "mongodb+srv://askaylor7:JdovmgHuMmlYWyQP@glb116-capstonecluster.iwtffnu.mongodb.net/?retryWrites=true&w=majority&appName=GLB116-CapstoneCluster";

app.use(bodyParser.json());

app.use(bodyParser.json());
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Cache-Control', 'no-store'); 
    if (req.method === "OPTIONS") {
        res.sendStatus(200);
    } else {
        next();
    }
}); 
let cs = "mongodb+srv://askaylor7:JdovmgHuMmlYWyQP@glb116-capstonecluster.iwtffnu.mongodb.net/?retryWrites=true&w=majority&appName=GLB116-CapstoneCluster"
let db;
let books;

async function start() {
    const client = new MongoClient(cs)
    await client.connect();
    db = client.db("CapstoneLibrary");
    books = db.collection("books");
    await insertStartBooks();
    console.log("Listening");
    app.listen(3000);
    }
async function insertStartBooks() {
    try {
        await books.deleteMany({});
        await books.insertMany(StartBooks);
        console.log("StartBooks inserted successfully");
    } catch (error) {
        console.error("Error inserting StartBooks:", error);
    }
}
var StartBooks = [
  { id: "1", title: "To Kill a Mockingbird", author: "Harper Lee", publisher: "J.B. Lippincott & Co.", isbn: "978-0-06-112008-4", avail: true },
  { id: "2", title: "Pride and Prejudice", author: "Jane Austen", publisher: "T. Egerton", isbn: "978-0-19-953556-9", avail: true },
  { id: "3", title: "The Great Gatsby", author: "F. Scott Fitzgerald", publisher: "Charles Scribner's Sons", isbn: "978-0-7432-7356-5", avail: true },
  { id: "4", title: "1984", author: "George Orwell", publisher: "Secker & Warburg", isbn: "978-0-452-28423-4", avail: false, who: "Michael Carter", due: "3/15/26" },
  { id: "5", title: "The Book Thief", author: "Markus Zusak", publisher: "Picador", isbn: "978-0-375-84220-7", avail: false, who: "Sarah Nguyen", due: "3/18/26" },
  { id: "6", title: "The Road", author: "Cormac McCarthy", publisher: "Alfred A. Knopf", isbn: "978-0-307-38789-9", avail: false, who: "Daniel Brooks", due: "3/20/26" },
  { id: "7", title: "The Kite Runner", author: "Khaled Hosseini", publisher: "Riverhead Books", isbn: "978-1-59448-000-3", avail: true },
  { id: "8", title: "Life of Pi", author: "Yann Martel", publisher: "Knopf Canada", isbn: "978-0-15-602732-8", avail: true },
  { id: "9", title: "The Night Circus", author: "Erin Morgenstern", publisher: "Doubleday", isbn: "978-0-385-53463-5", avail: true },
  { id: "10", title: "The Alchemist", author: "Paulo Coelho", publisher: "HarperOne", isbn: "978-0-06-231500-7", avail: true },
  { id: "11", title: "A Man Called Ove", author: "Fredrik Backman", publisher: "Atria Books", isbn: "978-1-4767-3612-5", avail: true }
];




app.get('/books', (req, res) => {
    const availParam = req.query.avail;

    
    const filter = availParam === 'true' ? { avail: true } : availParam === 'false' ? { avail: false } : {};

    books.find(filter)
        .project({ _id: 0, id: 1, title: 1 })
        .toArray()
        .then(allbooks => {
            res.status(200).send(JSON.stringify(allbooks));
        })
        .catch(error => {
            res.status(500).send("Internal Server Error");
        });
});



app.get('/books/:id', (req,res) => {
    books.findOne( { id:req.params.id } )
    .then( (book) => {
    if (book == null)
    res.status(404).send("not found")
    else res.send(JSON.stringify(book))
    } )
    })


    app.put('/books/:id', (req,res) => { 
        const bookId = req.params.id;
        const updateData = req.body;
        books.updateOne({ id: bookId }, { $set: updateData })
            .then(result => {
                if (result.modifiedCount === 0) {
                    res.status(404).send("Book not found");
                } else {
                    res.send("Book updated successfully");
                }
            })
            .catch(error => {
                res.status(500).send("Internal Server Error");
            });
    });
    app.delete('/books/:id', (req,res) => { 
        const bookId = req.params.id;
        books.deleteOne({ id: bookId })
            .then(result => {
                if (result.deletedCount === 0) {
                    res.status(204).send("Book not found");
                } else {
                    res.send("Book deleted successfully");
                }
            })
            .catch(error => {
                res.status(500).send("Internal Server Error");
            });
    });
    app.post('/books', (req,res) => { 
        const newBook = req.body;
        if (!newBook.title) {
            res.status(403).send("Book must have a name");
            return;
        }
        
        books.insertOne(newBook)
            .then(result => {
                res.status(201).send("Book added successfully");
            })
            .catch(error => {
                res.status(500).send("Internal Server Error");
            });
    });
start()