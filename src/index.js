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

export const tags = {};

export function assignFilters(config, metalsmith) {
  
  // create some filters for Shopify
  let filters = {
    t: function (str) {
      let locale = config.locale;
      let translationPath = path.join(config.localePath, `${config.locale}.json`);
      let translations = fs.readFileSync(translationPath, 'utf-8');
      let allTranslationsData = JSON.parse(translations);
      let obj;
      if (Array.isArray(allTranslationsData)) {
        obj = allTranslationsData[0];
      } else {
        obj = allTranslationsData;
      }

      if (str.indexOf('.') > 0) {
        return str.split('.').reduce((memo, item, i) => {
          return memo = memo[item];
        }, obj);
      }
    }
  };

  // assign filters for metalsmith-layouts
  let meta = metalsmith.metadata();
  meta.filters = filters;

  return filters;
};

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

    let localeConfig = {
      locale: 'en.default',
      localePath: options.localePath
    };
    // assignFilters(config, metalsmith);

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
        });
    }

  }

}

function assignMetadata(metalsmith, data, endpoints) {
  let meta = metalsmith.metadata();
  let keys = Object.keys(endpoints);
  if (!Array.isArray(data)) {
    for (const k in data) {
      if (!meta.shopify_data) meta.shopify_data = {};
      meta.shopify_data[k] = data[k];
    }
  } else {
    meta.shopify_data = data.reduce((memo, val, i) => {
      let resource = {};
      memo[keys[i]] = val;
      return memo;
    }, {});
  }
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