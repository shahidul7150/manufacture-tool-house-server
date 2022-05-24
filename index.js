const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cwy78.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('tools-house').collection('products');
        
        const bookingCollection = client.db('tools-house').collection('booking');
        

        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray()
            res.send(products)
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            res.send(product)
        })

      app.post('/product', async (req, res) => {
        const newProduct = req.body;
        const result = await productCollection.insertOne(newProduct);
        res.send(result);
        })

      
      app.post('/booking', async (req, res) => {
        const booking = req.body;
        const result = await bookingCollection.insertOne(booking);
        res.send(result);
      })

      app.get('/booking', async (req, res) => {
        const query = {};
        const cursor = bookingCollection.find(query);
        const products = await cursor.toArray()
        res.send(products)
    });
        
    }
    finally {
        
    }
}
run().catch(console.dir)


app.get('/', (req, res) => {
  res.send('Tools House server is running');
});

app.listen(port, () => {
  console.log(`Tools House app listening on port ${port}`);
});
