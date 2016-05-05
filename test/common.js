import env2 from 'env2';
import nock from 'nock';
import {
  loadShopify
} from '../src/utils';

let config = env2('./config.json');

const shopName = 'cake-shop-32';
const apiKey = process.env.SHOPIFY_KEY;
const password = process.env.SHOPIFY_PASSWORD;

const api = loadShopify({
  shopName,
  apiKey,
  password
});

const scope = nock(`https://${shopName}.myshopify.com`);

export default {
  api,
  scope
};