import {expect} from 'chai';
import sinon from 'sinon';
import nock, {back} from 'nock';
import shopify from '../src';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import path from 'path';
import env2 from 'env2';
import {
  fetch,
  fetchList,
  loadShopify
} from '../src/utils';

let config = env2('./config.json');

describe("metalsmith-shopify", () => {
    
  var m, data;
  back.fixtures = __dirname + '/fixtures';
  const api = loadShopify({
    shopName: 'cake-shop-32',
    apiKey: process.env.SHOPIFY_KEY,
    password: process.env.SHOPIFY_PASSWORD,
  });

  // here we're testing the fetch method called with
  // the apiMock context. This context is an object that contains
  // methods/child-objects that are used as stubs with pre-programmed functionality.
  // For example the shop.get method should return a promise. When we stub our functionality,
  // we run the code through our fetch method and test if the shop.get method was called correctly,
  // meaning that we constructed the method correctly using the provided arguments, called the right methods,
  // and are building an api in such a way that we expect.
  let apiMock, shop, blog;

  beforeEach(() => {
    shop = {
      get: sinon.stub().returns(Promise.resolve({
        shop: {}
      }))
    }
    blog = {
      list: sinon.stub().returns(Promise.resolve([
        { id: '23408234' }, 
        { id: '20421134' }
      ]))
    }
    apiMock = {
      shop,
      blog
    };

    m = Metalsmith('test/fixtures')
        .use(shopify({
          api: apiMock,
          configPath: path.resolve(__dirname, 'fixtures/shopify.json'),
          settingsDataPath: path.resolve(__dirname, 'fixtures/settings_data.json')
        }))
        .use(layouts({
          engine: 'liquid',
          directory: 'templates'
        }))
  });

  describe('fetch', () => {
    
    it('should create the correct fetch method', (done) => {
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

    it('should create the correct fetchList method', (done) => {
      let file = sinon.spy();
      let resource = 'blog';
      let args = {optionA: 'a', optionB: 'b'};

      fetchList.call(apiMock, resource, file, args)
        .then((data) => {
          expect(blog.list.called).to.be.true;
          expect(blog.list.calledWith(args)).to.be.true;
          expect(file.shopify.blog).to.be.an('array');
          done();
        });
    });
    
    
    it("should have shop data", (done) => {

      m.build((err, files) => {
        for (const file in files) {
          expect(files[file].shopify.shop).to.be.defined;
          expect(files[file].shopify.shop).to.be.an('object');
        }
        done();
      });

    });

    it('should have blog data', (done) => {

      m.build((err, files) => {
        for (const file in files) {
          expect(files[file].shopify.blog).to.be.defined;
          expect(files[file].shopify.blog).to.be.an('array');
          expect(files[file].shopify.blog[0].id).to.equal('23408234');
        }
        done();
      });

    });

    xit('should have article data', (done) => {
      
      m.build((err, files) => {
        for (const file in files) {
          expect(files[file].shopify.article).to.be.defined;
          expect(files[file].shopify.article).to.be.an('object');
        }
        done();
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