var controllerSNA = (function () {

  var init = function(myDomainData,myMainData){

    var domainData = myDomainData;
    var keyNetType = ["Directed","Undirected"];
    var mainData = myMainData;
    var snaData = {
      infoData: {},
      filteredData: {},
      filteredGraphDataInfo: {},
      netCache: {},
      netSelectedItem: {},
      networks: {},
      networksDS: {},
      objNetStyle: {},
      infoSectionsGens: {},
      objFilter: {myContact: "", nodesV: 0, edgesW: 0}
    };
    var filteredData;

    function initSNAData(){
      for (var i = 0; i < keyNetType.length; i++) {
        snaData.infoData[keyNetType[i]] = {nodes: {}, edges: {}};
        snaData.filteredData[keyNetType[i]] = {nodes: [], edges: []};
        snaData.filteredGraphDataInfo[keyNetType[i]] = {nodes: [], edges: []};
        snaData.networksDS[keyNetType[i]] = {nodes: null, edges: null};
        snaData.netSelectedItem[keyNetType[i]] = { node:{id: null, selType: null},edge:{id: null, selType: null} };
        snaData.netCache[keyNetType[i]] = {nodes: [],edges: []};
        snaData.networks[keyNetType[i]] = null;
        snaData.objNetStyle[keyNetType[i]] = {nodeSize: "sumEdgesW",edgeSize: "weight",nodeColor: "none",edgeColor: "none"};
        snaData.infoSectionsGens = {
          'selected': {'links': [{controller: "controllerSNA", func: "genEdgeInfoSectionRows", id:"Undirected"},{controller: "controllerSNA", func: "genEdgeInfoSectionRows", id:"Directed"}], 'contacts': [{controller: "controllerSNA", func: "genNodeInfoSectionRows", id: "Undirected"},{controller: "controllerSNA", func: "genNodeInfoSectionRows", id: "Directed"}], 'network': null },
          'filtered': {'links': [{controller: "controllerSNA",id:"Undirected"},{controller: "controllerSNA",id:"Directed"}], 'contacts': [{controller: "controllerSNA",id:"Undirected"},{controller: "controllerSNA",id:"Directed"}], 'network': [{controller: "controllerSNA", func: "genNetInfoSectionRows",id:"Undirected"},{controller: "controllerSNA", func: "genNetInfoSectionRows",id:"Directed"}]},
          'all': {'links': [{controller: "controllerSNA",id:"Undirected"},{controller: "controllerSNA",id:"Directed"}], 'contacts': [{controller: "controllerSNA",id:"Undirected"},{controller: "controllerSNA",id:"Directed"}], 'network': [{controller: "controllerSNA", func: "genNetInfoSectionRows",id:"Undirected"},{controller: "controllerSNA", func: "genNetInfoSectionRows",id:"Directed"}] }
        };
      }
    }

    initSNAData();

    snaData = analysisSNA.computeDataInfos(snaData,domainData);
    mainData = filteringSNA.initFiltersElems(mainData,snaData);
    for (var i = 0; i < keyNetType.length; i++) {
      mainData = visualizationSNA.initGraphNetwork(keyNetType[i],mainData);
    }

    return {data:snaData, mainData:mainData};
  };

  var filter = function(mySysData,myDomainData){
    var myData = {filteredData: filteringSNA.applyFiltering(mySysData,myDomainData)};
    return {data: myData};
  };

  var dataFilterdInfo = function(mySysData,myDomainData){
    var myData = {filteredGraphDataInfo: filteringSNA.computeFilteredDataInfo(mySysData)};
    return {data: myData};
  };

  var drawDirectedGN = function(containerId,mySysData) {
    return {sysData: visualizationSNA.drawGraphNetwork(containerId,"Directed",mySysData)};
  }
  var drawUndirectedGN = function(containerId,mySysData) {
    return {sysData: visualizationSNA.drawGraphNetwork(containerId,"Undirected",mySysData)};
  }

  var genInfoSectionRows = function(elem,rowType,initIndex){
    var resObj = null;
    switch (rowType) {
      case "selected-contacts": resObj = visualizationSNA.genNodeInfoSectionRows(elem,rowType); break;
      case "selected-links": resObj = visualizationSNA.genEdgeInfoSectionRows(elem,rowType); break;
      case "filtered-network": resObj = visualizationSNA.genNetInfoSectionRows(elem,rowType); break;
      case "all-network": resObj = visualizationSNA.genAllNetInfoSectionRows(elem,rowType); break;
      case "filtered-contacts": resObj = visualizationSNA.buildListRows(elem.graphData.nodes,rowType,initIndex); break;
      case "filtered-links": resObj = visualizationSNA.buildListRows(elem.graphData.edges,rowType,initIndex); break;
      case "all-contacts": resObj = visualizationSNA.buildListRows(util.jsonToArr(elem.nodes),rowType,initIndex); break;
      case "all-links": resObj = visualizationSNA.buildListRows(util.jsonToArr(elem.edges),rowType,initIndex); break;
    }
    return resObj;
  }

  var handleSelections = function(funcName, params){
    var resObj = {};
    switch (funcName) {
      case "onContactSelected":
        resObj = {actionType: 'updateInfoSec',objInfoView : {base: "selected" , category: "contacts"}, objBaseInfo: {elem: params,infos: null}};
        break;
      case "onLinkSelected":
        resObj = {actionType: 'updateInfoSec',objInfoView : {base: "selected" , category: "links"}, objBaseInfo: {elem: params,infos: null}};
        break;
      case "nexElemsList":
        //resObj = {actionType: 'upgradeInfoSec', params: params};
        resObj = {actionType: 'upgradeInfoSec', newRows: visualizationSNA.buildListRows(params.arrElems, params.rowType, params.index)};
        break;
    }
    return resObj;
  }

  return {
    init: init,
    filter: filter,
    dataFilterdInfo: dataFilterdInfo,
    genInfoSectionRows: genInfoSectionRows,
    handleSelections: handleSelections,
    drawDirectedGN: drawDirectedGN,
    drawUndirectedGN: drawUndirectedGN
  }
})();
