import Metalsmith from 'metalsmith';
import _ from 'lodash';
import q from 'q';
import path from 'path';
import fs from 'fs';
import {
  shopifyCallList
} from './utils';
import dataConfig from './data-config';

export default function (options) {

  return function (files, metalsmith, next) {

    const shopifyConfig = JSON.parse(fs.readFileSync(options.configPath, {encoding: 'utf8'}));
    const settingsData = JSON.parse(fs.readFileSync(options.settingsDataPath, {encoding: 'utf8'}));
    const api = options.api;
    let cache = options.cache;
    const blogId = options.blogId;
    const themeId = options.themeId;
    const customerId = options.customerId;
    const endpoints = dataConfig({
      blogId,
      customerId,
      themeId
    });

    if (typeof cache === 'undefined') {
      cache = true;
    }

    try {
      if (cache) {
        const store = fs.readFileSync('shopify_data.json', 'utf-8');
        assignData(metalsmith, JSON.parse(store), endpoints);
        next();
      } else {
        throw new Error('disabled cache');
      }
    } catch (e) {
      const calls = shopifyCallList(api, endpoints);
      q.all(calls)
        .then((d) => {
          assignData(metalsmith, d, endpoints);
          writeStore(metalsmith.metadata().shopify_data, next);
        })
        .catch(err => {
          console.log(err);
        })
    }

    // let filenames = Object.keys(files);

  }
}

function assignData(metalsmith, data, endpoints) {
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