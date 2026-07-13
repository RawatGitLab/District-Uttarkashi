import proj4 from "proj4";

const UTM_44N = "+proj=utm +zone=44 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const INDIA_LCC_CUSTOM = "+proj=lcc +lat_1=12.472944444 +lat_2=35.147111111 +lat_0=3.98 +lon_0=80 +x_0=4000000 +y_0=1748300 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
const WGS_84 = "+proj=longlat +datum=WGS84 +no_defs";

const utmConverter = proj4(UTM_44N, WGS_84);
const lccConverter = proj4(INDIA_LCC_CUSTOM, WGS_84);

// Test coordinate from Block_Boundary:
const rawUTM = [233961.63979123317, 3401338.8726292704];

try {
  const result1 = utmConverter.forward(rawUTM);
  console.log("UTM Forward projection:", result1);
} catch (e) {
  console.error("UTM Forward error:", e);
}

try {
  const result2 = utmConverter.inverse(rawUTM);
  console.log("UTM Inverse projection:", result2);
} catch (e) {
  console.error("UTM Inverse error:", e);
}
