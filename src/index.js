import Metalsmith from 'metalsmith';
import Shopify from 'shopify-api-node';
import axios from 'axios';
import _ from 'lodash';
import q from 'q';
import path from 'path';
import fs from 'fs';

export default function (options) {

  return function (files, metalsmith, done) {
    var data = {};
    var promises = []; // and they still feel all so wasted on myself..

    const shopifyConfig = JSON.parse(fs.readFileSync(options.configPath, {encoding: 'utf8'}));
    const api = loadShopify(options);
    const shopFields = {
      fields: 'id, name, email, domain, city, address1, zip, phone, country'
    };

    Object.keys(files).forEach((filename) => {
      var file = files[filename];
      var dfd = q.defer();
      
      file = loadShopifyConfig(shopifyConfig, file);

      if (file.shopify) {
        // make a promise
        promises.push(dfd.promise);
      }

      api.shop.get(shopFields)
        .then(shop => {
          file.shop = shop
        })
        .then(() => {
          api.page.list()
            .then(page => {
              file.pages = page;
              dfd.resolve();
            });
        })
      
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
    });

    q.allSettled(promises).then((results) => {
      done();
    });
  }
}

function loadShopifyConfig(config, file) {
  for (let c in config) {
    file[c] = config[c];
  }
  return file;
}

/**
 * Fetch
 * @param  {string} url
 * @return {object} a promise
 */
function fetch(url) {
  var d = q.defer();

  axios.get(url).then((res) => {
    if (res.data) {
      d.resolve(res.data);
    } else {
      d.reject(null);
    }
  });

  return d.promise;
}

function loadShopify(options, config) {
  return new Shopify(options.shopName, options.apiKey, options.password);
}

