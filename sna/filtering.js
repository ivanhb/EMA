
var filteringSNA = (function () {

    function inNodesvalFilter(objNode,sysData) {
      var nodeVal = objNode.baseValue.all;
      if (nodeVal >= sysData.objFilter.nodesV){
        return true;
      }else{
        return false;
      }
    }
    function inEdgesweightFilter(objEdge,sysData) {
      var edgeWeight = objEdge.baseWeight;
      if (edgeWeight >= sysData.objFilter.edgesW){
        return true;
      }else{
        return false;
      }
    }
    function applyFiltering(mySysData,myDomainData){

      var sysData = mySysData;
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
            for (var i=0; i< myDomainData.allData[keyDataType].edges.length;i++) {
              var edgeObj = myDomainData.allData[keyDataType].edges[i];

              var objEdge = sysData.infoData[keyDataType].edges[edgeObj.id];
              var objNodeFrom = sysData.infoData[keyDataType].nodes[objEdge.from];
              var objNodeTo = sysData.infoData[keyDataType].nodes[objEdge.to];
              //console.log("check!!");
              if (
                  (inEdgesweightFilter(objEdge,sysData)) &&
                  ((inNodesvalFilter(objNodeFrom,sysData)) && (inNodesvalFilter(objNodeTo,sysData)))
                )
                {
                  //console.log("ok!!");
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
      var sysData = mySysData;
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
          var degreeObj = analysisSNA.getDegree(myParamObj,myFilteredData);
          var emailsObj = analysisSNA.getEmailsNum(myParamObj,myFilteredData);
          var neighbourhood = analysisSNA.getNeighborhood(myParamObj,myFilteredData);

          filteredObj = {'sumEdgesW': emailsObj['all'],
                        'degree': degreeObj.degree,
                        'dataType': dataType,
                        'neighbourhood': neighbourhood
                        };
          if (dataType == "Directed") {
              filteredObj['sumInEdgesW'] = emailsObj.in;
              filteredObj['sumOutEdgesW'] = emailsObj.out;
              filteredObj['inDegree'] = degreeObj.inDegree;
              filteredObj['outDegree'] = degreeObj.outDegree;
          }
          break;

        case "edges":
          var myParamObj = {'elemId': elemObj['id'],'type': 'edge','dataType': dataType,'filtered': true};
          var emailsObj = analysisSNA.getEmailsNum(myParamObj,myFilteredData);
          filteredObj = {
            'dataType': dataType,
            'weight': emailsObj['all']
          };
          break;

      }
      return filteredObj;
    }

    /*set the filters that SNA need*/
    function initFiltersElems(myMainData, snaData){

      var mainData = myMainData;
      var objVal = getFilterRange(snaData);
      /*slider0 will be used to filter edge weight*/
      mainData.filters.data.slider0.active = true;
      mainData.filters.data.slider0.data = "edgesW";
      mainData.filters.data.slider0.min = 1;
      mainData.filters.data.slider0.max = Math.floor(objVal.filterRange.maxSumEdgesW/4);
      mainData.filters.data.slider0.filterFunc = "controllerSNA.filter";

      /*slider1 will be used to filter node value*/
      mainData.filters.data.slider1.active = true;
      mainData.filters.data.slider1.data = "nodesV";
      mainData.filters.data.slider1.min = 1;
      mainData.filters.data.slider1.max = objVal.filterRange.maxWeight;
      mainData.filters.data.slider1.filterFunc = "controllerSNA.filter";

      return mainData;
    }

    /*get the max and minimum values of the filters*/
    function getFilterRange(snaData) {
      var edgesInfo = snaData.infoData.Directed.edges;
      var maxWeight = 0;
      for (var edgeKey in edgesInfo) {
        if (edgesInfo[edgeKey].baseWeight > maxWeight) { maxWeight = edgesInfo[edgeKey].baseWeight}
      }

      var nodesInfo = snaData.infoData.Directed.nodes;
      var maxSumEdgesW = 0;
      for (var nodeKey in nodesInfo) {
        if (nodesInfo[nodeKey].baseValue.all > maxSumEdgesW) { maxSumEdgesW = nodesInfo[nodeKey].baseValue.all}
      }

      var resultDic = {}
      resultDic['filterRange'] = {'maxWeight':maxWeight, 'maxSumEdgesW':maxSumEdgesW};
      return resultDic;
    }

    return {
      initFiltersElems: initFiltersElems,
      applyFiltering: applyFiltering,
      computeFilteredDataInfo: computeFilteredDataInfo
    }
})();
