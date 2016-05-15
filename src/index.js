import Metalsmith from 'metalsmith';
import _ from 'lodash';
import q from 'q';
import path from 'path';
import fs from 'fs';
import changeCase from 'change-case';
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
      if (!config.localePath) {
        throw new Error('did not specify options.localePath');
      }
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
        // reduce the translations to find the correct object
        return str.split('.').reduce((memo, item, i) => {
          return memo = memo[item];
        }, obj);
      }
    },
    asset_url: function (str) {
      return `//cdn.shopify.com/s/files/1/0354/1849/t/2/assets/${str}`;
    },
    asset_img_url: function (str, size) {
      let parts;
      let asset_url;
      if (str.indexOf('.')) {
        parts = str.split('.');
        let asset_name = parts[0];
        let ext = parts[1];
        let asset = [asset_name, size].join('_');
        asset_url = [asset, ext].join('.');
      }
      return `//cdn.shopify.com/s/files/1/0354/1849/t/2/assets/${asset_url}`;
    },
    modulo: function (a, b) {
      return a % b;
    },
    img_tag: function (str, alt) {
      console.log(str, args);
      return `<img src="${str}" alt="alternate text" class="${args}" />`;
    }
  };

  // assign filters for metalsmith-layouts
  let meta = metalsmith.metadata();
  meta.filters = filters;

  return filters;
};

// Metalsmith plugin
export function shopify(options) {

  return function (files, metalsmith, next) {

    // const shopifyConfig = JSON.parse(fs.readFileSync(options.configPath, {encoding: 'utf8'}));
    // const settingsData = JSON.parse(fs.readFileSync(options.settingsDataPath, {encoding: 'utf8'}));
    let cache = options.cache;
    const blogId = options.blogId;
    const themeId = options.themeId;
    const customerId = options.customerId;
    // configure the api for Shopify
    const api = loadShopify({
      shopName: options.shopName,
      apiKey: options.apiKey,
      password: options.password
    });
    // get the endpoints for the api calls
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
    assignFilters(localeConfig, metalsmith);

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
      switch(keys[i]) {
        case 'collect':
          memo['collections'] = val[0];
          memo[keys[i]] = val[1];
          break;
        default:
          memo[keys[i]] = val;
      }
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
      cb();
    }
  );
}


export function createObjects() {
  return function (files, m, next) {
    try {
      let data = m.metadata().shopify_data;
      for (let k in data) {
        switch(k) {
          case 'customCollection':
            let withHandles = data[k].reduce((memo, obj) => {
              memo[obj.handle] = obj;
              return memo;
            }, {});
            m.metadata()['collections'] = withHandles;
          default:
            let snaked = changeCase.snakeCase(k);
            m.metadata()[snaked] = data[k];
        }
      }
      next();
    } catch(e) {
      throw new Error('shopify_data not found');
      next();
    }
  }
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