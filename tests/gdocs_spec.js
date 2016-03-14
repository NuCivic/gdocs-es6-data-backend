import Gdocs from '../src/gdocs';

describe('1+1', () => {
  let sum = 1+1;

  it('should be 2', () => {
    expect(2).toBe(2);
  });
});

describe('Load Gdocs module', () => {
  it('Should load', () => {
    expect(typeof Gdocs).toBe('object');
    expect(Gdocs.__type__).toBe('gdocs');
  });
});

describe('Should fetch title', () => {
  const config = {
    url: 'https://docs.google.com/spreadsheet/ccc?key=0Aon3JiuouxLUdGZPaUZsMjBxeGhfOWRlWm85MmV0UUE#gid=0'
  };
  let result;

  beforeEach(done => {
    Gdocs.fetchTitle(config).then(data => {
      console.log('title', data);
      result = data;
      done()
    });
  });

  it('Should be a string', () => {
    const title = result.spreadsheetTitle;
    expect(typeof title).toBe('string');
    expect(title).toBe('ReclineJS Example');
  });
});
