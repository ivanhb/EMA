
var analysisSNA = (function () {

  /*Generate 'infoData' to add to the Main once it has been called from the controller*/
  function computeDataInfos(mySnaData, myDomainData) {
    var snaData = mySnaData;
    var domainData = myDomainData;
    for (var key in snaData.infoData) {
      snaData.infoData[key]['edges'] = computeInfo(domainData.allData[key],key, 'edges');
      snaData.infoData[key]['nodes'] = computeInfo(domainData.allData[key],key, 'nodes');
    }
    return snaData;
  }
  function computeInfo(arrObj, dataType, type) {

    var objInfoData = {};
    //objInfoData[type] = {};

    switch (type) {
      case 'edges':
        var edgesList = arrObj.edges;
        for (var i=0; i< edgesList.length;i++) {

          var edgeObj = edgesList[i];
          if (!objInfoData.hasOwnProperty(edgeObj.id)) {

            objInfoData[edgeObj.id] = {
                              'id': edgeObj.id,
                              'from': edgeObj.from,
                              'to': edgeObj.to,
                              'fromLbl': edgeObj.fromLbl,
                              'toLbl': edgeObj.toLbl,
                              'type': dataType,
                              'baseWeight': edgeWeight(arrObj, edgeObj.id, dataType)
            }
          }
        }
        break;
      case 'nodes':
        var nodesList = arrObj.nodes;
        for (var nodeId in nodesList) {
          if (!objInfoData.hasOwnProperty(nodeId)) {
            objInfoData[nodeId] = {
                                'id': nodeId,
                                'label': nodesList[nodeId].label,
                                //'domain': getDomain(arrObj[nodeId],dataType,"all"),
                                'baseValue': nodeValue(arrObj,nodeId,dataType),
                                //'emails': nodeEmails(nodeId,dataType)
                                'baseDegree': nodeDegree(arrObj,nodeId,dataType)
            }
          }
        }
        break;
    }
    return objInfoData;
  }

  /*Calculating an edge weight*/
  function edgeWeight(arrObj,edgeId,dataType) {
    var domainData = arrObj;
    var countEdges = 0;
    for(var i=0;i< arrObj.edges.length;i++){
      var objEdge = arrObj.edges[i];
      if (objEdge.id == edgeId) {
        countEdges = countEdges +1;
      }
    }
    return countEdges;
  }

  /*Calculating a node sumEdgesWeight*/
  function nodeValue(arrObj,nodeId,dataType) {
    var domainData = arrObj;
    var value ={'all':0,'in':0,'out':0};
    switch (dataType) {
      case 'Directed':
        for(var i=0;i< arrObj.edges.length;i++){
          var objEdge = arrObj.edges[i];
          if (objEdge['from'] == nodeId) {
            value['out'] += 1;
          }
          if (objEdge['to'] == nodeId) {
            value['in'] += 1;
          }
        }
        value['all'] = value['in'] + value['out'];
        break;

      case 'Undirected':
        for(var i=0;i< arrObj.edges.length;i++){
          var objEdge = arrObj.edges[i];
          if ((objEdge['from'] == nodeId) || (objEdge['to'] == nodeId)) {
            value['all'] += 1;
          }
        }
        break;
    }
    return value;
  }

  /*Calculating a node degree*/
  function nodeDegree(arrObj,nodeId,dataType) {
    var degree ={'degree':0,'inDegree':0,'outDegree':0};
    var myEdges = getEdges({'elemId':nodeId,'type': 'node','dataType':dataType,'filtered': false},arrObj);
    switch (dataType) {
      case 'Directed':
        for (var i=0; i< myEdges.length; i++) {
          if(myEdges[i]['from'] == nodeId){degree['outDegree'] += 1;}
          if(myEdges[i]['to'] == nodeId){degree['inDegree'] += 1;}
        }
        degree['degree'] = degree['inDegree'] + degree['outDegree'];
        break;

      case 'Undirected':
        for (var i=0; i< myEdges.length; i++) {
          degree['degree'] += 1;
        }
        break;
    }
    return degree;
  }

  /*return edges that have elemId as origin or target*/
  function getEdges(args,arrObj) {
    var elemId = args.elemId;
    var type = args.type;
    var dataType = args.dataType;
    var filteredBool = args.filtered;

    var domainData = arrObj
    //var snaData = controllerSNA.snaData;

    var arrEdgesData = arrObj.edges;
    //if (filteredBool) { arrEdgesData = snaData.filteredData[dataType].edges;}
    var edgesIndex = {};

    for (var i=0; i< arrEdgesData.length; i++) {
      var edgeObj = arrEdgesData[i];
      var accepted = false;
      switch (type) {
        case 'node':
              if ((edgeObj['from'] == elemId) || (edgeObj['to'] == elemId)){
                accepted = true;
              }
            break;

        case 'edge':
            if (edgeObj.id == elemId) {
              accepted = true;
            }
            break;

        case 'network':
            accepted = true;
            break;
      }

      if (accepted) {
        if (!edgesIndex.hasOwnProperty(edgeObj.id)){
          //edgesIndex[edgeObj.id] = 1;
          edgesIndex[edgeObj.id] ={'from': edgeObj['from'], 'fromLbl': edgeObj['fromLbl'], 'to': edgeObj['to'], 'toLbl': edgeObj['toLbl'], 'weight': 1};
        }else{
          edgesIndex[edgeObj.id]['weight'] += 1;
        }
      }
    }

    var arrEdges = [];
    for (var key in edgesIndex) {
      arrEdges.push({'id': key,'from': edgesIndex[key]['from'], 'fromLbl': edgesIndex[key]['fromLbl'], 'to': edgesIndex[key]['to'], 'toLbl': edgesIndex[key]['toLbl'], 'count': edgesIndex[key]['weight']});
    }

    return arrEdges;
  }

  function getNeighborhood(args,arrObj){

    var arrEdges;
    if(args.hasOwnProperty("arrEdges")){
      arrEdges = args.arrEdges;
    }else {
      arrEdges = getEdges(args,arrObj);
    }

    var nodesFrom = [];
    var nodesTo = [];
    for (var i = 0; i < arrEdges.length; i++) {
      var edgeObj = arrEdges[i];
      if(edgeObj.from == args.elemId){
        nodesTo.push({id:edgeObj.to, label:edgeObj.toLbl});
      }else {
        nodesFrom.push({id:edgeObj.from, label:edgeObj.fromLbl});
      }
    }

    return {nodesFrom: nodesFrom, nodesTo: nodesTo};
  }

  function getDegree(args,data){
    var elemId = args.elemId;
    var type = args.type;
    var dataType = args.dataType;

    var nodesIndexFrom = {};
    var nodesIndexTo = {};
    var edgesIndex = {};

    var degree = {degree: 0, inDegree:0, outDegree:0};
    switch (type) {
      case 'node':
        for (var i = 0; i < data.edges.length; i++) {
          var infoObj = data.edges[i];
          if(!edgesIndex.hasOwnProperty(infoObj.id)){
              if (dataType == "Directed"){

                if (infoObj['from'] == elemId) {
                    degree.outDegree += 1;
                }
                if (infoObj['to'] == elemId) {
                    degree.inDegree += 1;
                }

              }else{
                if ((infoObj['from'] == elemId) || (infoObj['to'] == elemId)){
                  //put key only the to side
                    degree.degree += 1;
                }
              }
              edgesIndex[infoObj.id] = true;
          }
        }
        if (dataType == "Directed"){ degree.degree = degree.inDegree + degree.outDegree;}
        break;

      case 'edge':
        break;

      case 'network':
        break;
    }

    return degree;
  }

  /*Calculating a node emails*/
  function nodeEmails(nodeId,dataType) {
    var emails ={'all':0,'in':0,'out':0};

    var arrEdgesData = domainData.allData[dataType].edges;

    switch (dataType) {
      case 'Directed':
        for (var i=0; i< arrEdgesData.length; i++) {
          if (arrEdgesData[i].origin == nodeId) {
            emails['out'] += 1;
          }
          if (arrEdgesData[i].target == nodeId) {
            emails['in'] += 1;
          }
        }
        emails['all'] = emails['in'] + emails['out'];
        break;

      case 'Undirected':
        for (var i=0; i< arrEdgesData.length; i++) {
          if ((arrEdgesData[i].origin == nodeId) || (arrEdgesData[i].target == nodeId)) {
            emails['all'] += 1;
          }
        }
        break;
    }
    return emails;
  }

  /*Get node number of emails*/
  function getEmailsNum(args,data){
    var elemId = args.elemId;
    var type = args.type;
    var dataType = args.dataType;

    var emails = {'all': 0, 'in':0, 'out':0};
    switch (type) {
        case 'node':
          for (var i = 0; i < data.edges.length; i++) {
            if (dataType == "Directed") {
                if (data.edges[i].from == elemId) {
                  emails['out'] += 1;
                }
                if (data.edges[i].to == elemId) {
                  emails['in'] += 1;
                }
            }else{
              if ((data.edges[i].from == elemId) || (data.edges[i].to == elemId)){
                emails['all'] += 1;
              }
            }
          }
          if (dataType == "Directed") { emails['all'] = emails['in'] + emails['out'];}
        break;

        case 'edge':
          for (var i = 0; i < data.edges.length; i++) {
            if (data.edges[i].id == elemId) {
              emails['all'] += 1;
            }
          }
          break;

        case 'network':
          emails['all'] = data.edges.length;
          break;
    }

    return emails;
  }

  /*Generate fields of the info section*/
  function genNetInfoSectionFields(objElem){
    var resObj =
    {
      'numNodes' : objElem.graphData.nodes.length,
      'numEdges' : objElem.graphData.edges.length,
      'dataType': "Filtered"
    }
    return resObj;
  }
  function genAllNetInfoSectionFields(objElem){
    var resObj =
    {
      'numNodes' : util.lengthJsonObj(objElem.nodes),
      'numEdges' : util.lengthJsonObj(objElem.edges),
      'dataType': "All"
    }
    return resObj;
  }
  function genNodeInfoSectionFields(objElem){
    var objInfo = objElem;
    //This means the node is taken from all the original data
    if(!objElem.hasOwnProperty('degree')){
      objInfo['degree'] = objInfo['baseDegree']['degree'];
      objInfo['inDegree'] = objInfo['baseDegree']['inDegree'];
      objInfo['outDegree'] = objInfo['baseDegree']['outDegree'];
      objInfo['sumEdgesW'] = objInfo.baseValue.all;
      objInfo['sumInEdgesW'] = objInfo.baseValue.in;
      objInfo['sumOutEdgesW'] = objInfo.baseValue.out;
      objInfo['database'] = "All data";
      objInfo['dataType'] = "Directed";
    }
    objInfo['default'] = "Try to select a node!";
    return objInfo;
  }
  function genEdgeInfoSectionFields(objElem){
    var objInfo = objElem;
    //This means the edge is taken from all the original data
    if(!objElem.hasOwnProperty('weight')){
      objInfo['weight'] = objInfo['baseWeight'];
      objInfo['database'] = "All data";
      objInfo['dataType'] = "Directed";
    }
    objInfo['default'] = "Try to select an edge!";
    return objInfo;
  }
  function genContactsListSectionFields(objElem){
    var objInfo = objElem;
    //check if it's from all the data
    if(objInfo.hasOwnProperty("baseValue")){
      if(!objInfo.hasOwnProperty("value")){
        objInfo['sumEdgesW'] = objInfo.baseValue.all;
      }
    }
    return objInfo;
  }
  function genLinksListSectionFields(objElem){
    var objInfo = objElem;
    //check if it's from all the data
    if(objInfo.hasOwnProperty("baseWeight")){
      if(!objInfo.hasOwnProperty("value")){
        objInfo['weight'] = objInfo.baseWeight;
      }
    }
    return objInfo;
  }

  return {
    computeDataInfos: computeDataInfos,
    getDegree: getDegree,
    getEmailsNum: getEmailsNum,
    genAllNetInfoSectionFields: genAllNetInfoSectionFields,
    genNetInfoSectionFields: genNetInfoSectionFields,
    genNodeInfoSectionFields: genNodeInfoSectionFields,
    genEdgeInfoSectionFields: genEdgeInfoSectionFields,
    genContactsListSectionFields: genContactsListSectionFields,
    genLinksListSectionFields: genLinksListSectionFields,
    getNeighborhood: getNeighborhood
  }
})();
