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
   const commentCollection=db.collection("comments");


  app.post('/idea',async(req,res)=>{
    const ideaData=req.body;
    const result=await ideaCollection.insertOne(ideaData);

    res.json(result);
  })

  app.get("/idea",async(req,res)=>{
    const result = await ideaCollection.find().toArray();
    res.json(result);
  })

  app.get("/feature",async(req,res)=>{
    const result = await ideaCollection.find().limit(6).toArray();
    res.json(result);
  })

  app.get("/idea/:id",async(req,res)=>{
    const {id} =req.params ;
    const result =await ideaCollection.findOne({_id:new ObjectId(id)})

    res.json(result)
  })

   app.post('/comment',async(req,res)=>{
      const commentData={...req.body,
      createdAt: new Date(),
    };

      // console.log(commentData);
      const result =await commentCollection.insertOne(commentData);

      res.json(result);
    })

     app.get('/comment/:id',async(req,res)=>{
      const {id} =req.params;
      const result =await commentCollection.find({
      ideaId: id
   }).toArray();
    
      res.json(result);
    })

    app.get('/my-comments/:email', async(req,res)=>{
   const { email } = req.params;

   const result = await commentCollection.find({
      userEmail: email
   }).toArray();

   res.send(result);
})
    app.get('/my-ideas/:email', async(req,res)=>{
   const { email } = req.params;

   const result = await ideaCollection.find({
      userEmail: email
   }).toArray();

   res.send(result);
})
  
app.delete('/comment/:id', async (req, res) => {

  const { id } = req.params;
  const { userEmail } = req.body;

  const result = await commentCollection.deleteOne({
    _id: new ObjectId(id),
    userEmail: userEmail
  });

  res.send(result);
});


app.patch('/comment/:id', async (req, res) => {

  const { id } = req.params;
  const { comment, userEmail } = req.body;

  const result = await commentCollection.updateOne(
    {
      _id: new ObjectId(id),
      userEmail: userEmail
    },
    {
      $set: { comment }
    }
  );

  res.send(result);
});

app.delete('/my-ideas/:id', async (req, res) => {

  const { id } = req.params;
  const result = await ideaCollection.deleteOne({
    _id: new ObjectId(id),
  });

  res.send(result);
});

app.patch('/my-ideas/:id', async (req, res) => {
  try {
    const { id } = req.params;

    
    const updateData = req.body;

    if (!updateData || Object.keys(updateData).length === 0) {
      return res.status(400).send({
        success: false,
        message: "No update data received",
      });
    }

    const result = await ideaCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: updateData,
      }
    );

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Server error" });
  }
});



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