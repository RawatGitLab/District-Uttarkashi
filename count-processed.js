import { MongoClient } from "mongodb";
import proj4 from "proj4";

const UTM_44N = "+proj=utm +zone=44 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const INDIA_LCC_CUSTOM = "+proj=lcc +lat_1=12.472944444 +lat_2=35.147111111 +lat_0=3.98 +lon_0=80 +x_0=4000000 +y_0=1748300 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const WGS_84 = "+proj=longlat +datum=WGS84 +no_defs";

const utmConverter = proj4(UTM_44N, WGS_84);
const lccConverter = proj4(INDIA_LCC_CUSTOM, WGS_84);

function projectCoordinates(coordinates) {
  if (!Array.isArray(coordinates)) {
    return coordinates;
  }
  
  if ((coordinates.length === 2 || coordinates.length === 3) && typeof coordinates[0] === "number" && typeof coordinates[1] === "number") {
    const x = coordinates[0];
    const y = coordinates[1];
    
    if (!isFinite(x) || !isFinite(y) || Math.abs(x) > 1e10 || Math.abs(y) > 1e10) {
      return [78.44, 30.73];
    }
    
    if (Math.abs(x) > 1000 || Math.abs(y) > 1000) {
      try {
        let lng, lat;
        if (Math.abs(x) > 1000000) {
          [lng, lat] = lccConverter.forward([x, y]);
        } else {
          [lng, lat] = utmConverter.forward([x, y]);
        }
        
        if (isFinite(lng) && isFinite(lat)) {
          if (Math.abs(lng) > 180 || Math.abs(lat) > 90) {
            return [78.44, 30.73];
          }
          return coordinates.length === 3 ? [lng, lat, coordinates[2]] : [lng, lat];
        }
      } catch (e) {
        // ignore
      }
      return [78.44, 30.73];
    }
    return coordinates;
  }
  
  return coordinates.map(projectCoordinates);
}

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
const MONGODB_COLLECTION = process.env.MONGODB_COLLECTION;

async function run() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);
  const collection = db.collection(MONGODB_COLLECTION);
  
  const cursor = collection.find({});
  const features = [];
  const layerCounts = {};
  
  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    if (!doc) continue;
    
    let layerName = "Unassigned";
    if (Array.isArray(doc.features)) {
      layerName = doc.name || doc.Layer || doc.layer || "Unassigned";
    } else {
      layerName = doc.layer || doc.Layer || doc.properties?.layer || doc.properties?.Layer || doc.name || "Unassigned";
    }
    
    if (layerName === "Health-Ayurvedic-Centres") {
      continue;
    }
    
    if (Array.isArray(doc.features)) {
      for (let j = 0; j < doc.features.length; j++) {
        const feat = doc.features[j];
        const projectedGeom = feat.geometry ? {
          ...feat.geometry,
          coordinates: projectCoordinates(feat.geometry.coordinates)
        } : null;
        
        features.push({
          id: feat.id || `${doc._id.toString()}-${j}`,
          type: "Feature",
          geometry: projectedGeom,
          properties: {
            ...feat.properties,
            layer: layerName
          }
        });
        layerCounts[layerName] = (layerCounts[layerName] || 0) + 1;
      }
    } else if (doc.type === "Feature" || (doc.geometry && doc.properties)) {
      const projectedGeom = doc.geometry ? {
        ...doc.geometry,
        coordinates: projectCoordinates(doc.geometry.coordinates)
      } : null;

      features.push({
        id: doc._id.toString(),
        type: "Feature",
        geometry: projectedGeom,
        properties: {
          ...doc.properties,
          layer: layerName
        }
      });
      layerCounts[layerName] = (layerCounts[layerName] || 0) + 1;
    }
  }
  
  console.log("Total extracted features count:", features.length);
  console.log("Layer counts:", layerCounts);
  await client.close();
}
run();
