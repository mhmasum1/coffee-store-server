require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;


app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://coffee-store-client-tawny-rho.vercel.app"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"]
}));


app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oeyfvq1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        console.log("✅ Successfully connected to MongoDB!");

        const coffeesCollection = client.db('coffeeDB').collection('coffees');

        // GET all coffees
        app.get('/coffees', async (req, res) => {
            try {
                const result = await coffeesCollection.find().toArray();
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });

        // GET single coffee by ID
        app.get('/coffees/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await coffeesCollection.findOne(query);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });

        // POST new coffee
        app.post('/coffees', async (req, res) => {
            try {
                const newCoffee = req.body;
                console.log('Adding new coffee:', newCoffee);
                const result = await coffeesCollection.insertOne(newCoffee);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });

        // PUT update coffee
        app.put('/coffees/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const filter = { _id: new ObjectId(id) };
                const options = { upsert: true };
                const updatedCoffee = req.body;
                const updatedDoc = { $set: updatedCoffee };
                const result = await coffeesCollection.updateOne(filter, updatedDoc, options);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });

        // DELETE coffee
        app.delete('/coffees/:id', async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await coffeesCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: error.message });
            }
        });

        // Ping to confirm connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");

    } catch (error) {
        console.error("❌ MongoDB Connection Error:");
        console.error(error.message);
    }
}

run().catch(console.dir);

// Root route
app.get('/', (req, res) => {
    res.send('Coffee server is getting hotter.');
});

// Start server
app.listen(port, () => {
    console.log(`Coffee server is running on port ${port}`);
});

// Export for Vercel
module.exports = app;