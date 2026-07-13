import { MongoClient } from "mongodb";

const MONGODB_URI = "mongodb+srv://varunrawatmailbox2507_db_user:GYVPiF8LG4HIbsSF@cluster0.8xfepsq.mongodb.net/?appName=Cluster0";
const MONGODB_DB = "Shapefile";
const MONGODB_COLLECTION = "Uttarkashi";

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const collection = db.collection(MONGODB_COLLECTION);
  
  const docs = await collection.find({}).limit(5).toArray();
  
  docs.forEach((doc) => {
    const layerName = doc.name || doc.Layer || doc.layer || "Unassigned";
    console.log(`\nLayer: "${layerName}"`);
    
    if (Array.isArray(doc.features)) {
      console.log(`Has features list: ${doc.features.length}`);
      if (doc.features.length > 0) {
        const feat = doc.features[0];
        console.log("Feature properties:", feat.properties);
        console.log("Feature geom type:", feat.geometry?.type);
        console.log("Raw Coord sample:", JSON.stringify(feat.geometry?.coordinates?.slice(0, 3)));
      }
    } else {
      console.log("Direct doc geom type:", doc.geometry?.type);
      console.log("Direct doc raw Coord sample:", JSON.stringify(doc.geometry?.coordinates?.slice(0, 3)));
    }
  });
  
  await client.close();
}
run();
