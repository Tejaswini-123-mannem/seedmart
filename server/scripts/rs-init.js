// rs-init.js — one-time replica set initiation (run via: mongosh --file rs-init.js)
// Binds the single node to 127.0.0.1:27017 so it matches the app's MONGO_URI.
try {
  rs.status();
  print("Replica set already initialized.");
} catch (e) {
  rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "127.0.0.1:27017" }] });
  print("Replica set initiated.");
}
