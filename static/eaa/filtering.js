
var filteringEAA = (function () {

  function inContactnameFilter(data, objNode) {
    var nodeLabel = objNode.label;
    if (data.objFilter.contact != null) {
        if (nodeLabel.includes(data.objFilter.contact.toString())){
          return true;
        }else{
          return false;
        }
    }else{
      return true;
    }
  }

  function inTimeFilter(data,objElem) {
    var elemTime = objElem.baseTime;
    if ((new Date(data.objFilter.time.from) <= elemTime.first) && (elemTime.last <= new Date(data.objFilter.time.to))){
      return true;
    }else{
      return false;
    }
  }

  function inKeywordFilter(data, objEdge) {

    for (var i = 0; i < objEdge.listEmails.length; i++) {

      var edgeContent = objEdge.listEmails[i].content.toLowerCase();
      var edgeSubject = objEdge.listEmails[i].subject.toLowerCase();

      if (data.objFilter.subject != null) {
        var keyWord = data.objFilter.subject.toLowerCase();
        if (keyWord != "") {
          if ((edgeContent.includes(keyWord)) || (edgeSubject.includes(keyWord))){
            return true;
          }else{
            return false;
          }
        }else{
          return true;
        }
      }else{
        return true;
      }
    }
  }

  function getFilterRange(domainData) {

    var myTimeRange = analysisEAA.getTimeRange(domainData.allData.Directed,null,'all',"Directed");
    return myTimeRange;
  }

  function applyFiltering(mySysData,myDomainData){

    var sysData= mySysData;
    var myFilteredData = {};
    for (var dataTypeKey in sysData.filteredData) {
      myFilteredData[dataTypeKey] = {nodes:[],edges:[]};
    }

    for (var keyDataType in sysData.infoData) {

      //empty and regenerate the filtered data
      //sysData.filteredData[keyDataType].edges = [];
      //sysData.filteredData[keyDataType].nodes = [];

      //Keep track of nodes i add
      var nodesIndex = {};

      /*iterate allData.edges for Directed and Undirected*/
      for (var i=0;i<myDomainData.allData[keyDataType].edges.length;i++) {
        var edgeObj = myDomainData.allData[keyDataType].edges[i];

        var objEdge = sysData.infoData[keyDataType].edges[edgeObj.id];
        var objNodeFrom = sysData.infoData[keyDataType].nodes[objEdge.from];
        var objNodeTo = sysData.infoData[keyDataType].nodes[objEdge.to];

        if (
            (inTimeFilter(sysData, objEdge)) &&
            //(inEdgesweightFilter(objEdge,key)) &&
            (inKeywordFilter(sysData, objEdge)) &&
            //((inNodesvalFilter(objNodeOrigin,key)) && (inNodesvalFilter(objNodeTarget,key)))
            ((inContactnameFilter(sysData, objNodeFrom)) || (inContactnameFilter(sysData, objNodeTo)))
          )
        {
          //console.log("ok!!");
          objEdge["msgTime"] = edgeObj.time;
          myFilteredData[keyDataType].edges.push(objEdge);

          if (!nodesIndex.hasOwnProperty(objNodeFrom.id)) {
            nodesIndex[objNodeFrom.id] = objNodeFrom.label;
            myFilteredData[keyDataType].nodes.push(objNodeFrom);
          }

          if (!nodesIndex.hasOwnProperty(objNodeTo.id)) {
            nodesIndex[objNodeTo.id] = objNodeTo.label;
            myFilteredData[keyDataType].nodes.push(objNodeTo);
          }
        }
      }
    }

    return myFilteredData;
  }
  function computeFilteredDataInfo(mySysData){
    var myFilteredData = {};
    for (var dataTypeKey in sysData.filteredGraphDataInfo) {
      myFilteredData[dataTypeKey] = {nodes:[],edges:[]};
    }
    for (var keyDataType in sysData.filteredData) {
    /*directed, Undirected */

      for (var keyElems in sysData.filteredData[keyDataType]) {
      /*nodes or edges*/

          //empty and regenerate the info filtered data in acceptable graph format
          myFilteredData[keyDataType][keyElems] = [];

          var indexEdges = {};
          for (var i = 0; i < sysData.filteredData[keyDataType][keyElems].length; i++) {
          /*the final objects*/

            var elemObj = sysData.filteredData[keyDataType][keyElems][i];
            var addIt = false;
            if (keyElems == "nodes") {
              addIt = true;
            }else{
              if ((!indexEdges.hasOwnProperty(elemObj.id)) && (keyElems == "edges")) {
                addIt = true;
                indexEdges[elemObj.id] = "true";
              }
            }

            if (addIt) {
              var newAttObj = computeFilteredElemInfo(elemObj,keyElems, keyDataType, sysData.filteredData[keyDataType]);
              for (var keyAtt in newAttObj) {
                elemObj[keyAtt] = newAttObj[keyAtt];
              }
              myFilteredData[keyDataType][keyElems].push(elemObj);
            }
          }
      }
    }
    return myFilteredData;
  }
  function computeFilteredElemInfo(elemObj,type, dataType, myFilteredData){
    var filteredObj = {};

    switch (type) {
      case "nodes":

        var myParamObj = {'elemId': elemObj['id'],'type': 'node','dataType': dataType,'filtered': true};
        var timeObj = analysisEAA.getTimeRange(myFilteredData[dataType],elemObj['id'],'nodes',dataType);
        filteredObj = {'time': timeObj};
        break;

      case "edges":
        var myParamObj = {'elemId': elemObj['id'],'type': 'edge','dataType': dataType,'filtered': true};
        var timeObj = analysisEAA.getTimeRange(myFilteredData[dataType],elemObj['id'],'edges',dataType);
        filteredObj = {'time': timeObj};
        break;

    }
    return filteredObj;
  }

  /*set the filters that EAA needs*/
  function initFiltersElems(myMainData, myDomainData){

    var mainData = myMainData;
    var objVal = getFilterRange(myDomainData);
    /*slider0 will be used to filter edge weight*/
    mainData.filters.data.slider2.active = true;
    mainData.filters.data.slider2.data = "time";
    mainData.filters.data.slider2.start = objVal.first.getTime();
    mainData.filters.data.slider2.end = objVal.last.getTime();
    mainData.filters.data.slider2.min = objVal.first.getTime();
    mainData.filters.data.slider2.max = objVal.last.getTime();
    mainData.filters.data.slider2.filterFunc = "controllerEAA.filter";

    mainData.filters.data.textfield0.active = true;
    mainData.filters.data.textfield0.data = "contact";
    mainData.filters.data.textfield1.active = true;
    mainData.filters.data.textfield1.data = "subject";
    return mainData;
  }

  return {
    initFiltersElems: initFiltersElems,
    computeFilteredDataInfo: computeFilteredDataInfo,
    applyFiltering: applyFiltering
  }

})();
