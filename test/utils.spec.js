import { expect } from 'chai';
import sinon from 'sinon';
import Metalsmith from 'metalsmith';

import { createSassVariables } from '../src';

describe('utils', () => {
  
  let mock;
  let utilsMock = { createSassVariables };

  beforeEach(() => {})

  xit('should throw an error if nothing is passed', () => {
    
  });

  xit('should return an object with a string of sass variables', () => {
    // keys turn into variables
    // functions are resolved with settings and keys are replaced with return value
    let variables = createSassVariables({
      type_header_base_size: '10px',
      type_header_border_thickness: '10px',
      font_family: (settings) => {
        if (settings === 'Google') {
          return 'Roboto';
        } else {
          return 'Helvetica';
        }
      }
    });
    expect(variables).to.equal(`$typeHeaderBaseSize: '10px';\n$typeHeaderBorderThickness: '10px';\n$fontFamily: 'Helvetica';`);
  });

});