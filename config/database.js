const mongoose = require('mongoose');

const config = {
    database: 'mongodb://localhost:27017/nodekb',
    secret: 'mysecret'
}

function database() {
  // Setting Up MongoDB with Mongoose
  mongoose.connect(
    config.database,
    { useNewUrlParser: true }
  );
  const db = mongoose.connection;

  // Check DB's connections
  db.once("open", function() {
    console.log("Connected to mongodb");
  });

  // Check for DB errors
  db.on("error", function(err) {
    console.error(err);
  });

  process.on("SIGINT", function() {
    db.close(function() {
      console.log("Mongoose disconnected on app termination");
      process.exit(0);
    });
  });
}

module.exports = database();
