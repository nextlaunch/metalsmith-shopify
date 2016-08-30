/**
 * Create and Assign Filters to Metalsmith Metadata
 * @param  {object} config
 * @param  {object} metalsmith
 */
export function assignFilters(config, metalsmith) {
  
  const filters = {};
  
  filters.t = function (str) {
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
  }
  
  filters.asset_url = function (str) {
    return `//cdn.shopify.com/s/files/1/0354/1849/t/2/assets/${str}`;
  };
  
  filters.asset_img_url = function (str, size) {
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
  };
  
  filters.modulo = function (a, b) {
    return a % b;
  };

  filters.img_tag = function (str, alt) {
    console.log(str, args);
    return `<img src="${str}" alt="alternate text" class="${args}" />`;
  };

  // assign filters for metalsmith-layouts
  let meta = metalsmith.metadata();
  meta.filters = filters;

  return filters;

};
