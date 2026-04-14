# Examples | Tabulator
[Virtual DOM - Vertical](#virtual-dom) [Documentation](https://tabulator.info/docs/6.4/virtual-dom)
---

Tabulator renders its table using a Virtual DOM, this means that it only renders the rows you seen in the table (plus a few above and below the current view) and creates and destroys the rows as you scroll through the table.

The table below has 1000 rows, each row is loaded as it becomes visible as you scroll

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    columns:[
    {title:"Name", field:"name"},
    {title:"Progress", field:"progress", sorter:"number"},
    {title:"Gender", field:"gender"},
    {title:"Rating", field:"rating"},
    {title:"Favourite Color", field:"col"},
    {title:"Date Of Birth", field:"dob", hozAlign:"center"},
    ],
});
```


[Virtual DOM - Horizontal](#virtual-dom-hoz) [Documentation](about:/docs/6.4/layout#virtual-dom-hoz)
----------------------------------------------------------------------------------------------------

For tables with large numbers of columns you can use the virtualDomHoz option to enable the horizontal Virtual DOM which will improve table rendering performance in tables with a large number of columns

The table below has 100 columns, each column is loaded as it becomes visible as you scroll horizontally

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    renderHorizontal:"virtual",
    columns:[
        {title:"col1", field:"col1"},
        //...
        {title:"col499", field:"col499"},
    ],
});
```


[Fit To Data](#fittodata) [Documentation](about:/docs/6.4/layout#fittodata)
---------------------------------------------------------------------------

Tables will automatically resize columns to fit the data

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    columns:[
    {title:"Name", field:"name"},
    {title:"Progress", field:"progress", hozAlign:"right", sorter:"number"},
    {title:"Gender", field:"gender"},
    {title:"Rating", field:"rating", hozAlign:"center"},
    {title:"Favourite Color", field:"col"},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
    {title:"Driver", field:"car", hozAlign:"center"},
    ],
});
```


[Fit To Data and Fill](#fittodatafill) [Documentation](about:/docs/6.4/layout#fittodatafill)
--------------------------------------------------------------------------------------------

By setting the layout option to fitDataFill, the table will resize the columns to fit their data, and ensure that rows takeup the full width of the table.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    layout:"fitDataFill",
    height:"311px",
    columns:[
    {title:"Name", field:"name"},
    {title:"Progress", field:"progress", hozAlign:"right", sorter:"number"},
    {title:"Gender", field:"gender"},
    {title:"Rating", field:"rating", hozAlign:"center"},
    {title:"Favourite Color", field:"col"},
    ],
});
```


[Fit To Data and Stretch Last Column](#fittodatastretch) [Documentation](about:/docs/6.4/layout#fittodatastretch)
-----------------------------------------------------------------------------------------------------------------

By setting the layout option to fitDataStretch, the table will resize the columns to fit their data, and stretch the final column to fill up the remaining width of the table.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    layout:"fitDataStretch",
    height:"311px",
    columns:[
    {title:"Name", field:"name"},
    {title:"Progress", field:"progress", hozAlign:"right", sorter:"number"},
    {title:"Gender", field:"gender"},
    {title:"Rating", field:"rating", hozAlign:"center"},
    {title:"Favourite Color", field:"col"},
    ],
});
```


[Fit Table and Columns to Data](#fittodatatable) [Documentation](about:/docs/6.4/layout#fittodatatable)
-------------------------------------------------------------------------------------------------------

Tables will automatically resize container and columns to fit the data

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitDataTable",
    columns:[
        {title:"Name", field:"name"},
        {title:"Progress", field:"progress", hozAlign:"right", sorter:"number"},
        {title:"Gender", field:"gender"},
    ],
});
```


[Fit To Width](#fittowidth) [Documentation](about:/docs/6.4/layout#fittowidth)
------------------------------------------------------------------------------

By setting the layout option to fitColumns, the table will resize columns so that they fit perfectly inside the width of the container.

In this layout mode, columns without a width set are resized to fill any remaining space on the table. If all columns cannot fit on the table then a scrollbar will appear.

The widthGrow and widthShrink column definition properties can be used to set how much each column grows or shrinks by.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columns:[
    {title:"Name", field:"name", width:200},
    {title:"Progress", field:"progress", hozAlign:"right", sorter:"number"},
    {title:"Gender", field:"gender", widthGrow:2},
    {title:"Rating", field:"rating", hozAlign:"center"},
    {title:"Favourite Color", field:"col", widthGrow:3},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", widthGrow:2},
    {title:"Driver", field:"car", hozAlign:"center"},
    ],
});
```


[Responsive Layout](#responsive-layout) [Documentation](about:/docs/6.4/layout#responsive)
------------------------------------------------------------------------------------------

By setting the responsiveLayout option to "hide", the table will automatically hide/show columns to prevent the columns from exceeding the width of container.

If you resize the the width of the window you will see the number of columns change to ensure the data fits with the table. This option can be combined with fitColumns to make a table that gracefully responds to all display widths.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    responsiveLayout:"hide",
    columns:[
    {title:"Name", field:"name", width:200, responsive:0}, //never hide this column
    {title:"Progress", field:"progress", hozAlign:"right", sorter:"number", width:150},
    {title:"Gender", field:"gender", width:150, responsive:2}, //hide this column first
    {title:"Rating", field:"rating", hozAlign:"center", width:150},
    {title:"Favourite Color", field:"col", width:150},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", width:150},
    {title:"Driver", field:"car", hozAlign:"center", width:150},
    ],
});
```


[Responsive Layout Collapsed List](#responsive-layout-collapse) [Documentation](about:/docs/6.4/layout#responsive-collapse)
---------------------------------------------------------------------------------------------------------------------------

By setting the responsiveLayout option to "collapse", the table will automatically collapse columns that don't fit on the table into a list of column titles and values.

If you resize the the width of the window you will see the number of columns change to ensure the data fits with the table and the collapsed list showing under each row.

*   By adding a row header with the responsiveCollapse formatter, users then get a toggle element to hide or show the collapsed content

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitDataFill",
    responsiveLayout:"collapse",
    rowHeader:{formatter:"responsiveCollapse", width:30, minWidth:30, hozAlign:"center", resizable:false, headerSort:false},
    columns:[
    {title:"Name", field:"name", width:200, responsive:0},
    {title:"Progress", field:"progress", hozAlign:"right", sorter:"number", width:150},
    {title:"Gender", field:"gender", width:150, responsive:2},
    {title:"Rating", field:"rating", hozAlign:"center", width:150},
    {title:"Favourite Color", field:"col", width:150},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", width:150},
    {title:"Driver", field:"car", hozAlign:"center", width:150},
    ],
});
```


[Automatic Column Generation](#autocolumns) [Documentation](about:/docs/6.4/columns#autocolumns)
------------------------------------------------------------------------------------------------

Tabulator can automatically work out the columns structure of simple tables by examining the data in the first row of the table.

If you set the autoColumns option to true, every time data is loaded into the table through the data option or through the setData function, Tabulator will examine the first row of the data and build columns to match that data.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//define data
var tabledata = [
    {id:1, name:"Oli Bob", location:"United Kingdom", gender:"male", rating:1, col:"red", dob:"14/04/1984"},
    {id:2, name:"Mary May", location:"Germany", gender:"female", rating:2, col:"blue", dob:"14/05/1982"},
    {id:3, name:"Christine Lobowski", location:"France", gender:"female", rating:0, col:"green", dob:"22/05/1982"},
    {id:4, name:"Brendon Philips", location:"USA", gender:"male", rating:1, col:"orange", dob:"01/08/1980"},
    {id:5, name:"Margret Marmajuke", location:"Canada", gender:"female", rating:5, col:"yellow", dob:"31/01/1999"},
    {id:6, name:"Frank Harbours", location:"Russia", gender:"male", rating:4, col:"red", dob:"12/05/1966"},
    {id:7, name:"Jamie Newhart", location:"India", gender:"male", rating:3, col:"green", dob:"14/05/1985"},
    {id:8, name:"Gemma Jane", location:"China", gender:"female", rating:0, col:"red", dob:"22/05/1982"},
    {id:9, name:"Emily Sykes", location:"South Korea", gender:"female", rating:1, col:"maroon", dob:"11/11/1970"},
    {id:10, name:"James Newman", location:"Japan", gender:"male", rating:5, col:"red", dob:"22/03/1998"},
];

//define table
var table = new Tabulator("#example-table", {
    data:tabledata,
    autoColumns:true,
});
```


[Resizable Columns](#resize) [Documentation](about:/docs/6.4/layout#resize-column)
----------------------------------------------------------------------------------

By Including the Resize Columns module in your table all columns will automatically become resizable. With resizability being controlled on a per column basis using the resizable column definition option.

When resizable columns are in use, you can use the resizableColumnFit option to make resizing one column change the width of its neighbour to maintain total column width.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    resizableColumnFit:true,
    columns:[
        {title:"Name", field:"name", width:200, resizable:true},
        {title:"Progress", field:"progress", resizable:true},
        {title:"Gender", field:"gender", resizable:true}, 
        {title:"Rating", field:"rating", resizable:true},
        {title:"Favourite Color", field:"col", resizable:true},
    ],
});
```


[Resize Guides](#resize-guides) [Documentation](about:/docs/6.4/layout#resize-guides)
-------------------------------------------------------------------------------------

By default when resizing columns or rows, the row will automatically resize as you drag the elements edge across the table. While this is often desierable, if you have complex cell contents this can sometimes lead to unpleasent or jittery redrawing of the table.

To improve these scenarios, the resize modules also provide resize guides. When using guides, when you drag the edge of a column or row, a guide is shown that helps you see how big the element will be when you have finished dragging, but it will only actually resize the elements when the resize is complete.

Resize guides can be enabled with the resizableColumnGuide and resizableRowGuide options

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    resizableRows:true,
    resizableRowGuide:true,
    resizableColumnGuide:true,
    columnDefaults:{
        resizable:true,
    },
    columns: [
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress"},
        {title:"Gender", field:"gender"}, 
        {title:"Rating", field:"rating"},
        {title:"Favourite Color", field:"col"},
    ],
});
```


[Column Groups](#column-groups) [Documentation](about:/docs/6.4/columns#groups)
-------------------------------------------------------------------------------

By creating groups in the column definition array, you can create multi line headers with groups of columns.

You can use the columnVertAlign option to set how the text in your columns headers should be vertically aligned.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    columnHeaderVertAlign:"bottom", //align header contents to bottom of cell
    columns:[
    {title:"Name", field:"name", width:160},
    {//create column group
        title:"Work Info",
        columns:[
        {title:"Progress", field:"progress", hozAlign:"right", sorter:"number", width:100},
        {title:"Rating", field:"rating", hozAlign:"center", width:80},
        {title:"Driver", field:"car", hozAlign:"center", width:80},
        ],
    },
    {//create column group
        title:"Personal Info",
        columns:[
        {title:"Gender", field:"gender", width:90},
        {title:"Favourite Color", field:"col", width:140},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", width:130},
        ],
    },
    ],
});
```


[Vertical Column Headers](#column-vertical) [Documentation](about:/docs/6.4/columns#vertical)
---------------------------------------------------------------------------------------------

If you are trying to fit a lot of narrow columns on your table, you can use the headerVertical column definition propery to change the orientation of the header text to vertical.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    columns:[
        {title:"Name", field:"name", headerSort:false, headerVertical:true},
        {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", formatter:"progress",  editable:true, headerSort:false, headerVertical:true},
        {title:"Gender", field:"gender", headerSort:false, headerVertical:true},
        {title:"Rating", field:"rating", hozAlign:"center", headerSort:false, headerVertical:true},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", headerSort:false, headerVertical:true},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", headerSort:false, headerVertical:true},
    ],
});
```


