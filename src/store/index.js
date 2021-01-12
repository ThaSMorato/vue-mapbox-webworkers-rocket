import Vue from 'vue'
import Vuex from 'vuex'

const CACHE_STORE = 'ROCKET_MAPBOX_CACHESTORE';
const URL_SEED = 'http://localhost:7071/api/seed';
const URL_PROGRESSIVE = 'http://localhost:7071/api/progressive';

Vue.use(Vuex)

async function addCacheIfNotExists(cacheStore, key) {
  
  const worker = new Worker('./cache.worker.js', {type: 'module'});

  return new Promise((resolve, reject) => {
    worker.onmessage = (message) => {
      if(message.data === 'ok')  resolve()
    }

    worker.postMessage({cacheStore, key})
  });

}

const worker = new Worker('./main.worker.js', {type: 'module'});

const store = new Vuex.Store({
  state: {
    sourceBlobUrl : '',
    properties: [],
  },
  mutations: {
    addProp(state, propname){
      if(!state.properties.includes(propname)){
        state.properties.push(propname);
      }
    },
    blobUrl(state, url){
      state.sourceBlobUrl = url;
    }
  },
  actions: {
    async setUpSeed(){
      await addCacheIfNotExists(CACHE_STORE, URL_SEED);
      worker.postMessage( { method: 'seed' } );
    },
    async addProgressiveProperty({commit}, propname){
      const url = `${URL_PROGRESSIVE}/${propname}`;
      await addCacheIfNotExists(CACHE_STORE, url);
      worker.postMessage( { method: 'add', propname } );
      commit('addProp', propname);
    }
  }
});

worker.onmessage = async ({ data }) => {
  if(data.method == 'update'){
    store.commit('blobUrl', data.blobUrl);
  }
}

export default store;