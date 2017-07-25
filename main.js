
/*Data related to the HTML elems*/
var mainData = {
  controllers : {
        //"controllerEAA" : {init: "init", filter: "filter", dataFilterdInfo: "dataFilterdInfo", infoSectionInit: "infoSectionInit"},
        "controllerSNA" : {init: "init", filter: "filter", dataFilterdInfo: "dataFilterdInfo", infoSectionInit: "infoSectionInit"}
  },
  infoSections : {},
  filters : {
    data: {
        textfield0: {active:false, type:"textfield", data:null},
        textfield1: {active:false, type:"textfield", data:null},
        slider0:{min:null,max:null, numInput: 1, filterFunc:null,type:"smallslider", data:null, active:false},
        slider1:{min:null,max:null, numInput: 1, filterFunc:null,type:"smallslider", data:null, active:false},
        slider2:{min:null,max:null,start:null,end:null, numInput: 2, filterFunc:null, type:"largeslider", data:null, active:false}
      },
    visualization : {
      textfield0 :{id: "textfield0"},
      textfield1 :{id: "textfield1"},
      slider0: {
            id :"slider0",
            type: "smallslider",
            handle: "handle-slider0",
            amount: "amount-slider0",
            lbl: "lblMax-slider0"
      },
      slider1: {
            id :"slider1",
            type: "smallslider",
            handle: "handle-slider1",
            amount: "amount-slider1",
            lbl: "lblMax-slider1"
      },
      slider2: {
            id :"slider2",
            type: "largeslider",
            amount :"amount-slider2"
      }
    }
  },
  visualizations : {
    "panel0": {id: "panel0", styleMenu: "panel0SM", filter: false, drawFunc: null, redrawFunc: null, active:false, data: null},
    "panel1": {id: "panel1", styleMenu: "panel1SM", filter: false, drawFunc: null, redrawFunc: null, active:false, data: null},
    "panel2": {id: "panel2", styleMenu: "panel2SM", filter: false, drawFunc: null, redrawFunc: null, active:false, data: null},
    "panel3": {id: "panel3", styleMenu: "panel3SM", filter: false, drawFunc: null, redrawFunc: null, active:false, data: null}
    //"angularInfoSec": {id: "infoTab", drawFunc: null, active:false}
  }
};

/* The data retrieved from the nucleus elaboration, the domain Data*/
var domainData = {
  allEmails: [],
  allData: {
    "Directed": {'nodes': {},'edges': []},
    "Undirected": {'nodes': {},'edges': []}
  }
};

/*This will contain the additional objects generated from the elaborations on
the other layers: Analysis, Filters, Visualization */
var data = {};

/*The configurations and system params */
var objSystemConf = {
  clusNum : null,

  //User settings
  datasetname : null,
  wordsXtime: null,
  wordsXClus : null,
  dataseturls: [],
  myContacts : [],

  //Model info limits
  subjectsNum : null,
  rowsLimit : 10,

  //GUI Style
  mainColor: '#0099cc',
  infoBGColor: '#f2f2f2',
  infoColor:
          '#cc6666',
          //'rgb(251,128,114)'
  filterColor:'#767676',
  colorPalette:
          //['#8dd3c7','#ffffb3','#bebada','#fb8072','#80b1d3','#fdb462','#b3de69','#fccde5','#d9d9d9','#bc80bd','#ccebc5','#ffed6f']
          //['rgb(141,211,199)','rgb(255,255,179)','rgb(190,186,218)','rgb(251,128,114)','rgb(128,177,211)','rgb(253,180,98)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(188,128,189)','rgb(204,235,197)','rgb(255,237,111)']
          ['rgb(128,177,211)','rgb(204,235,197)','rgb(190,186,218)','rgb(251,128,114)','rgb(141,211,199)','rgb(253,180,98)','rgb(179,222,105)','rgb(252,205,229)','rgb(217,217,217)','rgb(188,128,189)','rgb(255,255,179)','rgb(255,237,111)']

}

/*The selections made by the user will change these vars dynamically*/
var currentPanel=null;
var objInfoView = {
    base: "",
    category: ""
};

/*When document is ready ...*/
$(document).ready( function($scope) {

    //The repository to elaborate
    objSystemConf.datasetname = 'enron';
    objSystemConf.myContacts.push('matt.smith@enron.com');
    objSystemConf.dataseturls.push('server/data/mbox/enron/mbox-enron-smith-m-all.mbox');
    /*Set the configuration params*/
    objSystemConf.clusNum = 4;
    objSystemConf.wordsXClus = 25;
    objSystemConf.freqWordsNum = 15;
    objSystemConf.subjectsNum = 5;
    objSystemConf.wordsXtime = 15;

    /* Domain Data elaboration: core Layer*/
    /*Call the Domain operation and get: nodes, edges, and all emails*/
    callServer('getDomainData',[objSystemConf.dataseturls,objSystemConf.myContacts],false);
    domainData.allData = domainDataAnalysis.convertDomainData(domainData);

    /*Initialize some fields in mainData*/
    initInfoSection();

    /*Initialize the study analysis: 1st Layer*/
    for (var keyController in mainData.controllers) {
      var controllerObj = mainData.controllers[keyController];
      var initControllerObj = window[keyController][controllerObj.init](domainData,mainData);
      updateData(initControllerObj.data,"init");
      updateMainData(initControllerObj.mainData,"init");
      console.log("Done initializing: "+keyController);
      console.log("Done creating an info section: "+keyController);
    }

    /*Build the system GUI and HTML contents value according*/
    guiUtil.initSystemGui();
    setDefaultOptions();

    /*Filter the data based on the default filters values: 2nd Layer*/
    genFilteredData();
    genInfoOnFilteredData();

    /*Draw the gui panels: 3rd Layer*/
    console.log("Draw the panels");
    var panelsVisObj = guiUtil.redrawPanels();

    /*Print the data contained in the main*/
    console.log("----------------The data in the main------------------");
    console.log("The domainData in the main is equal: ");
    console.log(domainData);
    console.log("The mainData in the main is equal: ");
    console.log(mainData);
    console.log("The data in the main is equal: ");
    console.log(data);
    console.log("------------------------------------------------------");
});

