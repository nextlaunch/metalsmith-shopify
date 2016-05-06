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