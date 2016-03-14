# CSV Backend for es6
Fetch and query data from a google docs url

# Quickstart
``npm install gdocs-es6-data-backend``

```javascript
  import Gdocs from './node_modules/gdocs-es6-data-backend/src/index.js';
  const config = {
    url: 'https://docs.google.com/spreadsheet/ccc?key=0Aon3JiuouxLUdGZPaUZsMjBxeGhfOWRlWm85MmV0UUE#gid=0'
  };

  Gdocs.fetchTitle(config).then(data => {
    // use your data wisely
  });
```
