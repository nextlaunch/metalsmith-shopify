import nock from 'nock';

const shopName = 'cake-shop-32';

const scope = nock(`https://${shopName}.myshopify.com`);

export default {
  scope
};