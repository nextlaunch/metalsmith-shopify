import Shopify from 'shopify-api-node';
import q from 'q';
import prompt from 'prompt-for';

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
  let index = 0;
  for (const resource in endpoints) {
    let { method, params } = endpoints[resource];
    calls.push(
      api[resource][method](...params)
    )
  }

  return calls;
}