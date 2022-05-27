const express = require('express');
const cors = require('cors');

// const corsConfig = {
//   origin: true,
//   credentials: true,
//   }


const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());


// app.use(cors(corsConfig))
// app.options('*', cors(corsConfig))
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwy78.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});


function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({message:'UnAuthorize Access'});
  }
  const token = authHeader.split(' ')[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: 'Forbidden Access' });
    }
    req.decoded = decoded;
    next();
  });
}


async function run() {
  try {
    await client.connect();
    const productCollection = client.db('tools-house').collection('products');

    const bookingCollection = client.db('tools-house').collection('booking');
    const usersCollection = client.db('tools-house').collection('users');
    const reviewCollection = client.db('tools-house').collection('reviews');


// user
    
app.get('/user',verifyJWT, async (req, res) => {
  // const query = {};
  // const cursor = usersCollection.find(query);
  // const user = await cursor.toArray();
  const users = await usersCollection.find({}).toArray();
  res.send(users);
});
    
    
    app.get('/admin/:email', async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user.role === 'admin';
      res.send({admin:isAdmin})
    })
    
    
    app.put('/user/admin/:email',verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await usersCollection.findOne({ email: requester });
      if (requesterAccount.role === 'admin') {
        const filter = { email: email };
      const updateDoc = {
        $set:{role:'admin'}
      }
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
      }
      else {
        res.status(403).send({message:'forbidden access'})
      }
      
    })
    app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set:user
      }
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      const token=jwt.sign({email:email},process.env.ACCESS_TOKEN_SECRET,{expiresIn:'1h'})
      res.send({result,token});
    })


    
    app.get('/product', async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });

    app.get('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const product = await productCollection.findOne(query);
      res.send(product);
    });

    app.post('/product', async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    app.delete('/product/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });



    app.get('/booking', async (req, res) => {
      const query = {};
      const cursor = bookingCollection.find(query);
      const products = await cursor.toArray();
      res.send(products);
    });


    //Specefic user

   

    app.get('/myBooking', async(req,res)=>{
      const queryEmail = req.query.email;  
      

      await bookingCollection.find({email: queryEmail})
      .toArray((err,docs)=>res.send(docs))
    })

    app.get('booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingCollection.findOne(query);
      res.send(booking);
   })

    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
      res.send(result);
    });


    app.delete('/booking/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await bookingCollection.deleteOne(query);
      console.log(result);
      res.send(result);
    });



    // reviews

    app.post('/review', async (req, res) => {
      const newReview = req.body;
      const result = await reviewCollection.insertOne(newReview);
      res.send(result);
    });


    app.get('/review', async (req, res) => {
      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Tools House server is running');
});

app.listen(port, () => {
  console.log(`Tools House app listening on port ${port}`);
});
