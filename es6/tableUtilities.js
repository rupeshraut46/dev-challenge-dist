exports.createTable = function(tableId, tableHeads, container) {
    let table = null, tr = null;
  
    table = document.createElement("table");
    table.setAttribute("id", tableId);
    tr = table.insertRow(-1);
  
    for (let h = 0, tLen = tableHeads.length; h < tLen; h++) {
      let th = document.createElement("th");
      th.innerHTML = tableHeads[h];
      tr.appendChild(th);
    }
  
    return container.appendChild(table);
  };
  
  exports.sortTableDataByColumnIndex = function(table, index) {
    // Read table body node and table row nodes.
    let tableData = table.getElementsByTagName('tbody').item(0),
        rowData = tableData.getElementsByTagName('tr'),
        currentItem = null,
        nextItem = null,
        operators = {
          '>': function(a, b) { return a > b },
          '<': function(a, b) { return a < b },
        },
        op = '';
  
    for(var i = 1; i < rowData.length - 1; i++) {
        for(var j = 1; j < rowData.length - (i + 1); j++) {
          
          currentItemValue = rowData.item(j).getElementsByTagName('td').item(index).innerHTML;
          nextItemValue = rowData.item(j+1).getElementsByTagName('td').item(index).innerHTML;
          op = '>';
  
          if(index) {
              currentItemValue = parseFloat(currentItemValue);
              nextItemValue = parseFloat(nextItemValue);
              op = '<';
          } 
  
            //Swap row nodes if condition matches
            if(operators[op](currentItemValue, nextItemValue)) {
                return tableData.insertBefore(rowData.item(j+1), rowData.item(j));
            }
        }
    }
  };
  