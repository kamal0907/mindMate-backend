// fix-googleid-index.js
import mongoose from "mongoose";
import 'dotenv/config'
const MONGO = process.env.MONGO_URI || "mongodb://localhost:27017/test";

(async function run(){
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  const coll = mongoose.connection.db.collection("users");

  console.log(MONGO)

  console.log("Unsetting googleId:null...");
  await coll.updateMany({ googleId: null }, { $unset: { googleId: "" } });

  try {
    console.log("Dropping existing googleId index...");
    await coll.dropIndex("googleId_1");
  } catch(e){
    console.log("dropIndex:", e.message);
  }

  console.log("Creating partial unique index on googleId...");
  await coll.createIndex({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $type: "string" } } });

  console.log("Done.");
  await mongoose.disconnect();
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
