import Metalsmith from 'metalsmith';
import _ from 'lodash';
import q from 'q';
import path from 'path';
import fs from 'fs';
import {
  loadShopify,
  shopifyCallList
} from './utils';
import dataConfig from './data-config';

export default function (options) {

  return function (files, metalsmith, next) {

    // const shopifyConfig = JSON.parse(fs.readFileSync(options.configPath, {encoding: 'utf8'}));
    // const settingsData = JSON.parse(fs.readFileSync(options.settingsDataPath, {encoding: 'utf8'}));
    let cache = options.cache;
    const blogId = options.blogId;
    const themeId = options.themeId;
    const customerId = options.customerId;
    const api = loadShopify({
      shopName: options.shopName,
      apiKey: options.apiKey,
      password: options.password
    });
    const endpoints = dataConfig({
      blogId,
      customerId,
      themeId
    });

    if (typeof cache === 'undefined') {
      cache = true;
    }

    try {
      // if we're actively caching this item,
      // try to read it from the file and assign it
      // to our metadata, otherwise, throw a cache disabled error
      if (cache) {
        const store = fs.readFileSync('shopify_data.json', 'utf-8');
        assignMetadata(metalsmith, JSON.parse(store), endpoints);
        next();
        return;
      } else {
        throw new Error('disabled cache');
      }
    } catch (e) {
      // call all Shopify endpoints as promises
      // and when they all have resolved:
      // - assign the metadata
      // - write a cache store
      const calls = shopifyCallList(api, endpoints);
      q.all(calls)
        .then((d) => {
          assignMetadata(metalsmith, d, endpoints);
          writeStore(metalsmith.metadata().shopify_data, next);
        })
        .catch(err => {
          console.log(err);
        })
    }

  }

}

function assignMetadata(metalsmith, data, endpoints) {
  let meta = metalsmith.metadata();
  let keys = Object.keys(endpoints);
  meta.shopify_data = data.reduce((memo, val, i) => {
    let resource = {};
    memo[keys[i]] = val;
    return memo;
  }, {});
  return meta;
}

function writeStore(data, cb) {
  fs.writeFile(
    'shopify_data.json',
    JSON.stringify(data), 
    (err) => {
      if (err) throw err;
      cb(null);
    }
  );
}

// function assignFiles(files) {
//   files.forEach((filename) => {
//     var file = files[filename];
//     var dfd = q.defer();
      
//     // file = Object.assign(
//     //   file,
//     //   shopifyConfig,
//     //   {settings: settingsData.current}
//     // );

//     // file.content_for_layout = file.contents;


//   });
// }