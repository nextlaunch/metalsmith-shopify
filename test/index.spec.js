import {expect} from 'chai';
import sinon from 'sinon';
import shopify from '../src';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import path from 'path';
import dataConfig from '../src/data-config';
import fs from 'fs';
import env2 from 'env2';
import common from './common';
import * as data from './data';
import {
  loadShopify,
  shopifyCallList
} from '../src/utils';

describe("metalsmith-shopify", () => {
  
  try {
    let config = env2('./config.json');
  } catch(e) {}
  const shopName = 'cake-shop-32';
  const apiKey = process.env.SHOPIFY_KEY;
  const password = process.env.SHOPIFY_PASSWORD;

  const api = loadShopify({
    shopName,
    apiKey,
    password
  });
  let m, apiMock, conf;
  let themeId = 828155753;
  let blogId = 241253187;
  let customerId = 207119551;

  before(() => {
    // remove any cache json files
    try {
      fs.unlinkSync('shopify_data.json');
    } catch (e) {}

    conf = dataConfig({
      blogId,
      customerId,
      themeId
    });

  });

  beforeEach(() => {
    // set up a new build
    m = Metalsmith('test/fixtures')
        .use(shopify({
          shopName,
          apiKey,
          password,
          settingsDataPath: path.resolve(__dirname, 'fixtures/settings_data.json'),
          themeId,
          blogId,
          customerId
        }))
        .use(layouts({
          engine: 'liquid',
          directory: 'templates'
        }))
  });

  it('should create correct call list', (done) => {
    let calls = shopifyCallList(api, conf);
    let numResources = Object.keys(conf).length;
    expect(calls).to.be.an('array');
    expect(calls.length).to.equal(numResources);
    done();
  });

  const checkDataObject = (resource, output, done) => {
    return (err, files) => {
      expect(err).to.equal(null);
      let resources = m.metadata().shopify_data;
      expect(resources[resource]).to.be.ok;
      expect(resources[resource]).to.deep.equal(output);
      done();
    }
  };

  describe('data from api', () => {
    
    let scope = common.scope;

    afterEach(() => expect(scope.isDone()).to.be.true);

    it('should add shopify object to global metadata', (done) => {
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

      m.build((err, files) => {
        expect(m.metadata().shopify_data).to.be.ok;
        done();
      });
    });

  });

  xdescribe('with caching disabled', () => {
    
    let m, api = common.api;
    beforeEach(() => {

      sinon.stub(api.shop, 'get').returns(Promise.resolve([
        { id: 'asdfasdf' }
      ]));

     m = Metalsmith('test/fixtures')
        .use(shopify({
          api,
          configPath: path.resolve(__dirname, 'fixtures/shopify.json'),
          settingsDataPath: path.resolve(__dirname, 'fixtures/settings_data.json'),
          themeId,
          cache: false
        }))
        .use(layouts({
          engine: 'liquid',
          directory: 'templates'
        })) 
    })

    afterEach(() => {
      api.shop.get.restore();
    })

    it('should get fresh data', (done) => {
      fs.unlinkSync('shopify_data.json');

      m.build((err, files) => {
        expect(api.shop.get.called).to.be.true;
        expect(api.shop.get.callCount).to.equal(1);
        expect(m.metadata().shopify_data).to.be.defined;
        
        m.build((err, files) => {
          expect(api.shop.get.callCount).to.equal(2);
          expect(m.metadata().shopify_data).to.be.defined;
          fs.unlinkSync('shopify_data.json');
          done();
        });

      });
    });

  });

  // it("should load json data into file", (done) => {
  //   m.build((err, files) => {
  //     Object.keys(files).map((file) => {
  //       let meta = files[file];
  //       expect(meta.firebase_data).to.be.a('object');
  //     });
  //     done();
  //   });
  // });

});