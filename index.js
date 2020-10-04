const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require('dotenv').config()

const port = 5000;



app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const admin = require("firebase-admin");

const serviceAccount = require("./configs/burj-al-arab-ced8e-firebase-adminsdk-a04o6-be6b51c66d.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `${process.env.DB_FIRE}`,
});

app.get("/", (req, res) => {
  res.send("hello Prime");
});

const MongoClient = require("mongodb").MongoClient;

const uri =
  `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.bn8ta.gcp.mongodb.net:27017,cluster0-shard-00-01.bn8ta.gcp.mongodb.net:27017,cluster0-shard-00-02.bn8ta.gcp.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-wx14y2-shard-0&authSource=admin&retryWrites=true&w=majority`;

MongoClient.connect(uri, function (err, client) {
  const bookings = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION}`);

  app.get("/bookings", (req, res) => {
    const bearer = req.headers.authorization;

    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];

      admin
        .auth()
        .verifyIdToken(idToken)
        .then(function (decodedToken) {
          let tokenEmail = decodedToken.email;
          const querEmail = req.query.email;

          if (tokenEmail === queryEmail) {
            bookings
              .find({ email: queryEmail })
              .toArray((err, documents) => {
                res.send(documents);
              });
          } else {
            res.status(401).send('unauthorized access')
          } 
        })
        .catch(function (error) {
          // Handle error
        });
    } else {
      res.status(401).send('unauthorized access')
    }
  });

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    console.log(newBooking);

    bookings.insertOne(newBooking).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  console.log("db connected");
});

app.listen(process.env.PORT || port);