/*This method calls the server and do function 'func' given arguments 'arg'*/
function callServer(func,arg,asyncFlag){
      $.ajax({
          type: "POST",
          url: 'server.php',
          dataType: 'json',
          data: {functionname: func, arguments:arg},
          async:asyncFlag,
          success: function (obj) {
              if( !('error' in obj) ) {
                switch (func) {
                  case 'getDomainData':
                      domainData.allEmails = obj.val.allEmails;
                      var dataObj = obj.val.nodesEdges;

                      for (var j=0;j<dataObj.nodes.directed.length;j++) {
                          var nodeObj = dataObj.nodes.directed[j];
                          domainData.allData.Directed.nodes[nodeObj.id]= nodeObj;
                      }

                      for (var j=0;j<dataObj.nodes.undirected.length;j++) {
                          var nodeObj = dataObj.nodes.undirected[j];
                          domainData.allData.Undirected.nodes[nodeObj.id]= nodeObj;
                      }

                      domainData.allData.Directed.edges = dataObj.edges.directed;
                      domainData.allData.Undirected.edges = dataObj.edges.undirected;
                      break;
                }
              }
          }
      });
}

/*Initialize and update the info Sections field inside the mainData
the update will be made each time a new filter is applied and therefore
will change the info visualized*/
function initInfoSection(){
  for (var keyPanel in mainData.visualizations) {
    mainData.infoSections[keyPanel] = {
                'id': mainData.visualizations[keyPanel].data,
                'selected': {'links': {elem: null, infos: null}, 'contacts': {elem: null, infos: null}, 'network': {elem: null, infos: null}},
                'filtered': {'links': {elem: null, infos: null}, 'contacts': {elem: null, infos: null}, 'network': {elem: null, infos: null}},
                'all': {'links': {elem: null, infos: null}, 'contacts': {elem: null, infos: null}, 'network': {elem: null, infos: null}}
    };
  }
}
function updateInfoSec(){
  for (var keyPanel in mainData.infoSections) {
    var keyPanelData = mainData.infoSections[keyPanel].id;
    if ((keyPanelData == "Directed") || (keyPanelData == "Undirected")) {
      mainData.infoSections[keyPanel]['filtered']['network'] = {elem: {graphData: data.filteredGraphDataInfo[keyPanelData], filteredData: data.filteredData[keyPanelData]}, infos: null };
      mainData.infoSections[keyPanel]['filtered']['contacts'] = {elem: {graphData: data.filteredGraphDataInfo[keyPanelData], filteredData: data.filteredData[keyPanelData]}, infos: null };
      mainData.infoSections[keyPanel]['filtered']['links'] = {elem: {graphData: data.filteredGraphDataInfo[keyPanelData], filteredData: data.filteredData[keyPanelData]}, infos: null };
      mainData.infoSections[keyPanel]['all']['network'].elem = data.infoData[keyPanelData];
      mainData.infoSections[keyPanel]['all']['contacts'].elem = data.infoData[keyPanelData];
      mainData.infoSections[keyPanel]['all']['links'].elem = data.infoData[keyPanelData];
    }
  }
}

/*Set the default options to the system when it runs for the first time*/
function setDefaultOptions() {
  //remove loading panel
  var el = document.getElementById( 'loaderIcon' );
  el.parentNode.removeChild( el );
  var strRemove = "document.getElementById( 'loaderDiv' ).parentNode.removeChild(document.getElementById( 'loaderDiv' ));"
  var strButton = '<div class="ui two bottom attached buttons"><div class="ui large button" onclick="'+strRemove+'"><i class="icon Remove"></i>Close</div></div>';
  document.getElementById('buttonClose').innerHTML = strButton;

  infosModule.clickMenuInfo1("all");
  infosModule.clickMenuInfo2("network");
  document.getElementById("tabMenu0").click();
}

/*Apply the 2nd Layer of filtering, by calling for each controller it's 2nd
level functions*/
function genFilteredData(){
  /*Filtering the system data */
  var filterDataArr = [];
  var filterControllerObj;
  for (var keyController in mainData.controllers) {
    var controllerObj = mainData.controllers[keyController];
    filterControllerObj = window[keyController][controllerObj.filter](data,domainData);
    filterDataArr.push(filterControllerObj.data);
    console.log("Done filtering: "+keyController);
  }
  delete data['filteredData'];
  for (var i = 0; i < filterDataArr.length; i++) {
    updateData(filterDataArr[i],"update");
  }
}
function genInfoOnFilteredData(){

  //we must reset the info sections
  initInfoSection();

  /*Generate info on the filtered data*/
  var filteredGraphDataInfoArr = [];
  for (var keyController in mainData.controllers) {
    var controllerObj = mainData.controllers[keyController];
    var filterControllerObj = window[keyController][controllerObj.dataFilterdInfo](data,domainData);
    filteredGraphDataInfoArr.push(filterControllerObj.data);
    console.log("Done building info on filtered data : "+keyController);
  }
  delete data['filteredGraphDataInfo'];
  for (var i = 0; i < filteredGraphDataInfoArr.length; i++) {
    updateData(filteredGraphDataInfoArr[i],"update");
  }

  //update the info sections
  updateInfoSec();

}
