import {expect} from 'chai';
import sinon from 'sinon';
import nock, {back} from 'nock';
import shopify from '../src';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import path from 'path';
import config from './config.json';
import {fetch} from '../src/utils';

describe("metalsmith-shopify", () => {
  
  var m, data;
  back.fixtures = __dirname + '/fixtures';

  beforeEach(() => {
    m = Metalsmith('test/fixtures')
        .use(shopify({
          shopName: 'cake-shop-32',
          apiKey: config.apiKey,
          password: config.password,
          configPath: path.resolve(__dirname, 'fixtures/shopify.json'),
          settingsDataPath: path.resolve(__dirname, 'fixtures/settings_data.json')
        }))
        .use(layouts({
          engine: 'liquid',
          directory: 'templates'
        }))
      // nock.recorder.rec();
  });

  describe('fetch', () => {
    
    // here we're testing the fetch method called with
    // the apiMock context. This context is an object that contains
    // methods/child-objects that are used as stubs with pre-programmed functionality.
    // For example the shop.get method should return a promise. When we stub our functionality,
    // we run the code through our fetch method and test if the shop.get method was called correctly,
    // meaning that we constructed the method correctly using the provided arguments, called the right methods,
    // and are building an api in such a way that we expect.
    let apiMock, shop, get;
    beforeEach(() => {
      shop = {
        get: sinon.stub().returns(Promise.resolve({
          shop: {}
        }))
      };
      apiMock = { shop };
    });

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
    
    xit("should have the shop data", (done) => {
      let file = sinon.spy();
      let endpoint = 'shop.get';
      let args = {optionA: 'a', optionB: 'b'};

      fetch.call(apiMock, endpoint, file, ...args)
        .then(() => {
          expect(file.shop).to.be.defined;
          expect(file.shop).to.be.a('object');
          done();
        });
      // m.build((err, files) => {
      //   Object.keys(files).map((file) => {
      //     let meta = files[file];
      //     expect(meta.assets).to.exist;
      //   });
      // })
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