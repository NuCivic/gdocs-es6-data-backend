console.log('Gdocs1');

const Gdocs = {};

Gdocs.__type__ = 'gdocs';

Gdocs.fetchTitle = function (config) {
  const urls = Gdocs.getGdocsApiUrls(config.url, config.worksheetIndex);
  return new Promise((resolve, reject) => {
    fetch(urls.spreadsheetAPI)
      .then(res => {
        return res.json();
      })
      .then(data => {
        console.log('r1', data);
        resolve({spreadsheetTitle: data.feed.title.$t});
      });
    }).catch(e => {
      console.log('Error fetching title', e);
      reject(e);
    });
};

Gdocs.fetch = function (config) {
  const urls = Gdocs.getGdocsApiUrls(config.url, config.worksheetIndex);
  return new Promise((resolve, reject) => {
    Gdocs.fetchTitle(config)
      .then(title => {
        // Now fetch the data
        fetch(urls.worksheetAPI)
          .then(res => {
            return res.json();
          })
          .then(data => {
            console.log('rr2', data);
            let parsed = Gdocs.parseData(data);
            console.log('rr22', parsed);
            resolve(data);
          })
          .catch(e => {
            console.log('Error fetching data', e);
            reject(e);
          }); 
      })
      .catch(e => {
        reject(e);
      });
  });
};

// Convenience function to get GDocs JSON API Url from standard URL
//
// @param url: url to gdoc to the GDoc API (or just the key/id for the Google Doc)
Gdocs.getGdocsApiUrls = function(url, worksheetIndex) {
  // https://docs.google.com/spreadsheet/ccc?key=XXXX#gid=YYY
  var regex = /.*spreadsheet\/ccc\?.*key=([^#?&+]+)[^#]*(#gid=([\d]+).*)?/;
    // new style is https://docs.google.com/a/okfn.org/spreadsheets/d/16DayFB.../edit#gid=910481729
  var regex2 = /.*spreadsheets\/d\/([^\/]+)\/edit(#gid=([\d]+).*)?/;
  var matches = url.match(regex);
  var matches2 = url.match(regex2);
  var key;
  var worksheet;

  if (!!matches) {
      key = matches[1];
      // the gid in url is 0-based and feed url is 1-based
      worksheet = parseInt(matches[3]) + 1;
      if (isNaN(worksheet)) {
        worksheet = 1;
      }
  }
  else if (!!matches2) {
    key = matches2[1];
    worksheet = 1;
    if (isNaN(worksheet)) {
      worksheet = 1;
    }
  }
  else if (url.indexOf('spreadsheets.google.com/feeds') !== -1) {
      // we assume that it's one of the feeds urls
      key = url.split('/')[5];
      // by default then, take first worksheet
      worksheet = 1;
  } else {
    key = url;
    worksheet = 1;
  }
  worksheet = (worksheetIndex || worksheetIndex ===0) ? worksheetIndex : worksheet;

  return {
    worksheetAPI: 'https://spreadsheets.google.com/feeds/list/'+ key +'/'+ worksheet +'/public/values?alt=json',
    spreadsheetAPI: 'https://spreadsheets.google.com/feeds/worksheets/'+ key +'/public/basic?alt=json',
    spreadsheetKey: key,
    worksheetIndex: worksheet
  };
};

Gdocs.parseData = function(gdocsSpreadsheet, options) {
    var options  = options || {};
    var colTypes = options.colTypes || {};
    var results = {
      fields : [],
      records: []
    };
    var entries = gdocsSpreadsheet.feed.entry || [];
    var key;
    var colName;
    // percentage values (e.g. 23.3%)
    var rep = /^([\d\.\-]+)\%$/;

    for(key in entries[0]) {
      // it's barely possible it has inherited keys starting with 'gsx$'
      if(/^gsx/.test(key)) {
        colName = key.substr(4);
        results.fields.push(colName);
      }
    }

    // converts non numberical values that should be numerical (22.3%[string] -> 0.223[float])
    results.records = entries.map(entry => {
      var row = {};

      results.fields.forEach(col => {
        var _keyname = 'gsx$' + col;
        var value = entry[_keyname].$t;
        var num;
 
        // TODO cover this part of code with test
        // TODO use the regexp only once
        // if labelled as % and value contains %, convert
        if(colTypes[col] === 'percent' && rep.test(value)) {
          num   = rep.exec(value)[1];
          value = parseFloat(num) / 100;
        }

        row[col] = value;
      });

      return row;
    });

    results.worksheetTitle = gdocsSpreadsheet.feed.title.$t;
    return results;
  };

export default Gdocs;
