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
      nock.recorder.rec();
  });

  it('should create the correct fetch method', (done) => {
    let mock = { shop: {get: (...args) => true } };
    let api = sinon.mock(mock.shop);
    let file = sinon.spy();
    let endpoint = 'shop.get';
    let args = {optionA: 'a', optionB: 'b'};
    
    api.expects(endpoint).withArgs(...args);
    
    fetch.call(api, endpoint, file, ...args)
      .then(() => {
        api.verify();
        // expect(api.shop.get.called).to.be.true;
        // expect(api.shop.get.calledWith(...args));
        expect(file.shop).to.be.defined;
        expect(file.shop).to.be.a('object');
        done();
      });
  });
  
  xit("should have the asset data", (done) => {
    m.build((err, files) => {
      Object.keys(files).map((file) => {
        let meta = files[file];
        expect(meta.assets).to.exist;
      });
      done();
    })
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