[Row Header](#row-header) [Documentation](about:/docs/6.4/layout#row-header)
----------------------------------------------------------------------------

In addition to the column headers, it is possible to add row headers to the table using the rowHeader option.

On its own this is largely a visual accent, but coupled with other modules such as moveable rows or range selection it becomes a powerful functional tool that keeps row controls visually separated from the table data.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    rowHeader:{formatter:"rownum", headerSort:false, hozAlign:"center", resizable:false, frozen:true},
    columns:[
        {title:"Name", field:"name", headerSort:false},
        {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", formatter:"progress",  editable:true, headerSort:false},
        {title:"Gender", field:"gender", headerSort:false},
        {title:"Rating", field:"rating", hozAlign:"center", headerSort:false},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", headerSort:false},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", headerSort:false},
    ],
});
```


[Frozen Columns](#frozen-col) [Documentation](about:/docs/6.4/layout#frozen-column)
-----------------------------------------------------------------------------------

You can use the frozen property in a columns definition object to freeze that column in place during horizontal scrollling.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    columns:[
    {title:"Name", field:"name", width:250, frozen:true}, //frozen column
    {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", formatter:"progress", width:200,  editable:true},
    {title:"Gender", field:"gender", width:150},
    {title:"Rating", field:"rating",  formatter:"star", hozAlign:"center", width:200},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
    {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", width:150},
    ],
});
```


[Frozen Rows](#frozen-row) [Documentation](about:/docs/6.4/layout#frozen-row)
-----------------------------------------------------------------------------

You can use the frozenRows option in the table constructor to specify the number of rows you want to freeze at the top of the table.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    frozenRows:1,
    columns:[
        {title:"Name", field:"name", width:250},
        {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", formatter:"progress", width:200,  editable:true},
        {title:"Gender", field:"gender", width:150},
        {title:"Rating", field:"rating",  formatter:"star", hozAlign:"center", width:200},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", width:150},
    ],
});
```


[Nested Data Trees](#tree) [Documentation](https://tabulator.info/docs/6.4/tree)
----------------------------------------------------------

You can use enable tree structures on nested data by setting the dataTree option to true in the table constructor.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    data:tableDataNested,
    dataTree:true,
    dataTreeStartExpanded:true,
    columns:[
    {title:"Name", field:"name", width:200, responsive:0}, //never hide this column
    {title:"Location", field:"location", width:150},
    {title:"Gender", field:"gender", width:150, responsive:2}, //hide this column first
    {title:"Favourite Color", field:"col", width:150},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", width:150},
    ],
});
```


### Nested Table Data

```
var tableDataNested = [
    {name:"Oli Bob", location:"United Kingdom", gender:"male", col:"red", dob:"14/04/1984", _children:[
        {name:"Mary May", location:"Germany", gender:"female", col:"blue", dob:"14/05/1982"},
        {name:"Christine Lobowski", location:"France", gender:"female", col:"green", dob:"22/05/1982"},
        {name:"Brendon Philips", location:"USA", gender:"male", col:"orange", dob:"01/08/1980", _children:[
            {name:"Margret Marmajuke", location:"Canada", gender:"female", col:"yellow", dob:"31/01/1999"},
            {name:"Frank Harbours", location:"Russia", gender:"male", col:"red", dob:"12/05/1966"},
        ]},
    ]},
    {name:"Jamie Newhart", location:"India", gender:"male", col:"green", dob:"14/05/1985"},
    {name:"Gemma Jane", location:"China", gender:"female", col:"red", dob:"22/05/1982", _children:[
        {name:"Emily Sykes", location:"South Korea", gender:"female", col:"maroon", dob:"11/11/1970"},
    ]},
    {name:"James Newman", location:"Japan", gender:"male", col:"red", dob:"22/03/1998"},
];

```


[Nested Tables](#nested-tables)
-------------------------------

You can also use the rowFormatter callback to create tables nested in other tables.

You just need to make sure that the second tables data array is in a property of the first tables row data object, in this example we will use the property serviceHistory.

Source Code

### Data

```
 var nestedData = [
    {id:1, make:"Ford", model:"focus", reg:"P232 NJP", color:"white", serviceHistory:[
       {date:"01/02/2016", engineer:"Steve Boberson", actions:"Changed oli filter"},
       {date:"07/02/2017", engineer:"Martin Stevenson", actions:"Break light broken"},
    ]},
    {id:1, make:"BMW", model:"m3", reg:"W342 SEF", color:"red", serviceHistory:[
       {date:"22/05/2017", engineer:"Jimmy Brown", actions:"Aligned wheels"},
       {date:"11/02/2018", engineer:"Lotty Ferberson", actions:"Changed Oil"},
       {date:"04/04/2018", engineer:"Franco Martinez", actions:"Fixed Tracking"},
    ]},
]
```


`JavaScript`

```javascript
//define table
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columnDefaults:{
      resizable:true,
    },
    data:nestedData,
    columns:[
        {title:"Make", field:"make"},
        {title:"Model", field:"model"},
        {title:"Registration", field:"reg"},
        {title:"Color", field:"color"},
    ],
    rowFormatter:function(row){
        //create and style holder elements
       var holderEl = document.createElement("div");
       var tableEl = document.createElement("div");

       holderEl.style.boxSizing = "border-box";
       holderEl.style.padding = "10px 30px 10px 10px";
       holderEl.style.borderTop = "1px solid #333";
       holderEl.style.borderBotom = "1px solid #333";
       

       tableEl.style.border = "1px solid #333";

       holderEl.appendChild(tableEl);

       row.getElement().appendChild(holderEl);

       var subTable = new Tabulator(tableEl, {
           layout:"fitColumns",
           data:row.getData().serviceHistory,
           columns:[
           {title:"Date", field:"date", sorter:"date"},
           {title:"Engineer", field:"engineer"},
           {title:"Action", field:"actions"},
           ]
       })
    },
});
```


[Formatters](#formatters) [Documentation](https://tabulator.info/docs/6.4/format)
-----------------------------------------------------------

Tabulator allows you to format your data in a wide variety of ways, so your tables can display information in a more graphical and clear layout.

you can set formatters on a per column basis using the formatter option in the column data.

Tabulator comes with a number of preconfigured formatters including:

*   **money** - formats a number into a currency notation (eg. 1234567.8901 -> 1,234,567.89)
*   **image** - creates an img element wirh the src set as the value. _(triggers the normalizeHeight function on the row on image load)_
*   **link** - renders data as an anchor with a link to the given value
*   **tick** - displays a green tick if the value is (true|'true'|'True'|1) and an empty cell if not
*   **tickCross** - displays a green tick if the value is (true|'true'|'True'|1) and a red cross if not
*   **color** - sets the background color of the cell to the value. Can be any valid css colour eg. #ff0000, #f00, rgb(255,0,0), red, rgba(255,0,0,0), hsl(0, 100%, 50%)
*   **star** - displays a graphical 0-5 star rating based on integer values from 0-5
*   **progress** - displays a progress bar that fills the cell from left to right, using values 0-100 as a percentage of width
*   **buttonTick** - displays a tick icon on each row (for use as a button)
*   **buttonCross** - displays a cross icon on each row (for use as a button)
*   **rownum** - shows an incrementing row number for each row.

You can define a custom formatter function in the formatter option if you need more bespoke formatter functionality

You can create icon/button columns, by not specifying a field parameter in the column data and creating a custom formatter for the column contents. In the example below we have created a print button on the left of each row.

You can also set a row formatter using the rowFormatter option, this allows you to format the styling of the row as a whole

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//Generate print icon
var printIcon = function(cell, formatterParams){ //plain text value
    return "<i class='fa fa-print'></i>";
};

//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    rowFormatter:function(row){
        if(row.getData().col == "blue"){
            row.getElement().style.backgroundColor = "#1e3b20";
        }
    },
    columns:[
    {formatter:"rownum", hozAlign:"center", width:40},
    {formatter:printIcon, width:40, hozAlign:"center", cellClick:function(e, cell){alert("Printing row data for: " + cell.getRow().getData().name)}},
    {title:"Name", field:"name", width:150, formatter:function(cell, formatterParams){
       var value = cell.getValue();
        if(value.indexOf("o") > 0){
            return "<span style='color:#3FB449; font-weight:bold;'>" + value + "</span>";
        }else{
            return value;
        }
    }},
    {title:"Progress", field:"progress", formatter:"progress", formatterParams:{color:["#00dd00", "orange", "rgb(255,0,0)"]}, sorter:"number", width:100},
    {title:"Rating", field:"rating", formatter:"star", formatterParams:{stars:6}, hozAlign:"center", width:120},
    {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", width:50},
    {title:"Col", field:"col" ,formatter:"color", width:50},
    {title:"Line Wraping", field:"lorem" ,formatter:"textarea"},
    {formatter:"buttonCross", width:30, hozAlign:"center"}
    ],
});
```


[Row Formatter](#row-formatter) [Documentation](about:/docs/6.4/format#row)
---------------------------------------------------------------------------

If you are looking for a non grid based format to your table then you can use a row formatter to create custom row layouts.

You can use the rowFormatter callback to replace the contents of the row with any layout you like. In this example we will create a simple table in each row containing and image and some vertically centered text properties.

When replacing the entire contents of the row it is important to include only one column in your column definition array to ensure the table renders correctly. It is also advisable to enable fitColumns layout mode and disable resizable options in the columnDefaults object.

Source Code

`css`

```
/*Style row formatter contents*/
#example-table .tabulator-row table{
    vertical-align: middle;
    border-collapse:collapse;
}

#example-table .tabulator-row table img{
    border:2px solid #ccc;
}

#example-table .tabulator-row table tr td{
     border:none;
}

#example-table .tabulator-row table tr td:first-of-type{
    width:60px;
}

#example-table .tabulator-row table tr td div{
    padding:5px;
}
```


`JavaScript`

```javascript
//Define some test data
var cheeseData = [
    {id:1, type:"Brie", rind:"mould", age:"4 weeks", color:"white", image:"brie.jpg"},
    {id:2, type:"Cheddar", rind:"none", age:"1 year", color:"yellow", image:"cheddar.jpg"},
    {id:3, type:"Gouda", rind:"wax", age:"6 months", color:"cream", image:"gouda.jpg"},
    {id:4, type:"Swiss", rind:"none", age:"9 months", color:"yellow", image:"swiss.jpg"},
]

//define Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columnDefaults:{
      resizable:true,
    },
    data:cheeseData,
    columns:[
        {title:"Cheese", field:"type", sorter:"string"},
    ],
    rowFormatter:function(row){
        var element = row.getElement(),
        data = row.getData(),
        width = element.offsetWidth,
        rowTable, cellContents;

        //clear current row data
        while(element.firstChild) element.removeChild(element.firstChild);

        //define a table layout structure and set width of row
        rowTable = document.createElement("table")
        rowTable.style.width = (width - 18) + "px";

        rowTabletr = document.createElement("tr");

        //add image on left of row
        cellContents = "<td><img src='/sample_data/row_formatter/" + data.image + "'></td>";

        //add row data on right hand side
        cellContents += "<td><div><strong>Type:</strong> " + data.type + "</div><div><strong>Age:</strong> " + data.age + "</div><div><strong>Rind:</strong> " + data.rind + "</div><div><strong>Colour:</strong> " + data.color + "</div></td>"

        rowTabletr.innerHTML = cellContents;

        rowTable.appendChild(rowTabletr);

        //append newly formatted contents to the row
        element.append(rowTable);
    },
});
```


[Custom Formatters](#sparklines)
--------------------------------

You can use external JavaScript libraries in any of your custom formatters. In this example we will use the popular piety.js library.

We will be passing an array of values into a field and then using a custom formatter to turn this array into a line or bar chart.javascript

The Piety library can be downloaded from [Git Hub.](https://github.com/railsjazz/peity_vanilla)

Source Code

`HTML`

```html
<!-- Include piety library -->
<script src="piety.js"></script>

