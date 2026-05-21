// const dns = require("node:dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require('express')
const cors=require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const dotenv=require('dotenv');
dotenv.config();

const app = express()
const port = process.env.PORT;

app.use(cors())
app.use(express.json())

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   await client.connect();
    
   const db=client.db("ideavault");
   const ideaCollection=db.collection("ideas");


  app.post('/idea',async(req,res)=>{
    const ideaData=req.body;
    const result=await ideaCollection.insertOne(ideaData);

    res.json(result);
  })

  app.get("/idea",async(req,res)=>{
    const result = await ideaCollection.find().toArray();
    res.json(result);
  })

  app.get("/idea/:id",async(req,res)=>{
    const {id} =req.params ;
    const result =await ideaCollection.findOne({_id:new ObjectId(id)})

    res.json(result)
  })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('server is running!')
})

app.listen(port, () => {
  console.log(`server running on port ${port}`)
})