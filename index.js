const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ee0rgus.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    // await client.connect();
    // commented out client.connect ***

      const usersCollection = client.db('SummerCampers').collection('users');
      const classesCollection = client.db('SummerCampers').collection('classes');
      const teachersCollection = client.db('SummerCampers').collection('teachers');

    // post user role to Db
      app.post('/users', async (req,res)=> {
          const user = req.body;
          const result = await usersCollection.insertOne(user);
          res.send(result);
      })

      // get all classes
      app.get('/allClass', async (req,res)=>{
        const result = await classesCollection.find().toArray()
        res.send(result)
      })

      // get top 6 classes for most enrolled
      app.get('/classes', async (req,res)=>{
        const result = await classesCollection.find().sort({ enrolled:-1 }).limit(8).toArray()
        res.send(result);
      })

      // get 6 teachers for most students 
      app.get('/teachers', async (req,res)=>{
        const result = await teachersCollection.find().sort({students : -1}).limit(6).toArray()
        res.send(result);
      })

      // get all teachers
    app.get('/allTeachers', async (req,res)=>{
      const result = await teachersCollection.find().toArray()
      res.send(result);
    })

    // get single user data route
    app.get('/user', async(req,res) =>{
      const email = req.query?.email;
      let query = {}
      if(email){
        query = { email: email}
      }

      const result = await usersCollection.findOne(query);
      res.send(result);

    })

    // post class route 
    app.post('/addClass', async(req,res) => {
      const body = req.body;
      const result = await classesCollection.insertOne(body);
      res.send(result);
    })
    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('Summer Campers is running')
  })
  
  app.listen(port, () => {
    console.log(`Summer Campers in running on port: ${port}`)
  })