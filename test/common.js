import nock from 'nock';
import * as data from './data';
import env2 from 'env2';

try {
let config = env2('./config.json');
} catch(e) {}

export const shopName = 'cake-shop-32';
export const apiKey = process.env.SHOPIFY_KEY;
export const password = process.env.SHOPIFY_PASSWORD;

export const scope = nock(`https://${shopName}.myshopify.com`);

export function mockReq(scope) {
  scope
    .get('/admin/shop.json?fields=id%2C%20name%2C%20email%2C%20domain%2C%20city%2C%20address1%2C%20zip%2C%20phone%2C%20country')
    .reply(200, data.shop.res.get)
    .get('/admin/blogs.json')
    .reply(200, data.blog.res.list)
    .get('/admin/blogs/241253187/articles.json')
    .reply(200, data.article.res.list)
    .get('/admin/products.json')
    .reply(200, data.product.res.list)
    .get('/admin/pages.json')
    .reply(200, data.page.res.list)
    .get('/admin/themes/828155753/assets.json')
    .reply(200, data.asset.res.list)
    .get('/admin/themes.json')
    .reply(200, data.theme.res.list)
    .get('/admin/policies.json')
    .reply(200, data.policy.res.list)
    .get('/admin/script_tags.json')
    .reply(200, data.script_tag.res.list)
    .get('/admin/checkouts.json')
    .reply(200, data.checkout.res.list)
    .get('/admin/collects.json')
    .reply(200, data.collect.res.list)
    .get('/admin/comments.json')
    .reply(200, data.comment.res.list)
    .get('/admin/countries.json')
    .reply(200, data.country.res.list)
    .get('/admin/customers.json')
    .reply(200, data.customer.res.list)
    .get('/admin/customers/207119551/addresses.json')
    .reply(200, data.customerAddress.res.list)
    .get('/admin/events.json')
    .reply(200, data.event.res.list)
    .get('/admin/metafields.json')
    .reply(200, data.metafield.res.list)
    .get('/admin/orders.json')
    .reply(200, data.order.res.list)
    .get('/admin/custom_collections.json')
    .reply(200, data.customCollection.res.list)
    // .get('/admin/custom_collections.json')
    // .reply(200, data.customCollection.res.get)
    // .get('/admin/custom_collections/395646240.json')
    // .reply(200)
    // .get('/admin/custom_collections/691652237.json')
    // .reply(200)
}