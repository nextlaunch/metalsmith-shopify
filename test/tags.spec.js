import { expect } from 'chai';
import sinon from 'sinon';
import mock from 'mock-fs';
import Metalsmith from 'metalsmith';
import layouts from 'metalsmith-layouts';
import path from 'path';

import { assignFilters } from '../src';

describe('translate tag', () => {

  let m;
  beforeEach(() => {
    // set up a new build
    m = Metalsmith('test/fixtures');
  });

  afterEach(() => {
    mock.restore();
  });

  it('should accept a string and return the right object from an array object source', (done) => {
    let str = 'nested.obj.data';
    let filters;
    m.use((files, metalsmith, next) => {

        let localePath = path.resolve('test/fixtures/locales');
        filters = assignFilters({
          locale: 'en.default',
          localePath
        }, metalsmith);

        expect(filters.t).to.be.ok;
        let data = filters.t(str);
        expect(data).to.equal('The Data');

        next();
      })
      .use(layouts({
        engine: 'liquid',
        directory: 'templates'
      }))
      .build((err, files) => {
        expect(m.metadata().filters).to.be.ok;
        done();
      });

  });

  it('should accept a string and return the right object from a data object source', (done) => {
   
    let str = 'nested.obj.data';
    let filters;
    m.use((files, metalsmith, next) => {

        let localePath = path.resolve('test/fixtures/locales');
        filters = assignFilters({
          locale: 'en.default.obj',
          localePath
        }, metalsmith);

        expect(filters.t).to.be.ok;
        let data = filters.t(str);
        expect(data).to.equal('The Data');

        next();
      })
      .use(layouts({
        engine: 'liquid',
        directory: 'templates'
      }))
      .build((err, files) => {
        expect(m.metadata().filters).to.be.ok;
        done();
      });
    
  });

});

describe('URL Filters', () => {
  
  let m;
  beforeEach(() => {
    // set up a new build
    m = Metalsmith('test/fixtures');
  });

  it('should have asset_url filter', (done) => {
    
    let str = 'timber.scss.css';
    let filters;
    m.use((files, metalsmith, next) => {

        let localePath = path.resolve('test/fixtures/locales');
        filters = assignFilters({
          locale: 'en.default.obj',
          localePath
        }, metalsmith);

        expect(filters.asset_url).to.be.ok;
        let data = filters.asset_url(str);
        expect(data).to.equal('https://cdn.shopify.com/s/files/1/0354/1849/t/2/assets/timber.scss.css');

        next();
      })
      .use(layouts({
        engine: 'liquid',
        directory: 'templates'
      }))
      .build(done);

  });

});