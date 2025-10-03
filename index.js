const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create MongoClient
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Database connection function
async function connectDB() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");
        return client.db('coffeeDB').collection('coffees');
    } catch (error) {
        console.error("MongoDB connection error:", error);
        throw error;
    }
}

// Routes
app.get('/', (req, res) => {
    res.send('Coffee server is getting hotter.');
});

// Get all coffees
app.get('/coffees', async (req, res) => {
    try {
        const coffeeCollection = await connectDB();
        const cursor = coffeeCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    } catch (error) {
        console.error('Error fetching coffees:', error);
        res.status(500).send({ error: 'Failed to fetch coffees' });
    }
});

// Get single coffee
app.get('/coffees/:id', async (req, res) => {
    try {
        const coffeeCollection = await connectDB();
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.findOne(query);
        res.send(result);
    } catch (error) {
        console.error('Error fetching coffee:', error);
        res.status(500).send({ error: 'Failed to fetch coffee' });
    }
});

// Add new coffee
app.post('/coffees', async (req, res) => {
    try {
        const coffeeCollection = await connectDB();
        const newCoffee = req.body;
        const result = await coffeeCollection.insertOne(newCoffee);
        res.send(result);
    } catch (error) {
        console.error('Error adding coffee:', error);
        res.status(500).send({ error: 'Failed to add coffee' });
    }
});

// Update coffee
app.put('/coffees/:id', async (req, res) => {
    try {
        const coffeeCollection = await connectDB();
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedCoffee = req.body;
        const coffee = {
            $set: {
                name: updatedCoffee.name,
                Chef: updatedCoffee.Chef,
                supplier: updatedCoffee.supplier,
                taste: updatedCoffee.taste,
                price: updatedCoffee.price,
                details: updatedCoffee.details,
                photo: updatedCoffee.photo
            }
        };
        const result = await coffeeCollection.updateOne(filter, coffee, options);
        res.send(result);
    } catch (error) {
        console.error('Error updating coffee:', error);
        res.status(500).send({ error: 'Failed to update coffee' });
    }
});

// Delete coffee
app.delete('/coffees/:id', async (req, res) => {
    try {
        const coffeeCollection = await connectDB();
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await coffeeCollection.deleteOne(query);
        res.send(result);
    } catch (error) {
        console.error('Error deleting coffee:', error);
        res.status(500).send({ error: 'Failed to delete coffee' });
    }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`Coffee server running on port ${port}`);
    });
}

// Export for Vercel
module.exports = app;