import Gdocs from '../src/gdocs';

describe('1+1', () => {
  let sum = 1+1;

  it('should be 2', () => {
    expect(2).toBe(2);
  });
});

describe('Gdocs module', () => {
  it('Should load', () => {
    expect(typeof Gdocs).toBe('object');
    expect(Gdocs.__type__).toBe('gdocs');
  });
});
