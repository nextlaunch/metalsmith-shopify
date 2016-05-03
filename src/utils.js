import Shopify from 'shopify-api-node';

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
  return this[resource].list(args)
    .then((data) => {
      if (!file.shopify) {
        file.shopify = {};
      }
      return file.shopify[resource] = data;
    });
}

// api.asset.list(61402885)
//   .then(assets => {
//     for (let asset of assets) {
//       if (asset.public_url) {
//         axios.get(asset.public_url)
//           .then(data => {
//             file.shopify_data = data;
//             console.log(file.shopify_data);
//             dfd.resolve(data);
//           })
//           .catch(err => {
//             console.log(err);
//           });
//       }
//     }
//   });