<!-- Element to hold Tabulator -->
<div id="example-table"></div>
```


`JavaScript`

```javascript
//Formatter to generate charts
 var chartFormatter = function(cell, formatterParams, onRendered){
    var content = document.createElement("span");
    var values = cell.getValue();

    //invert values if needed
    if(formatterParams.invert){
        values = values.map(val => val * -1);
    }

    //add values to chart and style
    content.classList.add(formatterParams.type);
    content.innerHTML = values.join(",");

    //setup chart options
    var options = {
        width: 145,
    }

    if(formatterParams.fill){
        options.fill = formatterParams.fill
    }

    //instantiate piety chart after the cell element has been aded to the DOM
    onRendered(function(){
        peity(content, formatterParams.type,  options);
    });

    return content;
};

//Sample Data with array values for graph fields
var sparkData = [
    {id:1, name:"Oli Bob", line:[1, 20, 5, 3, 10, 13, 17, 15, 9, 11], bar:[1, 20, 5, 3, 10, 13, 17, 15, 9, 11], colored:[1, 20, -5, -3, 10, 13, 0, 15, 9, 11], inverted:[1, 20, 5, 3, 10, 13, 17, 15, 9, 11]},
    {id:2, name:"Mary May", line:[10, 12, 14, 16, 13, 9, 7, 11, 10, 13], bar:[10, 12, 14, 16, 13, 9, 7, 11, 10, 13], colored:[-10, 12, 14, 16, 13, 9, 7, 0, 10, 13], inverted:[10, 12, 14, 16, 13, 9, 7, 11, 10, 13]},
    {id:3, name:"Christine Lobowski", line:[1, 2, 5, 4, 1, 16, 4, 2, 1, 3], bar:[1, 2, 5, 4, 1, 16, 4, 2, 1, 3], colored:[1, 2, 5, 0, 1, 16, 4, 2, 1, 3], inverted:[1, 2, 5, 4, 1, 16, 4, 2, 1, 3]},
    {id:4, name:"Brendon Philips", line:[3, 7, 9, 1, 4, 8, 2, 6, 4, 2], bar:[3, 7, 9, 1, 4, 8, 2, 6, 4, 2], colored:[3, 7, 9, 1, 4, 8, 2, 6, 4, 2], inverted:[3, 7, 9, 1, 4, 8, 2, 6, 4, 2]},
    {id:5, name:"Margret Marmajuke", line:[1, 3, 1, 3, 3, 1, 1, 3, 1, 3], bar:[1, 3, 1, 3, 3, 1, 1, 3, 1, 3], colored:[1, -3, 1, 3, -3, 1, -1, 3, 1, 3], inverted:[1, 3, 1, 3, 3, 1, 1, 3, 1, 3]},
    {id:6, name:"Frank Harbours", line:[20, 17, 15, 11, 16, 9, 12, 14, 20, 12], bar:[20, 17, 15, 11, 16, 9, 12, 14, 20, 12], colored:[20, 17, 15, 11, 16, -9, 12, 14, 20, 12], inverted:[20, 17, 15, 11, 16, 9, 12, 14, 20, 12]},
    {id:7, name:"Jamie Newhart", line:[11, 7, 6, 12, 14, 13, 11, 10, 9, 6], bar:[11, 7, 6, 12, 14, 13, 11, 10, 9, 6], colored:[11, 7, 6, -12, 1-13, 11, 10, 9, 6], inverted:[11, 7, 6, 12, 14, 13, 11, 10, 9, 6]},
    {id:8, name:"Gemma Jane", line:[4, 17, 11, 12, 0, 5, 12, 14, 18, 11], bar:[4, 17, 11, 12, 0, 5, 12, 14, 18, 11], colored:[4, 17, 11, -12, 0, 5, 12, -14, 18, 11], inverted:[4, 17, 11, 12, 0, 5, 12, 14, 18, 11]},
    {id:9, name:"Emily Sykes", line:[11, 15, 19, 20, 17, 16, 16, 5, 3, 2], bar:[11, 15, 19, 20, 17, 16, 16, 5, 3, 2], colored:[11, 15, 19, -20, 17, 16, 16, -5, 3, 2], inverted:[11, 15, 19, 20, 17, 16, 16, 5, 3, 2]},
    {id:10, name:"James Newman", line:[1, 2, 3, 4, 5, 4, 2, 5, 9, 8], bar:[1, 2, 3, 4, 5, 4, 2, 5, 9, 8], colored:[1, 2, 0, -4, -5, -4, 2, 5, 9, 8], inverted:[1, 2, 3, 4, 5, 4, 2, 5, 9, 8]},
];


//Table Constructor
var example_table_sparkline = new Tabulator("#example-table-sparkline", {
    height:"311px",
    data:sparkData,
    columns:[
    {title:"Name", field:"name", width:190},
    {title:"Line Chart", field:"line", width:160, formatter:chartFormatter, formatterParams:{type:"line"}},
    {title:"Bar Chart", field:"bar", width:160, formatter:chartFormatter, formatterParams:{type:"bar"}},
    {title:"Coloured Bar Chart", field:"colored", width:160, formatter:chartFormatter, formatterParams:{type:"bar",  fill: function(value) {
        return value > 0 ? "green" : "red"
    }}},
    {title:"Inverted Bar Chart", field:"inverted", width:160, formatter:chartFormatter, formatterParams:{type:"bar", invert:true, fill: function(_, i, all) {
        var g = parseInt((i / all.length) * 255)
        return "rgb(255, " + g + ", 0)"
        }}},
    ],
});
```


[Persistent Configuration](#persistence) [Documentation](https://tabulator.info/docs/6.4/persist)
---------------------------------------------------------------------------

Tabulator can store a variety of table setup options so that each time a user comes back to the page, the table is laid out just as they left it

Try resizing (drag the right edge of a column header) or rearranging (drag the middle of a column header) the columns of this table, or sorting a column, then refresh the page. your new layout will persist.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    persistence:{
      sort:true,
      filter:true,
      columns:true,
    },
    persistenceID:"examplePerststance",
    columns:[
    {title:"Name", field:"name", width:200},
    {title:"Progress", field:"progress", width:100, sorter:"number"},
    {title:"Gender", field:"gender"},
    {title:"Rating", field:"rating", width:80},
    {title:"Favourite Color", field:"col"},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
    {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
    ],
});
```


[Column Calculations](#calculations) [Documentation](https://tabulator.info/docs/6.4/column-calcs)
----------------------------------------------------------------------------

Column calculations can be used to add a row of calculated values to the top or bottom of your table to display information such as the sum of a columns data.

There are two options that can be set in a column definition object to define a calculation, the topCalc option defines a calculation for the top of the column, and the bottomCalc defines a calculation for the bottom of the column. You can define, either, both or neither of the options.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    movableColumns:true,
    columns:[
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress", width:100, sorter:"number", bottomCalc:"avg", bottomCalcParams:{precision:3}},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating", width:80, bottomCalc:"avg"},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", topCalc:"count"},
    ],
});
```


[No Column Headers](#no-header) [Documentation](about:/docs/6.4/columns#header-visibility)
------------------------------------------------------------------------------------------

By setting the headerVisible option to false you can hide the column headers and present the table as a simple list if needed.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    headerVisible:false, //hide header
    columns:[
    {title:"Name", field:"name", width:250},
    {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", formatter:"progress", width:200,  editable:true},
    {title:"Gender", field:"gender", width:150},
    {title:"Rating", field:"rating",  formatter:"star", hozAlign:"center", width:200},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
    {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", width:150},
    ],
});
```


[RTL Text Direction](#rtl) [Documentation](about:/docs/6.4/layout#rtl)
----------------------------------------------------------------------

Tabulator supports both "Right to Left" and "Left To Right" text directions.

By default Tabulator will attempt determine the correct text direction for the table based on the direction CSS property inherited from its parent element.

You can also force the text direction by using the textDirection setup option.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    textDirection:"rtl",
    columns:[
    {title:"Name", field:"name", width:250},
    {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", formatter:"progress", width:200,  editable:true},
    {title:"Gender", field:"gender", width:150},
    {title:"Rating", field:"rating",  formatter:"star", hozAlign:"center", width:200},
    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
    {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", width:150},
    ],
});
```


[AJAX Data Loading](#ajax) [Documentation](about:/docs/6.4/data#ajax)
---------------------------------------------------------------------

Data can be loaded into the table from a remote URL using a JSON formatted string.

If you always request the same URL for your data then you can set it in the ajaxURL option when you create your Tabulator

Click the button below to load sample data via AJAX.

AJAX Controls

Source Code

`HTML`

```html
<div>
    <button id="ajax-trigger">Load Data via AJAX</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    placeholder:"No Data Set",
    columns:[
        {title:"Name", field:"name", sorter:"string", width:200},
        {title:"Progress", field:"progress", sorter:"number", formatter:"progress"},
        {title:"Gender", field:"gender", sorter:"string"},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col", sorter:"string"},
        {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", sorter:"boolean"},
    ],
});

//trigger AJAX load on "Load Data via AJAX" button click
document.getElementById("ajax-trigger").addEventListener("click", function(){
    table.setData("/exampledata/ajax");
});
```


### Server Side PHP

```
//build data array
$data = [
    [id=>1, name=>"Billy Bob", progress=>"12", gender=>"male", height=>1, col=>"red", dob=>"", driver=>1],
    [id=>2, name=>"Mary May", progress=>"1", gender=>"female", height=>2, col=>"blue", dob=>"14/05/1982", driver=>true],
    [id=>3, name=>"Christine Lobowski", progress=>"42", height=>0, col=>"green", dob=>"22/05/1982", driver=>"true"],
    [id=>4, name=>"Brendon Philips", progress=>"125", gender=>"male", height=>1, col=>"orange", dob=>"01/08/1980"],
    [id=>5, name=>"Margret Marmajuke", progress=>"16", gender=>"female", height=>5, col=>"yellow", dob=>"31/01/1999"],
];

//return JSON formatted data
echo(json_encode($data));
```


[AJAX Progressive Loading](#ajax-progressive) [Documentation](about:/docs/6.4/data#ajax-progressive)
----------------------------------------------------------------------------------------------------

You can use the ajaxProgressiveLoad option along with ajaxURL to progressivly load pages of data as the user scrolls down the table.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    ajaxURL:"/exampledata/ajaxprogressive",
    progressiveLoad:"scroll",
    paginationSize:20,
    placeholder:"No Data Set",
    columns:[
        {title:"Name", field:"name", sorter:"string", width:200},
        {title:"Progress", field:"progress", sorter:"number", formatter:"progress"},
        {title:"Gender", field:"gender", sorter:"string"},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col", sorter:"string"},
        {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", sorter:"boolean"},
    ],
});
```


### Server Side PHP

```
//build data array
$data = [
    [id=>1, name=>"Billy Bob", progress=>"12", gender=>"male", height=>1, col=>"red", dob=>"", driver=>1],
    [id=>2, name=>"Mary May", progress=>"1", gender=>"female", height=>2, col=>"blue", dob=>"14/05/1982", driver=>true],
    [id=>3, name=>"Christine Lobowski", progress=>"42", height=>0, col=>"green", dob=>"22/05/1982", driver=>"true"],
    [id=>4, name=>"Brendon Philips", progress=>"125", gender=>"male", height=>1, col=>"orange", dob=>"01/08/1980"],
    [id=>5, name=>"Margret Marmajuke", progress=>"16", gender=>"female", height=>5, col=>"yellow", dob=>"31/01/1999"],
];

//return JSON formatted data
echo(json_encode(["last_page"=>30, "data"=>$data]));
```


