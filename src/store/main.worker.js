const CACHE_STORE = 'ROCKET_MAPBOX_CACHESTORE';
const URL_SEED = 'http://localhost:7071/api/seed';
const URL_PROGRESSIVE = 'http://localhost:7071/api/progressive';

let seedData = [];
let arrays = [];

async function build (){
    
    const properties = Object.keys(arrays);

    const features = seedData.map((item, index) => {
        item.type = 'Feature',
        item.geometry = {
            type: 'Point',
            coordinates: item.coordinates
        };
        properties.forEach(prop => {
            item.properties[prop] = array[prop][index];
        })
        return item;
    })

    const featureCollection = {
        type: 'FeatureCollection',
        features,
    };

    const blob = new Blob([JSON.stringify(featureCollection)],{ type: 'application/geo+json'});
    const blobUrl = URL.createObjectURL(blob);

    self.postMessage({ method: 'update', blobUrl});
}

async function seed(){
    const cache = await caches.open(cacheStore);
    seedData = await cache.match(URL_SEED).then(r => r.json());
    await build()
}

async function add(propname){
    const cache = await caches.open(cacheStore);
    arrays[propname] = await cache.match(`${URL_PROGRESSIVE}/${propname}`).then(r => r.json());
    await build()
}

self.onmessage = async(message) => {
    switch (message.data.method){
        case 'seed':
            await seed();
            break;
        case 'add':
            await add(message.data.propname);
            break;
        default:
            break;
    }
}