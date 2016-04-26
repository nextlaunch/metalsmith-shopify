import {expect} from 'chai';
import nock, {back} from 'nock';
import shopify from '../src';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import path from 'path';

describe("metalsmith-shopify", () => {
  
  var m, data;
  back.fixtures = __dirname + '/fixtures';

  beforeEach(() => {
    // back('assets.json', (done) => {
    //   done();
    // });
    // nock('https://test.firebaseio.com')
    //   .get('/home/.json').reply(200, {
    //     title: 'Home Page'
    //   });
    // nock('https://test.firebaseio.com')
    //   .get('/some/namespace/.json').reply(200, {
    //     title: 'Some Namespace'
    //   });

    m = Metalsmith('test/fixtures')
        .use(shopify({
          shopName: 'cake-shop-32',
          apiKey: config.apiKey,
          password: config.password,
          configPath: path.resolve(__dirname, 'fixtures/shopify.json')
        }))
        .use(layouts({
          engine: 'liquid',
          directory: 'templates'
        }))
  });
  
  it("should have the asset data", (done) => {
    m.build((err, files) => {
      Object.keys(files).map((file) => {
        let meta = files[file];
        console.log(meta);
        // expect(meta.assets).to.equal();
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