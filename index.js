/**
 * This javascript file will constitute the entry point of your solution.
 *
 * Edit it as you need.  It currently contains things that you might find helpful to get started.
 */

// This is not really required, but means that changes to index.html will cause a reload.
require('./site/index.html')
// Apply the styles in style.css to the page.
require('./site/style.css')

// if you want to use es6, you can do something like
//     require('./es6/myEs6code')
// here to load the myEs6code.js file, and it will be automatically transpiled.
const createTable = require('./es6/tableUtilities').createTable;
const sortTableDataByColumnIndex = require('./es6/tableUtilities').sortTableDataByColumnIndex;

// Change this to get detailed logging from the stomp library
global.DEBUG = false

const url = "ws://localhost:8011/stomp/fx/prices"
const client = Stomp.client(url)
client.debug = function(msg) {
  if (global.DEBUG) {
    console.info(msg)
  }
}

let tableHeads = ['Currency Name', 'Best Bid Price', 'Best Ask Price', 'Last Change Ask', 'Last Change Bid', 'Mid Price'],
    currencyObjProps = ['name', 'bestBid', 'bestAsk', 'lastChangeAsk', 'lastChangeBid'],
    currencies = {},
    timeout = null,
    container = document.getElementById('container'),
    currencyTable = createTable('currencyTable', tableHeads, container); // create currency pair table with table heads

// remove previous entry of currency pair
function removePrevEntry(currencyTable, currencyName) {
  let rowCnt = currencyTable.rows.length;
  if(rowCnt > 1) {
    for (let i = 1; i < rowCnt; i++) {
      if(currencyName === currencyTable.rows[i].cells[0].innerHTML) {
        return currencyTable.deleteRow(i);
      }
    }
  }
}

// clear mid price after every 30 seconds
function clearMidPrice() {
  timeout = setTimeout(()=> {
    currencies = {};
    timeout = null;
  }, 30000);
}

function calculateAndUpdateMidPrice(currencyTable, rowCnt, td, currencyPair) {
  let bestAsk = null,
      bestBid = null, 
      midPrice = null;

  bestBid = parseFloat(currencyTable.rows[rowCnt].cells[1].innerHTML);
  bestAsk = parseFloat(currencyTable.rows[rowCnt].cells[2].innerHTML);

  // calculate mid-price
  midPrice = (bestBid + bestAsk) / 2;

  if(!currencies[currencyPair.name]) {
    currencies[currencyPair.name] = [currencyPair.openBid]; // set open bid price as initial mid-price for currency
  }

  currencies[currencyPair.name].push(midPrice);
  td.innerHTML = "<span class='sparkline'></span>";
  Sparkline.draw(td.querySelector("span.sparkline"),  currencies[currencyPair.name]);
}

// add or update unique currency pair into the currency table
function addRow(currencyPair) {
  let rowCnt = null,
      tr = null;

  removePrevEntry(currencyTable, currencyPair.name); 
  rowCnt = currencyTable.rows.length;
  tr = currencyTable.insertRow(rowCnt);

  for (let c = 0, tLen = tableHeads.length; c < tLen; c++) {
      let td = document.createElement('td');
      td = tr.insertCell(c);
      td.innerHTML = currencyPair[currencyObjProps[c]];
      sortTableDataByColumnIndex(currencyTable, currencyObjProps.indexOf('lastChangeBid')); // sort data by currencyObjProps index - you can pass any element name from currencyObjProps array
      if(c === tableHeads.length - 1) {
        calculateAndUpdateMidPrice(currencyTable, rowCnt, td, currencyPair);
        return;
      }
  }
}

function callback(message) {
  if (message.body) {
    addRow(JSON.parse(message.body)); // add currency pair updates in form of table row
    !timeout && clearMidPrice();
  } else {
    alert("got empty message");
  }
};

function connectCallback() {
  client.subscribe("/fx/prices", callback); // fetching currecies data
}

client.connect({}, connectCallback, function(error) {
  alert(error.headers.message)
})

const exampleSparkline = document.getElementById('example-sparkline')
Sparkline.draw(exampleSparkline, [1, 2, 3, 6, 8, 20, 2, 2, 4, 2, 3])