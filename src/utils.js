import Shopify from 'shopify-api-node';
import q from 'q';
import _ from 'lodash';

export function loadShopify(options) {
  return new Shopify(options.shopName, options.apiKey, options.password);
}

export function fetch(endpoint, file, args) {
  if (!args) args = {};
  let path = endpoint.split('.');
  let resource = path[0];
  let method = path[1];
  let shopify = file['shopify'] = {};
  // identify the resource (shop), method (get)
  // and pass additional options. Return the file.
  return this[resource][method](...args)
    .then(data => {
      return shopify[resource] = data;
    });
}

export function fetchList(resource, file, args) {
  if (!args) args = {};
  return this[resource].list(...args)
    .then((data) => {
      if (!file.shopify) {
        file.shopify = {};
      }
      return file.shopify[resource] = data;
    });
}

export function shopifyCallList(api, endpoints) {
  let calls = [];
  let collections = [];
  let index = 0;
  for (const resource in endpoints) {
    let { method, params } = endpoints[resource];
    if (resource === 'collect') {
      calls.push(
        loadCollections(api, resource, method, params)
      )
    } else {
      calls.push(
        api[resource][method](...params)
      );
    }
  }
  return calls;
}

function loadCollections(api, resource, method, params) {
  let defer = q.defer();
  let collect = {};
  // for all collects
  // group data by similar collections, products
  // fetch each collection
  // fetch each product from collection
  // with all products in a collection gathered, map collection + product data to a
  // collections object indexed by handle
  // each collection should have a products object with all products added
  // fetch all collects
  api[resource][method](...params)
    .then(resp => {
      collect = resp;
      // group data by similar collections, products
      let collections = _.chain(resp)
        .groupBy('collection_id')
        .map((item, key) => {
          // fetch each collection
          return api['customCollection'].get(key)
              .then(collection => collection)
        })
        .value();

      let products = collections.map(item => {
        // open the collection
          return item.then(data => {
            // fetch each product from collection
            return api['product'].list({collection_id: data.id})
              .then(products => {
                // create a products object by collection handle
                let obj = {
                  [data.id]: products
                }
                return obj;
              });
          });
      });

      let collectionsObject = collections.concat(products);
      q.all(collectionsObject)
        .then((collections) => {
          let c = _.omit(_.keyBy(collections, 'id'), 'undefined');
          collections = collections.reduce((memo, item) => {
            if (Object.keys(item).length === 1) {
              memo.push(item);
            }
            return memo;
          }, []);
          let merged = collections.reduce((memo, obj) => {
            // products by collection
              // collection handle key
              let key = Object.keys(obj)[0];
              // get products
              let products = obj[key];
              // get collection
              let collectionData = c[key];
              // assign new collection object with product, collection data
              memo[key] = {
                products,
                ...collectionData
              }
              return memo;
          }, {});
          defer.resolve([merged, collect]);
        })
    })
    return defer.promise;
}