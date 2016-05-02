import Shopify from 'shopify-api-node';

export function loadShopify(options) {
  return new Shopify(options.shopName, options.apiKey, options.password);
}

export function fetch(endpoint, file, args) {
  if (!args) args = {};
  let path = endpoint.split('.');
  let resource = path[0];
  let method = path[1];
  return this[resource][method](...args)
    .then(resource => {
      return file[resource] = resource;
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