[Load Table Data From Local File](#file-load) [Documentation](about:/docs/6.4/data#import)
------------------------------------------------------------------------------------------

Data can be loaded into the table from a local file using the import function.

In the example below we also use the autoColumns feature to generate the column headers from the data as well, but you could just as easily predefine the columns

You could import any standard format spreadsheet _(xlsx, csv, ods)_ you have lying around into the table. Or if you want some sample data to get started [download this sample Excel file to your local computer](https://tabulator.info/sample_data/file_load/data.xlsx).

Then click the button below to load sample data file. If you are using a multi-sheet spreadsheet then it will always be the first sheet that is imported

Table Controls

Source Code

`HTML`

```html
<div>
    <button id="file-load-trigger">Choose File</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:311,
    layout:"fitColumns",
    autoColumns:true,
    placeholder:"Awaiting Data, Please Load File",
});

//trigger AJAX load on "Load Data via AJAX" button click
document.getElementById("file-load-trigger").addEventListener("click", function(){
    table.import("xlsx", [".xlsx", ".csv", ".ods"], "buffer");
});
```


[Create from HTML Table Element](#table-load) [Documentation](about:/docs/6.4/data#table)
-----------------------------------------------------------------------------------------

It is possible to convert a standard HTML Table element into a tabulator, pulling all the data directly from the table into the tabulator when it is created.

If you want to pull the column headers in from the table, you need to make sure that you have defiend a thead element with each column header in a th element. If you specify the width attribute on a header, then this will be set as the width of the column in the tabulator.

You can set any of the standard Tabulator options when you create your table this way, so can easily convert old tables to take advantage of the many features Tabulator has to offer.

### Standard HTML Table:


|Name     |Age|Gender|Height|Favourite Color|Date of Birth|
|---------|---|------|------|---------------|-------------|
|Billy Bob|12 |male  |1     |red            |22/04/1994   |
|Mary May |1  |female|2     |blue           |14/05/1982   |


### Converted to Tabulator:


|Name     |Age|Gender|Height|Favourite Color|Date of Birth|
|---------|---|------|------|---------------|-------------|
|Billy Bob|12 |male  |1     |red            |22/04/1994   |
|Mary May |1  |female|2     |blue           |14/05/1982   |


Source Code

`HTML`

```html
<table id="example-table">
    <thead>
        <tr>
            <th width="200">Name</th>
            <th tabulator-hozAlign="center">Age</th>
            <th>Gender</th>
            <th>Height</th>
            <th width="150">Favourite Color</th>
            <th>Date of Birth</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Billy Bob</td>
            <td>12</td>
            <td>male</td>
            <td>1</td>
            <td>red</td>
            <td>22/04/1994</td>
        </tr>
        <tr>
            <td>Mary May</td>
            <td>1</td>
            <td>female</td>
            <td>2</td>
            <td>blue</td>
            <td>14/05/1982</td>
        </tr>
    </tbody>
</table>
```


`JavaScript`

```javascript
 var table = new Tabulator("#example-table", {});
```


[Data Reactivity](#reactivity) [Documentation](https://tabulator.info/docs/6.4/reactivity)
--------------------------------------------------------------------

Data can be loaded into the table from a remote URL using a JSON formatted string.

If you always request the same URL for your data then you can set it in the ajaxURL option when you create your Tabulator

Click the button below to load sample data via AJAX.

Example Reactivity Controls

Source Code

`HTML`

```html
<div>
    <button id="reactivity-add">Add New Row</button>
    <button id="reactivity-delete">Remove Row</button>
    <button id="reactivity-update">Update First Row Name</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//define data
var tabledata = [
    {id:1, name:"Oli Bob", progress:12, gender:"male", rating:1, col:"red" },
    {id:2, name:"Mary May", progress:1, gender:"female", rating:2, col:"blue" },
    {id:3, name:"Christine Lobowski", progress:42, gender:"female", rating:0, col:"green" },
    {id:4, name:"Brendon Philips", progress:100, gender:"male", rating:1, col:"orange" },
    {id:5, name:"Margret Marmajuke", progress:16, gender:"female", rating:5, col:"yellow"},
];

//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    reactiveData:true, //turn on data reactivity
    data:tabledata, //load data into table
    columns:[
        {title:"Name", field:"name", sorter:"string", width:200},
        {title:"Progress", field:"progress", sorter:"number", formatter:"progress"},
        {title:"Gender", field:"gender", sorter:"string"},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col", sorter:"string"},
    ],
});

//add row to bottom of table on button click
document.getElementById("reactivity-add").addEventListener("click", function(){
    tabledata.push({name:"IM A NEW ROW", progress:100, gender:"male"});
});

//remove bottom row from table on button click
document.getElementById("reactivity-delete").addEventListener("click", function(){
    tabledata.pop();
});

//update name on first row in table on button click
document.getElementById("reactivity-update").addEventListener("click", function(){
    tabledata[0].name = "IVE BEEN UPDATED";
});


```


[Editable Data](#editable) [Documentation](https://tabulator.info/docs/6.4/edit)
----------------------------------------------------------

Using the editable setting on each column, you can make a user editable table.

Any time a cell is edited it triggers the cellEdited callback, to allow you to process any changes.

You can call the getData method to get an array of all of the tables data, including any edits

This table features a range of editors:

*   an input editor on the name column
*   a list editor setup as an autocomplete on the location column, loading its list from the unique column values
*   a progress editor on the progres column
*   a list editor setup as a select list on the gender column, loading its list from a set of predefined values
*   a star editor on the rating column
*   a custom date editor on the date of birth column
*   a checkbox editor on the driver column

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//Create Date Editor
var dateEditor = function(cell, onRendered, success, cancel){
    //cell - the cell component for the editable cell
    //onRendered - function to call when the editor has been rendered
    //success - function to call to pass thesuccessfully updated value to Tabulator
    //cancel - function to call to abort the edit and return to a normal cell

    //create and style input
    var cellValue = luxon.DateTime.fromFormat(cell.getValue(), "dd/MM/yyyy").toFormat("yyyy-MM-dd"),
    input = document.createElement("input");

    input.setAttribute("type", "date");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;

    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    function onChange(){
        if(input.value != cellValue){
            success(luxon.DateTime.fromFormat(input.value, "yyyy-MM-dd").toFormat("dd/MM/yyyy"));
        }else{
            cancel();
        }
    }

    //submit new value on blur or change
    input.addEventListener("blur", onChange);

    //submit new value on enter
    input.addEventListener("keydown", function(e){
        if(e.keyCode == 13){
            onChange();
        }

        if(e.keyCode == 27){
            cancel();
        }
    });

    return input;
};


//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    columns:[
        {title:"Name", field:"name", width:150, editor:"input"},
        {title:"Location", field:"location", width:130, editor:"list", editorParams:{autocomplete:"true", allowEmpty:true,listOnEmpty:true, valuesLookup:true}},
        {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", formatter:"progress", width:140, editor:true},
        {title:"Gender", field:"gender", editor:"list", editorParams:{values:{"male":"Male", "female":"Female", "unknown":"Unknown"}}},
        {title:"Rating", field:"rating",  formatter:"star", hozAlign:"center", width:100, editor:true},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", width:140, editor:dateEditor},
        {title:"Driver", field:"car", hozAlign:"center", editor:true, formatter:"tickCross"},
    ],
});
```


[Validate User Input](#validation) [Documentation](https://tabulator.info/docs/6.4/validate)
----------------------------------------------------------------------

You can set validators on columns to ensure that any user input into your editable cells matches your requirements.

Validators can be applied by using the validator property in a columns definition object.

If the validation fails the tabulator-validation-fail class will be applied to the cell and the validationFailed callback will be triggered. The user will not be able to leave the cell until they input a valid value or cancel the edit _(press escape)_.

The table below has the following validators applied to its columns:

*   **Name** - the field is required, it must have a value
*   **Progress** - minimum value of 0, maximum value of 100, must be a valid number
*   **Gender** - value must be either "male" or "female" and is required
*   **Rating** - minimum value of 0, maximum value of 5, must be a valid integer
*   **Favourite Colour** - minimum string length of 3, maximum string length of 10, bust be a string not a number

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columns:[
        {title:"Name", field:"name", width:150, editor:"input", validator:"required"},
        {title:"Progress", field:"progress", sorter:"number", hozAlign:"left", editor:"input", editor:true,  validator:["min:0", "max:100", "numeric"]},
        {title:"Gender", field:"gender", editor:"input", validator:["required", "in:male|female"]},
        {title:"Rating", field:"rating",  editor:"input", hozAlign:"center", width:100, editor:"input", validator:["min:0", "max:5", "integer"]},
        {title:"Favourite Color", field:"col", editor:"input", validator:["minLength:3", "maxLength:10", "string"]},
    ],
});

//handle validation failure
table.on("validationFailed", function(cell, value, validators){
    //cell - cell component for the edited cell
    //value - the value that failed validation
    //validatiors - an array of validator objects that failed

    //take action on validation fail
});

```


[Filter Data](#filter) [Documentation](https://tabulator.info/docs/6.4/filter)
--------------------------------------------------------

Tabulator allows you to filter the table data by any field in the data set.

To set a filter you need to call the setFilter method, passing the field you wish to filter, the comparison type and the value to filter for

Tabulator comes with a number of filter comparison types including:

*   **\=** - Displays only rows with data that is the same as the filter
*   **<** - displays rows with a value less than the filter value
*   **<=** - displays rows with a value less than or qual to the filter value
*   **\>** - displays rows with a value greater than the filter value
*   **\>=** - displays rows with a value greater than or qual to the filter value
*   **!=** - displays rows with a value that is not equal to the filter value
*   **like** - displays any rows with data that contains the specified string anywhere in the specified field. (case insensitive)

Filter Parameters

Field: Type: Value:

Source Code

`HTML`

```html
<div>
  <select id="filter-field">
    <option></option>
    <option value="name">Name</option>
    <option value="progress">Progress</option>
    <option value="gender">Gender</option>
    <option value="rating">Rating</option>
    <option value="col">Favourite Colour</option>
    <option value="dob">Date Of Birth</option>
    <option value="car">Drives</option>
    <option value="function">Drives & Rating < 3</option>
  </select>

  <select id="filter-type">
    <option value="=">=</option>
    <option value="<"><</option>
    <option value="<="><=</option>
    <option value=">">></option>
    <option value=">=">>=</option>
    <option value="!=">!=</option>
    <option value="like">like</option>
  </select>

  <input id="filter-value" type="text" placeholder="value to filter">

  <button id="filter-clear">Clear Filter</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Define variables for input elements
var fieldEl = document.getElementById("filter-field");
var typeEl = document.getElementById("filter-type");
var valueEl = document.getElementById("filter-value");

//Custom filter example
function customFilter(data){
    return data.car && data.rating < 3;
}

//Trigger setFilter function with correct parameters
function updateFilter(){
  var filterVal = fieldEl.options[fieldEl.selectedIndex].value;
  var typeVal = typeEl.options[typeEl.selectedIndex].value;

  var filter = filterVal == "function" ? customFilter : filterVal;

  if(filterVal == "function" ){
    typeEl.disabled = true;
    valueEl.disabled = true;
  }else{
    typeEl.disabled = false;
    valueEl.disabled = false;
  }

  if(filterVal){
    table.setFilter(filter,typeVal, valueEl.value);
  }
}

//Update filters on value change
document.getElementById("filter-field").addEventListener("change", updateFilter);
document.getElementById("filter-type").addEventListener("change", updateFilter);
document.getElementById("filter-value").addEventListener("keyup", updateFilter);

//Clear filters on "Clear Filters" button click
document.getElementById("filter-clear").addEventListener("click", function(){
  fieldEl.value = "";
  typeEl.value = "=";
  valueEl.value = "";

  table.clearFilter();
});

//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columns:[
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress", formatter:"progress", sorter:"number"},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
    ],
});
```


[Filter Data In Header](#filter-header) [Documentation](about:/docs/6.4/filter#header)
--------------------------------------------------------------------------------------

By settting the headerFilter parameter for a column you can add column based filtering directly into your table.

See the documentation for [Header Filtering](about:/docs/6.4/filter#header-filters) for more information.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//custom max min header filter
var minMaxFilterEditor = function(cell, onRendered, success, cancel, editorParams){

    var end;

    var container = document.createElement("span");

    //create and style inputs
    var start = document.createElement("input");
    start.setAttribute("type", "number");
    start.setAttribute("placeholder", "Min");
    start.setAttribute("min", 0);
    start.setAttribute("max", 100);
    start.style.padding = "4px";
    start.style.width = "50%";
    start.style.boxSizing = "border-box";

    start.value = cell.getValue();

    function buildValues(){
        success({
            start:start.value,
            end:end.value,
        });
    }

    function keypress(e){
        if(e.keyCode == 13){
            buildValues();
        }

        if(e.keyCode == 27){
            cancel();
        }
    }

    end = start.cloneNode();
    end.setAttribute("placeholder", "Max");

    start.addEventListener("change", buildValues);
    start.addEventListener("blur", buildValues);
    start.addEventListener("keydown", keypress);

    end.addEventListener("change", buildValues);
    end.addEventListener("blur", buildValues);
    end.addEventListener("keydown", keypress);


    container.appendChild(start);
    container.appendChild(end);

    return container;
 }

//custom max min filter function
function minMaxFilterFunction(headerValue, rowValue, rowData, filterParams){
    //headerValue - the value of the header filter element
    //rowValue - the value of the column in this row
    //rowData - the data for the row being filtered
    //filterParams - params object passed to the headerFilterFuncParams property

        if(rowValue){
            if(headerValue.start != ""){
                if(headerValue.end != ""){
                    return rowValue >= headerValue.start && rowValue <= headerValue.end;
                }else{
                    return rowValue >= headerValue.start;
                }
            }else{
                if(headerValue.end != ""){
                    return rowValue <= headerValue.end;
                }
            }
        }

    return true; //must return a boolean, true if it passes the filter.
}


var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columns:[
        {title:"Name", field:"name", width:150, headerFilter:"input"},
        {title:"Progress", field:"progress", width:150, formatter:"progress", sorter:"number", headerFilter:minMaxFilterEditor, headerFilterFunc:minMaxFilterFunction, headerFilterLiveFilter:false},
        {title:"Gender", field:"gender", editor:"list", editorParams:{values:{"male":"Male", "female":"Female", clearable:true}}, headerFilter:true, headerFilterParams:{values:{"male":"Male", "female":"Female", "":""}, clearable:true}},
        {title:"Rating", field:"rating", editor:"star", hozAlign:"center", width:100, headerFilter:"number", headerFilterPlaceholder:"at least...", headerFilterFunc:">="},
        {title:"Favourite Color", field:"col", editor:"input", headerFilter:"list", headerFilterParams:{valuesLookup:true, clearable:true}},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date",  headerFilter:"input"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross",  headerFilter:"tickCross",  headerFilterParams:{"tristate":true},headerFilterEmptyCheck:function(value){return value === null}},
    ],
});
```


[Sorters](#sorters) [Documentation](https://tabulator.info/docs/6.4/sort)
---------------------------------------------------

By default Tabulator will attempt to guess which sorter should be applied to a column based on the data contained in the first row. It can determine sorters for strings, numbers, alphanumeric sequences and booleans, anything else will be treated as a string.

*   **string** - sorts column as strings of characters
*   **number** - sorts column as numbers (integer or float, will also handle numbers using "," separators)
*   **alphanum** - sorts column as alpha numeric code
*   **boolean** - sorts column as booleans
*   **date** - sorts column as dates
*   **time** - sorts column as times

To specify a sorter to be used on a column use the param property in the columns definition object

You can define a custom sorter functions in the sorter option if you need bespoke sorting functionality.

You can programmatically trigger a sort using the sort function.

Clicking on a column header will also trigger a sort of that column. You can sort by multiple columns by holding the ctrl or shift key when clicking on column headers.

Programmatic Sort Parameters

Field: Direction:

Source Code

`HTML`

```html
<div>
      <select id="sort-field">
          <option value="name" selected>Name</option>
          <option value="progress">Progress</option>
          <option value="gender">Gender</option>
          <option value="rating">Rating</option>
          <option value="col">Favourite Colour</option>
          <option value="dob">Date Of Birth</option>
          <option value="car">Driver</option>
      </select>

      <select id="sort-direction">
          <option value="asc" selected>asc</option>
          <option value="desc">desc</option>
      </select>

    <button id="sort-trigger">Trigger Sort</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Define variables for input elements
var fieldEl = document.getElementById("sort-field");
var dirEl = document.getElementById("sort-direction");

//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columns:[
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress", hozAlign:"right", headerSortTristate:true},
        {title:"Gender", field:"gender", sorter:"string"},
        {title:"Rating", field:"rating",  hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col", sorter:function(a,b){
            return String(a).toLowerCase().localeCompare(String(b).toLowerCase());
        }},
        {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
        {title:"Driver", field:"car", hozAlign:"center", sorter:"boolean"},
    ],
});

