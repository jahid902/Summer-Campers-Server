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



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
      const selectedClassesCollection = client.db('SummerCampers').collection('selectedClasses');

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

    // get student selected classes
    app.get('/userClasses', async(req,res) =>{
      const email = req.query?.email;
      let query = {}
      if(email){
        query = { email: email}
      }
      const result = await selectedClassesCollection.find(query).toArray();
      res.send(result);
    })

    // delete specific student class by id
    app.delete('/classDlt/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await selectedClassesCollection.deleteOne(query);
      res.send(result);
    })

    // get user added class by email
    app.get('/addedClass/:email', async(req,res) => {

      const email = req.params.email;
      let query = {}
      if(email){
         query = {email : email}
      }
      const result = await classesCollection.find(query).toArray()
      res.send(result)

    })

    // get route for single Class information
    app.get('/singleClass/:id', async (req,res) => {
      const id = req.params.id;
      const query = {_id : new ObjectId(id)}
      const result = await classesCollection.findOne(query);
      res.send(result);
    })

    // update teacher added class route
    app.patch('/singleClass/:id', async(req,res) => {
        const id = req.params.id;
        const body = req.body;
        const query = {_id : new ObjectId(id)}
        const options = {
          $set: {
            price : body.price,
            enrolled : body.enrolled,
            duration : body.duration
          }
        }
        const result = await classesCollection.updateOne(query,options)
        res.send(result);
    })


    // post class route 
    app.post('/addClass', async(req,res) => {
      const body = req.body;
      const result = await classesCollection.insertOne(body);
      res.send(result);
    })

    // post student selected class route
    app.post('/selectedClass', async (req,res) => {
      const body = req.body;
      const result = await selectedClassesCollection.insertOne(body);
      res.send(result);
    })

    // get route for all users
    app.get('/allUsers', async(req,res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    // patch route for user role update
    app.patch('/updateUser/:id', async(req,res) => {
      const id = req.params.id;
      const body = req.body;
      const query = {_id : new ObjectId(id)}
      const options = {
        $set: {
          role : body.role
        }
      }
      const result = await usersCollection.updateOne(query,options)
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