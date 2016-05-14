import {expect} from 'chai';
import nock from 'nock';
import sinon from 'sinon';
import {shopify, createObjects} from '../src';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import path from 'path';
import dataConfig from '../src/data-config';
import fs from 'fs';
import { 
  scope, 
  mockReq,
  shopName,
  apiKey,
  password
} from './common';
import {
  loadShopify,
  shopifyCallList
} from '../src/utils';

nock.disableNetConnect();

describe("metalsmith-shopify", () => {

  const api = loadShopify({
    shopName,
    apiKey,
    password
  });
  let apiMock, conf;
  let themeId = 828155753;
  let blogId = 241253187;
  let customerId = 207119551;
  let productId = 5492648197;

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

  it('should create correct call list', (done) => {
    let calls = shopifyCallList(api, conf);
    let numResources = Object.keys(conf).length;
    expect(calls).to.be.an('array');
    expect(calls.length).to.equal(numResources);
    done();
  });

  describe('data from api with cache', () => {

    let m;
    beforeEach(() => {
      mockReq(scope);
      
      // set up a new build
      m = Metalsmith('test/fixtures/shopify-data')
          .use(shopify({
            shopName,
            apiKey,
            password,
            settingsDataPath: path.resolve(__dirname, 'fixtures/settings_data.json'),
            themeId,
            blogId,
            customerId,
            localePath: path.resolve(__dirname, './fixtures/shopify-data/locales')
          }))
          .use(createObjects())
          .use(layouts({
            engine: 'liquid',
            directory: 'templates'
          }))
    });

    afterEach(() => {
      nock.cleanAll();
    });

    it('should add shopify object to global metadata', (done) => {
      m.build((err, files) => {
        expect(m.metadata().shopify_data).to.be.ok;
        expect(scope.isDone()).to.be.true;
        done();
      });
    });

    it('should use cache on second build', (done) => {
      m.build((err, files) => {
        expect(m.metadata().shopify_data).to.be.defined;
        expect(scope.isDone()).to.be.false;
        expect(scope.pendingMocks().length).to.be.above(0);
        done();
      });
    });

    it('should use cache on third build', (done) => {
      m.build((err, files) => {
        expect(m.metadata().shopify_data).to.be.defined;
        expect(scope.isDone()).to.be.false;
        expect(scope.pendingMocks().length).to.be.above(0);
        done();
      });
    });

  });

});