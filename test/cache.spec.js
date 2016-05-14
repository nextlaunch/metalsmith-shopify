import {expect} from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import {shopify} from '../src';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import path from 'path';
import fs from 'fs';
import { 
  scope,
  mockReq,
  shopName,
  apiKey,
  password
} from './common';

nock.disableNetConnect();

describe('with no caching', () => {
  
  before(() => {
    // remove any cache json files
    try {
      fs.unlinkSync('shopify_data.json');
    } catch (e) {}
  });

  let m;
  let themeId = 828155753;
  let blogId = 241253187;
  let customerId = 207119551;

  beforeEach(() => {
    
    mockReq(scope);
    
    m = Metalsmith('test/fixtures/shopify-data')
      .use(shopify({
        shopName,
        apiKey,
        password,
        themeId,
        blogId,
        customerId,
        cache: false,
        localePath: path.resolve(__dirname, './fixtures/shopify-data/locales')
      }))
      .use(layouts({
        engine: 'liquid',
        directory: 'templates'
      }))

  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should get fresh data on first call', (done) => {
    m.build((err, files) => {
      expect(m.metadata().shopify_data).to.be.defined;
      expect(scope.isDone()).to.be.true;
      done();
    });
  });

  it('should get fresh data on second call', (done) => {
    m.build((err, files) => {
      expect(m.metadata().shopify_data).to.be.defined;
      expect(scope.isDone()).to.be.true;
      done();
    });
  });

  it('should get fresh data on third call', (done) => {
    m.build((err, files) => {
      expect(m.metadata().shopify_data).to.be.defined;
      expect(scope.isDone()).to.be.true;
      expect(scope.pendingMocks().length).to.equal(0);
      done();
    });
  });

});