//Trigger sort when "Trigger Sort" button is clicked
document.getElementById("sort-trigger").addEventListener("click", function(){
   table.setSort(fieldEl.options[fieldEl.selectedIndex].value, dirEl.options[dirEl.selectedIndex].value);
});
```


[Grouping Data](#grouping) [Documentation](https://tabulator.info/docs/6.4/group)
-----------------------------------------------------------

You can group rows together using the groupBy option. To group by a field, set this option to the name of the field.

To group by more complex operations you should pass a function that returns a string that represents the group.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    movableRows:true,
    groupBy:"gender",
    columns:[
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress", formatter:"progress", sorter:"number"},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
    ],
});
```


[Pagination](#pagination) [Documentation](https://tabulator.info/docs/6.4/page)
---------------------------------------------------------

Tabulator allows you to paginate your data. simply set the pagination property to true.

If you have set the height of the table then the data will be automatically paginated to fit within the table.

If you wish to define how many rows should be shown on a page, set this in the paginationSize property. If you set the paginationSize without setting the height, the Tabulator will automatically resize to fit the data

If you want to show a count of the number of rows currently displayed in the footer rows you can use the paginationCounter property. There are a number of built-in pagination counters available for use.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    layout:"fitColumns",
    pagination:"local",
    paginationSize:6,
    paginationSizeSelector:[3, 6, 8, 10],
    movableColumns:true,
    paginationCounter:"rows",
    columns:[
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress", formatter:"progress", sorter:"number"},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
    ],
});
```


[Selectable Rows](#selectable) [Documentation](https://tabulator.info/docs/6.4/select)
----------------------------------------------------------------

Using the selectableRows option, you can allow users to select rows in the table via a number of different routes:

*   Clicking on a row, to toggle its state.
*   Holding down the shift key and click dragging over a number of rows to toggle the state of all rows the cursor passes over.
*   Programmatically with the selectRow and deselectRow functions.

Selection Controls

**Selected: 0**

Source Code

`HTML`

```html
<div>
    <button id="select-row">Select "Oli Bob"</button>
    <button id="deselect-row">Deselect "Oli Bob"</button>
    <button id="select-all">Select All</button>
    <button id="deselect-all">Deselect All</button>

    <span id="select-stats"></span>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    selectableRows:true, //make rows selectable
    columns:[
	    {title:"Name", field:"name", width:200},
	    {title:"Progress", field:"progress", width:100, hozAlign:"right", sorter:"number"},
	    {title:"Gender", field:"gender", width:100},
	    {title:"Rating", field:"rating", hozAlign:"center", width:80},
	    {title:"Favourite Color", field:"col"},
	    {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
	    {title:"Driver", field:"car", hozAlign:"center", width:100},
    ],
});

table.on("rowSelectionChanged", function(data, rows){
  document.getElementById("select-stats").innerHTML = data.length;
});

//select row on "select" button click
document.getElementById("select-row").addEventListener("click", function(){
    table.selectRow(1);
});

//deselect row on "deselect" button click
document.getElementById("deselect-row").addEventListener("click", function(){
    table.deselectRow(1);
});

//select row on "select all" button click
document.getElementById("select-all").addEventListener("click", function(){
    table.selectRow();
});

//deselect row on "deselect all" button click
document.getElementById("deselect-all").addEventListener("click", function(){
    table.deselectRow();
});
```


[Selectable Rows With Tickbox](#selectable-tick) [Documentation](https://tabulator.info/docs/6.4/select)
----------------------------------------------------------------------------------

By using the rowSelection formatter in the row header, you can create a table with rows selectable using a tickbox. The tickbox in the column header allows for toggling the selection of all rows in the table.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    rowHeader:{headerSort:false, resizable: false, frozen:true, headerHozAlign:"center", hozAlign:"center", formatter:"rowSelection", titleFormatter:"rowSelection", cellClick:function(e, cell){
      cell.getRow().toggleSelect();
    }},
    columns:[
      {title:"Name", field:"name", width:200},
      {title:"Progress", field:"progress", width:100, hozAlign:"right", sorter:"number"},
      {title:"Gender", field:"gender", width:100},
      {title:"Rating", field:"rating", hozAlign:"center", width:80},
      {title:"Favourite Color", field:"col"},
      {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
      {title:"Driver", field:"car", hozAlign:"center", width:100},
    ],
});

```


