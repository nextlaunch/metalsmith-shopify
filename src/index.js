import Metalsmith from 'metalsmith';
import axios from 'axios';
import _ from 'lodash';
import q from 'q';
import path from 'path';
import fs from 'fs';
import {
  fetch,
  loadShopify
} from './utils';

export default function (options) {

  return function (files, metalsmith, done) {
    var data = {};
    var promises = []; // and they still feel all so wasted on myself..

    const shopifyConfig = JSON.parse(fs.readFileSync(options.configPath, {encoding: 'utf8'}));
    const settingsData = JSON.parse(fs.readFileSync(options.settingsDataPath, {encoding: 'utf8'}));
    const api = loadShopify(options);
    const shopFields = {
      fields: 'id, name, email, domain, city, address1, zip, phone, country'
    };

    Object.keys(files).forEach((filename) => {
      var file = files[filename];
      var dfd = q.defer();
        
      file = Object.assign(
        file,
        shopifyConfig,
        {settings: settingsData.current}
      );

      file.content_for_layout = file.contents;

      if (file.shopify) {
        // make a promise
        promises.push(dfd.promise);
      }

      // Load Shopify API Data
      fetch.call(api, 'shop.get', file)
        .then(fetch.call(api, 'pages', file))
        .then(() => {
          dfd.resolve(file);
        })
    });

    q.allSettled(promises).then((results) => {
      done();
    });
  }
}

// /**
//  * Fetch
//  * @param  {string} url
//  * @return {object} a promise
//  */
// function fetch(url) {
//   var d = q.defer();

//   axios.get(url).then((res) => {
//     if (res.data) {
//       d.resolve(res.data);
//     } else {
//       d.reject(null);
//     }
//   });

//   return d.promise;
// }

