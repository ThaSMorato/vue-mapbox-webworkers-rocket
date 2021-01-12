
async function addCacheIfNotExists(cacheStore, key) {
    const cache = await caches.open(cacheStore);
    const keys = await cache.keys();
    if(!keys.includes(key)){
      await cache.add(key)
    }
  
}

self.onmessage = async (message) => {
    const {cacheStore, key} = message.data;
    await addCacheIfNotExists(cacheStore, key);
    self.postMessage('ok');
};