[Selectable Cell Range](#range) [Documentation](https://tabulator.info/docs/6.4/range)
----------------------------------------------------------------

Using the selectableRange option, you can allow users to select a range of cells in the table

Try some of the following on the table below:

*   **Select a range** - Click and drag across multiple cells
*   **Navigate the table** - Click on a cell and use the arrow keys to navigate round the table
*   **Expand a range** - After selecting a range hold down the shift key and either drag the mouse or use the arrow keys to change the size of the selected range
*   **Multiple Ranges** - After selecting a range, hold down the crtl key and click and drag to select additional ranges.
*   **Programatically Add Ranges** - Click the "Select Range" button to programmatically add ranges with the addRange function.

Selection Controls

Source Code

`HTML`

```html
<div>
    <button id="select-range">Select Range</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    selectableRange:true,
    selectableRangeColumns:true,
    selectableRangeRows:true,
    rowHeader:{resizable: false, frozen: true, hozAlign:"center", formatter: "rownum", cssClass:"range-header-col"},
    columnDefaults:{
      headerSort:false,
      resizable:"header",
    },
    columns:[
      {title:"Name", field:"name", width:200},
      {title:"Progress", field:"progress", width:100, hozAlign:"right", sorter:"number"},
      {title:"Gender", field:"gender", width:100},
      {title:"Rating", field:"rating", hozAlign:"center", width:80},
      {title:"Favourite Color", field:"col"},
      {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
      {title:"Driver", field:"car", hozAlign:"center", width:100},
    ],
});

//select row on "select" button click
document.getElementById("select-range").addEventListener("click", function(){
    var topLeft = table.getRows()
[3].getCells()
[2];
    var bottomRight = table.getRows()
[5].getCells()
[5];

    table.addRange(topLeft, bottomRight);
});
```


[Selectable Cell Range with Clipboard](#range-clipboard) [Documentation](about:/docs/6.4/range#clipboard)
---------------------------------------------------------------------------------------------------------

By using the selectableRange option, along with the clipboard, and edit modules you can create a table that allows for bulk copying and pasting of data across the table.

Try some of the following on the table below:

*   **Editing a cell** - Double click on a cell or focus on a cell and press the enter key
*   **Copy a cell** - Click on a cell with a value in, press ctrl+c click on another cell and press ctrl+v
*   **Navigate the table** - Click on a cell and use the arrow keys to navigate round the table
*   **Select a range** - Click and drag across multiple cells
*   **Expand a range** - After selecting a range hold down the shift key and either drag the mouse or use the arrow keys to change the size of the selected range
*   **Copy a range** - After selecting a range, press ctrl+c then click on a different cell and press ctrl+v to paste the range starting from that cell
*   **Paste to fill** - Select a cell or range with values in, press ctrl+c then select a different size range _(more than one cell)_ and press ctrl+v. Notice how it pastes the data to fill the range, either duplicating rows and columns as needed, or hiding data that wont fit.
*   **Duplicating a column** - Click on a column header to select a whole column, press ctrl+c, click into another column header and press ctrl+v
*   **Duplicating a row** - Click on a row header to select a whole row, press ctrl+c, click into another row header and press ctrl+v

Selection Controls

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    data:exampleData,

    //enable range selection
    selectableRange:1,
    selectableRangeColumns:true,
    selectableRangeRows:true,
    selectableRangeClearCells:true,

    //change edit trigger mode to make cell navigation smoother
    editTriggerEvent:"dblclick",

    //configure clipboard to allow copy and paste of range format data
    clipboard:true,
    clipboardCopyStyled:false,
    clipboardCopyConfig:{
        rowHeaders:false,
        columnHeaders:false,
    },
    clipboardCopyRowRange:"range",
    clipboardPasteParser:"range",
    clipboardPasteAction:"range",

    rowHeader:{resizable: false, frozen: true, width:40, hozAlign:"center", formatter: "rownum", cssClass:"range-header-col", editor:false},

    //setup cells to work as a spreadsheet
    columnDefaults:{
        headerSort:false,
        headerHozAlign:"center",
        editor:"input",
        resizable:"header",
        width:100,
    },
    columns:[
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress", width:100, hozAlign:"right", sorter:"number"},
        {title:"Gender", field:"gender", width:100},
        {title:"Rating", field:"rating", hozAlign:"center", width:80},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", width:100},
    ],
});
```


[Spreadsheet](#spreadsheet) [Documentation](https://tabulator.info/docs/6.4/spreadsheet)
------------------------------------------------------------------

The spreadheet module will create a standard grid of numbered rows and letter columns of any size needed, and allow you to pass in and extract array formatted data using the spreadsheetData prop.

Setting the rowHeader to use a field value of \_id will allow it to pickup the numbers for each of the spreadsheet rows.

The spreadsheet module works differently than other modules and provides its own functions for loading and retrieving spreadsheet formatted data from the table

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//define an array of spreasheet data
var sheetData = [
  [9937,	"",	"",	7749,	9816,	4355,	8279,	"",	""],
  [2380,	"",	6977,	8896,	4012,	3803,	5408,	3415,	3056],
  [9180,	"",	39,	9445,	3917,	"",	18,	5239,	2516],
  [1924,	8734,	1819,	1838,	2330,	7921,	9219,	"",	3537],
  ["",	8665,	5875,	9732,	1926,	"",	9743,	8388,   ""],
  [7040,	4861,	2988,	5584,	2344,	9749,	8872,	9177,	6246],
  [6334,	1674,	2967,	"",	9353,	396,	6006,	8572 , ""],
  [6359,	"",	2580,	5723,	9801,	554,	1044,	5266,	8532],
  [7278,	6971,	2232,	5720,	5665,	7231,	1165,	"",	168],
];
  
//Build Tabulator
var table = new Tabulator("#example-table", {
  height:"311px",

  spreadsheet:true,
  spreadsheetRows:10,
  spreadsheetColumns:10,
  spreadsheetColumnDefinition:{editor:"input"},
  spreadsheetData:sheetData,

  rowHeader:{field:"_id", hozAlign:"center", headerSort:false, frozen:true},

  editorEmptyValue:undefined, //ensure empty values are set to undefined so they arent included in spreadsheet output data
});
```


[Multisheet Spreadsheet](#spreadsheet-multisheet) [Documentation](about:/docs/6.4/spreadsheet#multisheet)
---------------------------------------------------------------------------------------------------------

By using the spreadsheetSheets prop, we can pass in an array of multiple sheet definitions to load multiple sheets of data into the table

We can then display a series of tabs in the table footer using the spreadsheetSheetTabs option, to allow the user to switch between sheets

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//define an array of sheet definitions
var sheets = [
    {
      title:"First Sheet",
      key:"first",
      rows:20,
      columns:20,
      data:[
        [9937,	"",	"",	7749,	9816,	4355,	8279,	"",	""],
        [2380,	"",	6977,	8896,	4012,	3803,	5408,	3415,	3056],
        [9180,	"",	39,	9445,	3917,	"",	18,	5239,	2516],
        [1924,	8734,	1819,	1838,	2330,	7921,	9219,	"",	3537],
      ]
  },
  {
      title:"Second Sheet",
      key:"second",
      data:[
        [2380,	"",	6977,	8896,	4012,	3803,	5408,	3415,	3056],
        [9180,	"",	39,	9445,	3917,	"",	18,	5239,	2516],
        [1924,	8734,	1819,	1838,	2330,	7921,	9219,	"",	3537],
        ["",	8665,	5875,	9732,	1926,	"",	9743,	8388,   ""],
        [7040,	4861,	2988,	5584,	2344,	9749,	8872,	9177,	6246],
        [6334,	1674,	2967,	"",	9353,	396,	6006,	8572 , ""],
        [6359,	"",	2580,	5723,	9801,	554,	1044,	5266,	8532],
      ]
  },
  {
      title:"Third Sheet",
      key:"third",
      rows:5,
      columns:5,
      data:[
        [1924,	8734,	1819,	1838,	2330,	7921,	9219,	"",	3537],
        ["",	8665,	5875,	9732,	1926,	"",	9743,	8388,   ""],
        [7040,	4861,	2988,	5584,	2344,	9749,	8872,	9177,	6246],
        [6334,	1674,	2967,	"",	9353,	396,	6006,	8572 , ""],
        [6359,	"",	2580,	5723,	9801,	554,	1044,	5266,	8532],
        [7278,	6971,	2232,	5720,	5665,	7231,	1165,	"",	168],
      ]
  },
];
    
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",

    spreadsheet:true,
    spreadsheetRows:10,
    spreadsheetColumns:10,
    spreadsheetColumnDefinition:{editor:"input"},
    spreadsheetSheets:sheets,
    spreadsheetSheetTabs:true,

    rowHeader:{field:"_id", hozAlign:"center", headerSort:false, frozen:true},

    editorEmptyValue:undefined, //ensure empty values are set to undefined so they arent included in spreadsheet output data
});
```


[Spreadsheet with Clipboard](#spreadsheet-clipboard) [Documentation](about:/docs/6.4/spreadsheet#clipboard)
-----------------------------------------------------------------------------------------------------------

By using the spreadsheet option, along with the clipboard, and edit modules you can create a fully functional spreadsheet that allows for bulk copying and pasting of data between cells and sheets.

Try some of the following on the table below:

*   **Editing a cell** - Double click on a cell or focus on a cell and press the enter key
*   **Copy a cell** - Click on a cell with a value in, press ctrl+c click on another cell and press ctrl+v
*   **Navigate the table** - Click on a cell and use the arrow keys to navigate round the table
*   **Select a range** - Click and drag across multiple cells
*   **Expand a range** - After selecting a range hold down the shift key and either drag the mouse or use the arrow keys to change the size of the selected range
*   **Copy a range** - After selecting a range, press ctrl+c then click on a different cell and press ctrl+v to paste the range starting from that cell
*   **Paste to fill** - Select a cell or range with values in, press ctrl+c then select a different size range _(more than one cell)_ and press ctrl+v. Notice how it pastes the data to fill the range, either duplicating rows and columns as needed, or hiding data that wont fit.
*   **Duplicating a column** - Click on a column header to select a whole column, press ctrl+c, click into another column header and press ctrl+v
*   **Duplicating a row** - Click on a row header to select a whole row, press ctrl+c, click into another row header and press ctrl+v

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//define an array of sheet definitions
var sheets = [
    {
      title:"First Sheet",
      key:"first",
      rows:20,
      columns:20,
      data:[
        [9937,	"",	"",	7749,	9816,	4355,	8279,	"",	""],
        [2380,	"",	6977,	8896,	4012,	3803,	5408,	3415,	3056],
        [9180,	"",	39,	9445,	3917,	"",	18,	5239,	2516],
        [1924,	8734,	1819,	1838,	2330,	7921,	9219,	"",	3537],
      ]
  },
  {
      title:"Second Sheet",
      key:"second",
      data:[
        [2380,	"",	6977,	8896,	4012,	3803,	5408,	3415,	3056],
        [9180,	"",	39,	9445,	3917,	"",	18,	5239,	2516],
        [1924,	8734,	1819,	1838,	2330,	7921,	9219,	"",	3537],
        ["",	8665,	5875,	9732,	1926,	"",	9743,	8388,   ""],
        [7040,	4861,	2988,	5584,	2344,	9749,	8872,	9177,	6246],
        [6334,	1674,	2967,	"",	9353,	396,	6006,	8572 , ""],
        [6359,	"",	2580,	5723,	9801,	554,	1044,	5266,	8532],
      ]
  },
  {
      title:"Third Sheet",
      key:"third",
      rows:5,
      columns:5,
      data:[
        [1924,	8734,	1819,	1838,	2330,	7921,	9219,	"",	3537],
        ["",	8665,	5875,	9732,	1926,	"",	9743,	8388,   ""],
        [7040,	4861,	2988,	5584,	2344,	9749,	8872,	9177,	6246],
        [6334,	1674,	2967,	"",	9353,	396,	6006,	8572 , ""],
        [6359,	"",	2580,	5723,	9801,	554,	1044,	5266,	8532],
        [7278,	6971,	2232,	5720,	5665,	7231,	1165,	"",	168],
      ]
  },
];
    
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",

    spreadsheet:true,
    spreadsheetRows:50,
    spreadsheetColumns:50,
    spreadsheetColumnDefinition:{editor:"input", resizable:"header"},
    spreadsheetSheets:sheets,
    spreadsheetSheetTabs:true,

    rowHeader:{field:"_id", hozAlign:"center", headerSort:false, frozen:true},

    editTriggerEvent:"dblclick", //change edit trigger mode to make cell navigation smoother
    editorEmptyValue:undefined, //ensure empty values are set to undefined so they arent included in spreadsheet output data

    //enable range selection
    selectableRange:1,
    selectableRangeColumns:true,
    selectableRangeRows:true,
    selectableRangeClearCells:true,
    
    //configure clipboard to allow copy and paste of range format data
    clipboard:true,
    clipboardCopyStyled:false,
    clipboardCopyConfig:{
        rowHeaders:false,
        columnHeaders:false,
    },
    clipboardCopyRowRange:"range",
    clipboardPasteParser:"range",
    clipboardPasteAction:"range",
});
```


[Add / Delete Rows](#adddel) [Documentation](about:/docs/6.4/update#row)
------------------------------------------------------------------------

Tablulator allows you to add new rows, delete existing rows and clear all table data with ease.

Row Controls

Source Code

`HTML`

```html
<div>
    <button id="add-row">Add Blank Row to bottom</button>
    <button id="del-row">Remove Row "Oli Bob"</button>
    <button id="clear">Empty the table</button>
    <button id="reset">Reset</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    addRowPos:"bottom",
    columns:[
        {title:"Name", field:"name", width:200, editor:"input"},
        {title:"Progress", field:"progress", width:100, hozAlign:"right", sorter:"number", editor:"input"},
        {title:"Gender", field:"gender", editor:"input"},
        {title:"Rating", field:"rating", hozAlign:"center", width:80, editor:"input"},
        {title:"Favourite Color", field:"col", editor:"input"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date", editor:"input"},
        {title:"Driver", field:"car", hozAlign:"center", editor:"input"},
    ],
});

//Add row on "Add Row" button click
document.getElementById("add-row").addEventListener("click", function(){
    table.addRow({});
});

//Delete row on "Delete Row" button click
document.getElementById("del-row").addEventListener("click", function(){
    table.deleteRow(1);
});

//Clear table on "Empty the table" button click
document.getElementById("clear").addEventListener("click", function(){
    table.clearData()
});

//Reset table contents on "Reset the table" button click
document.getElementById("reset").addEventListener("click", function(){
    table.setData(tabledata);
});
```


[Movable Rows](#movable) [Documentation](https://tabulator.info/docs/6.4/move)
--------------------------------------------------------

Using the movableRows property you can allow the user to move rows around the table by clicking and dragging.

By default this allows the user to drag anywhere on the row, in this example we use the rowHandle property in the column definition for the row header to create a row handle that can be used for dragging rows.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    movableRows:true,
    rowHeader:{headerSort:false, resizable: false, minWidth:30, width:30, rowHandle:true, formatter:"handle"},
    columns:[
        {title:"Name", field:"name", width:150},
        {title:"Progress", field:"progress", formatter:"progress", sorter:"number"},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating", formatter:"star", formatterParams:{stars:6}, hozAlign:"center", width:120},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
    ],
});

