const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { MongoClient } = require('mongodb');

const app = express();
const port = 7010;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connection URI
const uri = 'mongodb://localhost:27017';
const dbName = 'waypointsdb';

// Initialize MongoDB connection
let db;

MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(client => {
    db = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);

    // Start the server only after the DB connection is established
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}/`);
    });
  })
  .catch(error => console.error(error));

// Route to save the route information
app.post('/saveRoute', (req, res) => {
  const { origin, destination, waypoints, distance, duration } = req.body;

  // Print the input
  console.log("Origin:", origin);
  console.log("Destination:", destination);
  console.log("Waypoints:", waypoints);
  console.log("Distance:", distance);
  console.log("Duration:", duration);

  // Construct the route object
  const routeObject = {
    origin: origin || "Unknown Origin",
    destination: destination || "Unknown Destination",
    waypoints: waypoints || [],
    distance: distance || "",
    duration: duration || ""
  };

  // Insert into waypoints collection
  db.collection('waypoints').insertOne(routeObject)
    .then(result => {
      console.log('Route saved:', result);  // Log the result
      res.status(200).send({ id: result.insertedId });
    })
    .catch(error => {
      console.error('Error saving route:', error);  // Log any errors
      res.status(500).send(error.message);
    });
});

// Route to get all routes
app.get('/getRoutes', (req, res) => {
  db.collection('waypoints').find().toArray()
    .then(routes => res.status(200).json(routes))
    .catch(error => {
      console.error('Error fetching routes:', error);  // Log any errors
      res.status(500).send(error.message);
    });
});

// Root route for basic response
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
