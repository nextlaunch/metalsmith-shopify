import {expect} from 'chai';
import sinon from 'sinon';
import shopify from '../src';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import path from 'path';
import env2 from 'env2';
import dataConfig from '../src/data-config';
import fs from 'fs';
import {
  fetch,
  fetchList,
  loadShopify,
  shopifyCallList
} from '../src/utils';

let config = env2('./config.json');

describe("metalsmith-shopify", () => {
    
  var m, data;
  const shopName = 'cake-shop-32';
  const apiKey = process.env.SHOPIFY_KEY;
  const password = process.env.SHOPIFY_PASSWORD;

  const options = {
    shopName,
    apiKey,
    password
  };

  const api = loadShopify(options);

  // here we're testing the fetch method called with
  // the apiMock context. This context is an object that contains
  // methods/child-objects that are used as stubs with pre-programmed functionality.
  // For example the shop.get method should return a promise. When we stub our functionality,
  // we run the code through our fetch method and test if the shop.get method was called correctly,
  // meaning that we constructed the method correctly using the provided arguments, called the right methods,
  // and are building an api in such a way that we expect.
  let apiMock, shop, blog, product, page, article, asset, theme;
  let themeId = '2342340';
  let blogId = 3939025;
  let customerId = '2342340';

  before(() => {
    try {
      fs.unlinkSync('shopify_data.json');
    } catch (e) {}
  });

  beforeEach(() => {
    shop = {
      get: sinon.stub(api.shop, 'get').returns(Promise.resolve({shop: {}}))
    }
    blog = {
      list: sinon.stub().returns(Promise.resolve([
        { id: '23408234' }, 
        { id: '20421134' }
      ]))
    }
    product = {
      list: sinon.stub().returns(Promise.resolve([
        { id: '23408234' }, 
        { id: '20421134' }
      ]))
    }
    page = {
      list: sinon.stub().returns(Promise.resolve([
        { id: '23408234' }, 
        { id: '20421134' }
      ])) 
    }
    article = {
      list: sinon.stub().returns(Promise.resolve([
          { id: '23408234' }, 
          { id: '20421134' }
        ])) 
    }
    asset = {
      list: sinon.stub(api.asset, 'list')
        .withArgs(themeId)
        .returns(Promise.resolve([
          { id: '23408234' }, 
          { id: '20421134' }
        ]))
    }
    theme = {
      list: sinon.stub(api.theme, 'list')
        .returns(Promise.resolve([
          { id: '23408234' }, 
          { id: '20421134' }
        ]))
    }
    apiMock = {
      shop,
      blog,
      product,
      page,
      article,
      asset,
      theme
    };

    m = Metalsmith('test/fixtures')
        .use(shopify({
          api: apiMock,
          configPath: path.resolve(__dirname, 'fixtures/shopify.json'),
          settingsDataPath: path.resolve(__dirname, 'fixtures/settings_data.json'),
          themeId
        }))
        .use(layouts({
          engine: 'liquid',
          directory: 'templates'
        }))
  });

  afterEach(() => {
    api.shop.get.restore();
    api.asset.list.restore();
    api.theme.list.restore();
  })

  describe('fetch methods', () => {

    let conf;
    beforeEach(() => {
      conf = dataConfig({
        blogId,
        customerId,
        themeId
      });
    })

    xit('should create the correct fetch method', (done) => {
      let file = sinon.spy();
      let endpoint = 'shop.get';
      let args = {optionA: 'a', optionB: 'b'};

      fetch.call(apiMock, endpoint, file, ...args)
        .then((data) => {
          expect(shop.get.called).to.be.true;
          expect(shop.get.calledWith(...args)).to.be.true;
          expect(data.shop).to.be.defined;
          done();
        });
    });

    xit('should create the correct fetchList method', (done) => {
      let file = sinon.spy();
      let resource = 'blog';
      let args = {optionA: 'a', optionB: 'b'};

      fetchList.call(apiMock, resource, file, ...args)
        .then((data) => {
          expect(blog.list.called).to.be.true;
          expect(blog.list.calledWith(...args)).to.be.true;
          expect(file.shopify.blog).to.be.an('array');
          done();
        });
    });

    it('should create correct call list', (done) => {
      let calls = shopifyCallList(api, conf);
      let numResources = Object.keys(conf).length;
      expect(calls).to.be.an('array');
      expect(calls.length).to.equal(numResources);
      done();
    });

  });

  const checkDataObject = (resource, done) => {
    return (err, files) => {
      expect(err).to.equal(null);
      let resources = m.metadata().shopify_data;
      expect(resources[resource]).to.be.ok;
      done();
    }
  };

  describe('data from api', () => {

    it('should add shopify object to global metadata', (done) => {
      m.build((err, files) => {
        expect(m.metadata().shopify_data).to.be.ok;
        done();
      });
    });

    it("should have shop data", (done) => {
      m.build(checkDataObject('shop', done));
    });

    it('should have blog data', (done) => {
      m.build(checkDataObject('blog', done));
    });

    it('should have product data', (done) => {
      m.build(checkDataObject('product', done));
    });

    it('should have page data', (done) => {
      m.build(checkDataObject('page', done));
    });

    it('should have article data', (done) => {
      m.build(checkDataObject('article', done));
    });

    it('should have asset data', (done) => {
      m.build(checkDataObject('asset', done));
    });

    it('should have theme data', (done) => {
      m.build(checkDataObject('theme', done));
    });

  });

  xdescribe('with caching', () => {

    it('should not fetch twice', (done) => {
      let deleted = fs.unlinkSync('shopify_data.json');

      m.build((err, files) => {
        expect(api.shop.get.called).to.be.true;
        expect(api.shop.get.returnValues[0]).to.equal(true);
        expect(m.metadata().shopify_data).to.be.defined;
        
        m.build((err, files) => {
          expect(api.shop.get.returnValues[0]).to.equal(false);
          expect(m.metadata().shopify_data).to.be.defined;
          done();
        });

      });
    });

  });

  xdescribe('with caching disabled', () => {
    
    let m;   
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