//listen for row move
table.on("rowMoved", function(row){
    console.log("Row: " + row.getData().name + " has been moved");
});
```


[Movable Rows With Row Groups](#movable-groups) [Documentation](https://tabulator.info/docs/6.4/move)
-------------------------------------------------------------------------------

By using the groupValues property to define a series of groups, you can create a table that allows users to drag rows between groups, including empty groups.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    movableRows:true,
    rowHeader:{headerSort:false, resizable: false, minWidth:30, width:30, rowHandle:true, formatter:"handle"},
    groupBy:"col",
    groupValues:[["green", "blue", "purple"]],
    columns:[
        {title:"Name", field:"name", width:150},
        {title:"Progress", field:"progress", formatter:"progress", sorter:"number"},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating", formatter:"star", formatterParams:{stars:6}, hozAlign:"center", width:120},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
    ],
});
```


[Movable Rows Between Tables](#movable-between-tables) [Documentation](about:/docs/6.4/move#rows-table)
-------------------------------------------------------------------------------------------------------

Using the movableRowsConnectedTables property you can set the tables that can receive rows from another table.

In the example below, try dragging rows from the left table to the right table.

Source Code

`HTML`

```html
<div id="example-table-sender"></div>
```


```
<div id="example-table-receiver"></div>
```


`JavaScript`

```javascript
//Table to move rows from
var table = new Tabulator("#example-table-sender", {{
    height:311,
    layout:"fitColumns",
    movableRows:true,
    movableRowsConnectedTables:"#example-table-receiver",
    movableRowsReceiver: "add",
    movableRowsSender: "delete",
    placeholder:"All Rows Moved",
    data:tabledata,
    columns:[
        {title:"Name", field:"name"},
    ],
});

//Table to move rows to
var table = new Tabulator("#example-table-receiver", {
    height:311,
    layout:"fitColumns",
    placeholder:"Drag Rows Here",
    data:[],
    columns:[
        {title:"Name", field:"name"},
    ],
});
```


[Movable Rows Between Elements](#movable-between-elements) [Documentation](about:/docs/6.4/move#rows-element)
-------------------------------------------------------------------------------------------------------------

Using the movableRowsConnectedElements property you can set the elements that can receive rows from a table.

In the example below, try dragging rows from the left table to the element on the right.

Drag Rows Here

Source Code

`HTML`

```html
<div id="example-table"></div>
```


```
<ul id="drop-element"></ul>
```


`JavaScript`

```javascript
//Table to move rows from
var table = new Tabulator("#example-table", {
	height:311,
	layout:"fitColumns",
	movableRows: true, //enable movable rows
	movableRowsConnectedElements: "#drop-element", //element to receive rows
	data:tabledata,
	columns:[
		{title:"Name", field:"name"},
	],
});

//listen for row to be dropped on element
table.on("movableRowsElementDrop", function(e, element, row){
	//e - mouseup event object
	//element - node object for the element that the row was dropped onto
	//row - row component for the row that was moved

	//add a li to the drop element containing the name property from the row data
	var li = document.createElement("li");
	li.textContent = row.getData().name;
	element.appendChild(li);
});

```


[Menus](#menu) [Documentation](https://tabulator.info/docs/6.4/menu)
----------------------------------------------

Tabulator provides several different options for adding menues to your table.

In this example the headerMenu column definition option is used to add a column visibility toggle menu to column headers.

In this example the rowContextMenu option is used to add a right click context menu to rows.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//define row context menu contents
var rowMenu = [
    {
        label:"<i class='fas fa-user'></i> Change Name",
        action:function(e, row){
            row.update({name:"Steve Bobberson"});
        }
    },
    {
        label:"<i class='fas fa-check-square'></i> Select Row",
        action:function(e, row){
            row.select();
        }
    },
    {
        separator:true,
    },
    {
        label:"Admin Functions",
        menu:[
            {
                label:"<i class='fas fa-trash'></i> Delete Row",
                action:function(e, row){
                    row.delete();
                }
            },
            {
                label:"<i class='fas fa-ban'></i> Disabled Option",
                disabled:true,
            },
        ]
    }
]

//define column header menu as column visibility toggle
var headerMenu = function(){
    var menu = [];
    var columns = this.getColumns();

    for(let column of columns){

        //create checkbox element using font awesome icons
        let icon = document.createElement("i");
        icon.classList.add("fas");
        icon.classList.add(column.isVisible() ? "fa-check-square" : "fa-square");

        //build label
        let label = document.createElement("span");
        let title = document.createElement("span");

        title.textContent = " " + column.getDefinition().title;

        label.appendChild(icon);
        label.appendChild(title);

        //create menu item
        menu.push({
            label:label,
            action:function(e){
                //prevent menu closing
                e.stopPropagation();

                //toggle current column visibility
                column.toggle();

                //change menu item icon
                if(column.isVisible()){
                    icon.classList.remove("fa-square");
                    icon.classList.add("fa-check-square");
                }else{
                    icon.classList.remove("fa-check-square");
                    icon.classList.add("fa-square");
                }
            }
        });
    }

   return menu;
};

//initialize table
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    rowContextMenu: rowMenu, //add context menu to rows
    columns:[
        {title:"Name", field:"name", headerMenu:headerMenu},
        {title:"Progress", field:"progress", hozAlign:"right", sorter:"number", headerMenu:headerMenu},
        {title:"Gender", field:"gender", headerMenu:headerMenu},
        {title:"Rating", field:"rating", hozAlign:"center", headerMenu:headerMenu},
        {title:"Favourite Color", field:"col", headerMenu:headerMenu},
    ],
});
```


[Popups](#popup) [Documentation](about:/docs/6.4/menu#popup)
------------------------------------------------------------

Tabulator provides several different options for adding popups to your table, these function in a similar way to menus but allow you to add custom content to the popup element

In this example the rowClickPopup option is used to add a details popup of a row when it is clicked.

The headerPopup and headerPopupIcon options are also used in the column definition to add an icon to the column header that you can click on to filter the column.

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
//create row popup contents
var rowPopupFormatter = function(e, row, onRendered){
    var data = row.getData(),
    container = document.createElement("div"),
    contents = "<strong style='font-size:1.2em;'>Row Details</strong><br/><ul style='padding:0;  margin-top:10px; margin-bottom:0;'>";
    contents += "<li><strong>Name:</strong> " + data.name + "</li>";
    contents += "<li><strong>Gender:</strong> " + data.gender + "</li>";
    contents += "<li><strong>Favourite Colour:</strong> " + data.col + "</li>";
    contents += "</ul>";

    container.innerHTML = contents;

    return container;
};

//create header popup contents
var headerPopupFormatter = function(e, column, onRendered){
    var container = document.createElement("div");

    var label = document.createElement("label");
    label.innerHTML = "Filter Column:";
    label.style.display = "block";
    label.style.fontSize = ".7em";

    var input = document.createElement("input");
    input.placeholder = "Filter Column...";
    input.value = column.getHeaderFilterValue() || "";

    input.addEventListener("keyup", (e) => {
        column.setHeaderFilterValue(input.value);
    });

    container.appendChild(label);
    container.appendChild(input);

    return container;
}

//create dummy header filter to allow popup to filter
var emptyHeaderFilter = function(){
    return document.createElement("div");;
}

//initialize table
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    rowClickPopup:rowPopupFormatter, //add click popup to row
    columns:[
        {title:"Name", field:"name", headerPopup:headerPopupFormatter, headerPopupIcon:"<i class='fas fa-filter' title='Filter column'></i>", headerFilter:emptyHeaderFilter, headerFilterFunc:"like"},
    ],
});
```


[Alerts](#alert) [Documentation](about:/docs/6.4/menu#alert)
------------------------------------------------------------

The alert function allows you to display a full table sized message that blocks the whole of your table. This functionality is used internally for loading spinners and error messages for ajax requests.

The example below uses the alert and clearAlert functions on the table element to trigger and hide the alerts.

Alert Controls

Source Code

`HTML`

```html
<div class="table-controls">
  <button id="alert-show">Show Alert</button>
  <button id="alert-clear">Hide Alert</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Define variables for buttons
var showBtn = document.getElementById("alert-show");
var hideBtn = document.getElementById("alert-clear");

//handle button click events
showBtn.addEventListener("click", (e)=> {
  table.alert("Hey There! I'm An Alert!");
});

hideBtn.addEventListener("click", (e)=> {
  table.clearAlert();
});

//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columns:[
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress", formatter:"progress", sorter:"number"},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
    ],
});
```


[Download Table Data](#download) [Documentation](https://tabulator.info/docs/6.4/download)
--------------------------------------------------------------------

Tabulator allows you to download the table data as a file directly from your browser, no server needed.

The download will contain the text values of all data currently visible in the table, matching the current column layout, column titles, sorting and filtering.

Download Controls

Source Code

### XLSX Script Includes

```
<script type="text/javascript" src="https://oss.sheetjs.com/sheetjs/xlsx.full.min.js"></script>
```


### PDF Script Includes

```
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.20/jspdf.plugin.autotable.min.js"></script>
```


`HTML`

```html
<div>
    <button id="download-csv">Download CSV</button>
    <button id="download-json">Download JSON</button>
    <button id="download-xlsx">Download XLSX</button>
    <button id="download-pdf">Download PDF</button>
    <button id="download-html">Download HTML</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    columns:[
        {title:"Name", field:"name", width:200},
        {title:"Progress", field:"progress", width:100, sorter:"number"},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating", width:80},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
    ],
});

//trigger download of data.csv file
document.getElementById("download-csv").addEventListener("click", function(){
    table.download("csv", "data.csv");
});

//trigger download of data.json file
document.getElementById("download-json").addEventListener("click", function(){
    table.download("json", "data.json");
});

//trigger download of data.xlsx file
document.getElementById("download-xlsx").addEventListener("click", function(){
    table.download("xlsx", "data.xlsx", {sheetName:"My Data"});
});

//trigger download of data.pdf file
document.getElementById("download-pdf").addEventListener("click", function(){
    table.download("pdf", "data.pdf", {
        orientation:"portrait", //set page orientation to portrait
        title:"Example Report", //add title to report
    });
});

//trigger download of data.html file
document.getElementById("download-html").addEventListener("click", function(){
    table.download("html", "data.html", {style:true});
});
```


[Clipboard](#clipboard) [Documentation](https://tabulator.info/docs/6.4/clipboard)
------------------------------------------------------------

Using the clipboard option, you can allow users to copy and paste from your table

In the example below, try clciking anywhere in the table then using the ctrl + c key combination to copy the table, then pase into any spreadsheet application like Excel or Google sheets.

Then try changing that data, copying it then pasting it back into this table with thectrl + v key combination. You should see it replace the existing table data with your updated data set.

Source Code

`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
     height:"311px",
     data:tabledata,
     clipboard:true,
     clipboardPasteAction:"replace",
     columns:[
         {title:"Name", field:"name", width:200},
         {title:"Progress", field:"progress", width:100, sorter:"number"},
         {title:"Gender", field:"gender"},
         {title:"Rating", field:"rating", width:80},
         {title:"Favourite Color", field:"col"},
         {title:"Date Of Birth", field:"dob", hozAlign:"center", sorter:"date"},
         {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross"},
     ],
 });
```


[Interaction History](#history) [Documentation](https://tabulator.info/docs/6.4/history)
------------------------------------------------------------------

By setting the history option to true, you can make the table track any user changes to the table.

You can use the undo and redo functions to move through the users interaction history, undoing cell edits, row additions or deletions.

As long as the table is in focus (but not being edited) you can also use the ctrl + z and ctrl + y keyboard shortcuts to undo and redo actions.

The example below has an editable names column, try making some changes to soe of the names and then use the history functions to undo and redo the changes.

History Controls

Source Code

`HTML`

```html
<div>
    <button id="history-undo">Undo Edit</button>
    <button id="history-redo">Redo Edit</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    history:true,
    columns:[
    {title:"Name", field:"name", width:200, editor:"input"},
    {title:"Progress", field:"progress", hozAlign:"right", editor:"input"},
    {title:"Gender", field:"gender", editor:"input"},
    {title:"Rating", field:"rating",  hozAlign:"center", width:100},
    {title:"Favourite Color", field:"col"},
    {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
    {title:"Driver", field:"car", hozAlign:"center", sorter:"boolean"},
    ],
});

//undo button
document.getElementById("history-undo").addEventListener("click", function(){
  table.undo();
});

//redo button
document.getElementById("history-redo").addEventListener("click", function(){
   table.redo();
});

```


[Printing](#print) [Documentation](https://tabulator.info/docs/6.4/print)
---------------------------------------------------

Tabulator provides a range of options for handling styling of table output when printing

The example below is set to provide a style HTML table when printed and also ass a button for a fullscreen printout of the table

Print Controls

Source Code

`HTML`

```html
<div>
    <button id="print-table">Print Table</button>
</div>

<div id="example-table"></div>
```


`css`

```
/*Horizontally center header and footer*/
.tabulator-print-header, tabulator-print-footer{
    text-align:center;
}
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    printAsHtml:true,
    printHeader:"<h1>Example Table Header<h1>",
    printFooter:"<h2>Example Table Footer<h2>",
    columns:[
    {title:"Name", field:"name", width:200, editor:"input"},
    {title:"Progress", field:"progress", hozAlign:"right", editor:"input"},
    {title:"Gender", field:"gender", editor:"input"},
    {title:"Rating", field:"rating",  hozAlign:"center", width:100},
    {title:"Favourite Color", field:"col"},
    {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
    {title:"Driver", field:"car", hozAlign:"center", sorter:"boolean"},
    ],
});

//print button
document.getElementById("print-table").addEventListener("click", function(){
   table.print(false, true);
});

```


[Localization](#localization) [Documentation](https://tabulator.info/docs/6.4/localize)
-----------------------------------------------------------------

You can localize the content of your tables to meet the needs of your regional users. Any number of language options can be configured for column headers and pagination controls.

Language Controls

Source Code

`HTML`

```html
<div>
    <button id="lang-french">French</button>
    <button id="lang-german">German</button>
    <button id="lang-default">Default (English)</button>
</div>

<div id="example-table"></div>
```


`JavaScript`

```javascript
//Build Tabulator
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    pagination:"local",
    langs:{
        "fr-fr":{ //French language definition
            "columns":{
                "name":"Nom",
                "progress":"Progression",
                "gender":"Genre",
                "rating":"Évaluation",
                "col":"Couleur",
                "dob":"Date de Naissance",
            },
            "pagination":{
                "first":"Premier",
                "first_title":"Première Page",
                "last":"Dernier",
                "last_title":"Dernière Page",
                "prev":"Précédent",
                "prev_title":"Page Précédente",
                "next":"Suivant",
                "next_title":"Page Suivante",
                "all":"Toute",
            },
        },
        "de-de":{ //German language definition
            "columns":{
                "name":"Name",
                "progress":"Fortschritt",
                "gender":"Genre",
                "rating":"Geschlecht",
                "col":"Farbe",
                "dob":"Geburtsdatum",
            },
            "pagination":{
                "first":"Erste",
                "first_title":"Erste Seite",
                "last":"Letzte",
                "last_title":"Letzte Seite",
                "prev":"Vorige",
                "prev_title":"Vorige Seite",
                "next":"Nächste",
                "next_title":"Nächste Seite",
                "all":"Alle"
            },
        },
    },
    columns:[
        {title:"Name", field:"name"},
        {title:"Progress", field:"progress", sorter:"number"},
        {title:"Gender", field:"gender"},
        {title:"Rating", field:"rating"},
        {title:"Favourite Color", field:"col"},
        {title:"Date Of Birth", field:"dob"},
    ],
});

//set locale to French
document.getElementById("lang-french").addEventListener("click", function(){
    table.setLocale("fr-fr");
});

//set locale to German
document.getElementById("lang-german").addEventListener("click", function(){
    table.setLocale("de-de");
});

//set default locale
document.getElementById("lang-default").addEventListener("click", function(){
    table.setLocale("");
});
```


[Callbacks and Events](#callbacks) [Documentation](https://tabulator.info/docs/6.4/callbacks)
-----------------------------------------------------------------------

Tabulator features a range of callbacks and events to allow you to handle user interaction.

*   **Cell Click** - The cell click callback is triggered when a user left clicks on a cell, it can be set on a per column basis using the **cellClick** option in the columns data. (left click any cell in the gender column in this example)
*   **Row Click** - The row click event is triggered when a user clicks on a row, it can be set globally, by setting the**rowClick**option when you create your Tabulator. (left click any row in this example)
*   **Row Context Menu** - The row context event is triggered when a user right clicks on a row, it can be set globally, by setting the rowContext option when you create your Tabulator. (right click any row in this example)

Source Code

`HTML`

```html
<div id="example-table"></div>
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table", {
    height:"311px",
    layout:"fitColumns",
    columns:[
        {title:"Name", field:"name", sorter:"string", width:150},
        {title:"Progress", field:"progress", sorter:"number", formatter:"progress"},
        {title:"Gender", field:"gender", width:100, sorter:"string", cellClick:function(e, cell){alert("cell clicked - " + cell.getValue())}},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col", sorter:"string"},
        {title:"Date Of Birth", field:"dob", sorter:"date", hozAlign:"center"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", sorter:"boolean"},
    ],
});

table.on("rowClick", function(e, row){
    alert("Row " + row.getIndex() + " Clicked!!!!")
});

table.on("rowContext", function(e, row){
    alert("Row " + row.getIndex() + " Context Clicked!!!!")
});

```


[Theming](#theming) [Documentation](https://tabulator.info/docs/6.4/theme)
----------------------------------------------------

Tabulator is styled using a full set of CSS classes, making theming of the table very simple. A full list of these can be found [here.](https://tabulator.info/docs/6.4/style)

A LESS file is also provided, containing a set of variables to make generating your own theme even easier. This can be found in tabulator.less

Tabulator comes with a number of packaged themes in the /dist/css/ directory of the package. To use one of these simply include the matching css file instead of the default tabulator.css

### [Standard Theme](#theming-standard)

The standard generic table theme. This can be found in /dist/css/tabulator.min.css

Source Code

`HTML`

```html
<link href="/dist/css/tabulator.min.css" rel="stylesheet">
```


### [Simple Theme](#theming-simple)

A plain, simplistic layout showing only basic grid lines. This can be found in /dist/css/tabulator\_simple.min.css

Source Code

`HTML`

```html
<link href="/dist/css/tabulator_simple.min.css" rel="stylesheet">
```


### [Midnight Theme](#theming-midnight)

A dark, stylish layout using simple shades of grey. This can be found in /dist/css/tabulator\_midnight.min.css

Source Code

`HTML`

```html
<link href="/dist/css/tabulator_midnight.min.css" rel="stylesheet">
```


### [Modern Theme](#theming-modern)

A neat, stylish layout using one primary color. This color can be set in the @primary variable in the /dist/css/tabulator\_modern.less file to alter the style to match your colour scheme. This can be found in /dist/css/tabulator\_modern.min.css

Source Code

`HTML`

```html
<link href="/dist/css/tabulator_modern.min.css" rel="stylesheet">
```


### [Bootstrap 3 Theme](#theming-bootstrap)

Match Tabulator to the standard Bootstrap 3 theme /dist/css/tabulator\_bootstrap3.min.css

Source Code

`HTML`

```html
<link href="/dist/css/bootstrap/tabulator_bootstrap.min.css" rel="stylesheet">
```


### [Bootstrap 4 Theme](#theming-boostrap4)

Match Tabulator to the standard Bootstrap 4 theme /dist/css/tabulator\_bootstrap4.min.css

Source Code

`HTML`

```html
<link href="/dist/css/bootstrap/tabulator_bootstrap4.min.css" rel="stylesheet">
```


### [Bootstrap 5 Theme](#theming-boostrap5)

Match Tabulator to the standard Bootstrap 5 theme /dist/css/tabulator\_bootstrap5.min.css

Source Code

`HTML`

```html
<link href="/dist/css/bootstrap/tabulator_bootstrap5.min.css" rel="stylesheet">
```


### [Semantic UI Theme](#theming-semantic-ui)

Match Tabulator to the standard Semantic UI theme /dist/css/tabulator\_semanticui.min.css

Source Code

`HTML`

```html
<link href="/dist/css/semantic-ui/tabulator_semantic-ui.min.css" rel="stylesheet">
```


### [Bulma Theme](#theming-bulma)

Match Tabulator to the standard Bulma theme /dist/css/tabulator\_bulma.min.css

Source Code

`HTML`

```html
<link href="/dist/css/bulma/tabulator_bulma.min.css" rel="stylesheet">
```


### [Materialize Theme](#theming-materialize)

Match Tabulator to the standard Materialize theme /dist/css/tabulator\_materialize.min.css

Source Code

`HTML`

```html
<link href="/dist/css/materialize/tabulator_materialize.min.css" rel="stylesheet">
```


### [Manually Adjusted Theme](#theming-manual)

You can override the default tabulator styling in document, or simply edit the provided tabulator.min.css file to make your own custom theme.

Source Code

`HTML`

```html
<div id="example-table-theme"></div>
```


`css`

```
/*Theme the Tabulator element*/
#example-table-theme{
    background-color:#ccc;
    border: 1px solid #333;
    border-radius: 10px;
}

/*Theme the header*/
#example-table-theme .tabulator-header {
    background-color:#333;
    color:#fff;
}

/*Allow column header names to wrap lines*/
#example-table-theme .tabulator-header .tabulator-col,
#example-table-theme .tabulator-header .tabulator-col-row-handle {
    white-space: normal;
}

/*Color the table rows*/
#example-table-theme .tabulator-tableholder .tabulator-table .tabulator-row{
    color:#fff;
    background-color: #666;
}

/*Color even rows*/
    #example-table-theme .tabulator-tableholder .tabulator-table .tabulator-row:nth-child(even) {
    background-color: #444;
}
```


`JavaScript`

```javascript
var table = new Tabulator("#example-table-theme", {
    height:"331px",
    layout:"fitColumns",
    tooltipsHeader: false,
    columns:[
        {title:"Name", field:"name", sorter:"string", width:150},
        {title:"Progress", field:"progress", sorter:"number",  formatter:"progress"},
        {title:"Gender", field:"gender", width:100, sorter:"string", cellClick:function(e, cell){alert("cell clicked - " + cell.getValue())}},
        {title:"Rating", field:"rating", formatter:"star", hozAlign:"center", width:100},
        {title:"Favourite Color", field:"col", width:100, sorter:"string"},
        {title:"Date Of Birth", field:"dob", width:100, sorter:"date", hozAlign:"center"},
        {title:"Driver", field:"car", hozAlign:"center", formatter:"tickCross", sorter:"boolean"},
    ],
});
```
