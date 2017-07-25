var controllerEAA = (function () {

  var init = function(myDomainData,myMainData){

    var keyNetType = ["Directed","Undirected"];
    var domainData = myDomainData;
    var mainData = myMainData;
    var eaaData = {
      infoData: {},
      filteredData: {},
      filteredGraphDataInfo: {},
      objFilter: {time: {from:"",to:""}, contact: "", subject: ""},
      emailDomains: {}
    };
    var filteredData;

    function initEAAData(){
      for (var i = 0; i < keyNetType.length; i++) {
        eaaData.infoData[keyNetType[i]] = {nodes: {}, edges: {}};
        eaaData.filteredData[keyNetType[i]] = {nodes: [], edges: []};
        eaaData.filteredGraphDataInfo[keyNetType[i]] = {nodes: [], edges: []};
        eaaData.emailDomains = {all:{}, filtered:{}};
      }
    }
    initEAAData();

    eaaData = analysisEAA.computeDataInfos(eaaData,domainData);
    mainData = filteringEAA.initFiltersElems(mainData,domainData);

    return {data:eaaData, mainData:mainData};
  };

  var filter = function(mySysData,myDomainData){
    var myData = {filteredData: filteringEAA.applyFiltering(mySysData,myDomainData)};
    return {data: myData};
  };

  var dataFilterdInfo = function(mySysData,myDomainData){
    myData = {filteredGraphDataInfo: filteringSNA.computeFilteredDataInfo(mySysData)};
    return {data: myData};
  };

  return {
    init: init,
    filter: filter,
    dataFilterdInfo: dataFilterdInfo
  }
})();
