
var analysisEAA = (function () {

  /*return the email domain of a contact, and add the domain to the global list*/
  function getDomain(arrObj,nodeId,netType) {
      var domainName = arrObj.nodes[nodeId].label.split("@")[1];
      return domainName;
  }
  function getTimeRange(allDataKey, elemId, type, netType){

    var arrEdges = allDataKey.edges;
    var myTimeRange;

    switch (type) {
      case "nodes":

        if(netType == "Directed"){
            myTimeRange = {sent: {first: null, last: null}, received: {first: null, last: null}};
            for (var i=1;i<arrEdges.length;i++) {
              var edgeObj = arrEdges[i];
              var timeVal = new Date(edgeObj.time);

              //i am the sender
              if (edgeObj.from == elemId) {
                //it's first time
                if((myTimeRange.sent.first == null) && (myTimeRange.sent.last == null)){
                  myTimeRange.sent.first = timeVal;
                  myTimeRange.sent.last = timeVal;
                }else {
                  if (timeVal > myTimeRange.sent.last) { myTimeRange.sent.last = timeVal;}
                  else{ if (timeVal < myTimeRange.sent.first) {myTimeRange.sent.first = timeVal;}}
                }
              }

              //i am the receiver
              if (edgeObj.to == elemId) {
                //it's first time
                if((myTimeRange.received.first == null) && (myTimeRange.received.last == null)){
                  myTimeRange.received.first = timeVal;
                  myTimeRange.received.last = timeVal;
                }else {
                  if (timeVal > myTimeRange.received.last) { myTimeRange.received.last = timeVal;}
                  else{ if (timeVal < myTimeRange.received.first) {myTimeRange.received.first = timeVal;}}
                }
              }
            }
          }else {
              if (netType == "Undirected") {
                myTimeRange = {first: null, last: null};
                for (var i=1;i<arrEdges.length;i++) {
                  var edgeObj = arrEdges[i];
                  var timeVal = new Date(edgeObj.time);

                  if ((edgeObj.from == elemId) || (edgeObj.to == elemId)){
                    //it's first time
                    if((myTimeRange.first == null) && (myTimeRange.last == null)){
                      myTimeRange.first = timeVal;
                      myTimeRange.last = timeVal;
                    }else {
                      if (timeVal > myTimeRange.last) { myTimeRange.last = timeVal;}
                      else{ if (timeVal < myTimeRange.first) {myTimeRange.first = timeVal;}}
                    }
                  }
                }
              }
            }
        break;

      case "edges":
          myTimeRange = {first: null, last: null};
          for (var i=1;i<arrEdges.length;i++) {
            var edgeObj = arrEdges[i];
            var timeVal = new Date(edgeObj.time);

            if (edgeObj.id == elemId) {
              //it's first time
              if((myTimeRange.first == null) && (myTimeRange.last == null)){
                myTimeRange.first = timeVal;
                myTimeRange.last = timeVal;
              }else {
                if (timeVal > myTimeRange.last) { myTimeRange.last = timeVal;}
                else{ if (timeVal < myTimeRange.first) {myTimeRange.first = timeVal;}}
              }
            }
          }
          break;
        default:
          myTimeRange = {first: null, last: null};
          for (var i=1;i<arrEdges.length;i++) {
            var edgeObj = arrEdges[i];
            var timeVal = new Date(edgeObj.time);
            if((myTimeRange.first == null) && (myTimeRange.last == null)){
              myTimeRange.first = timeVal;
              myTimeRange.last = timeVal;
            }else {
              if (timeVal > myTimeRange.last) { myTimeRange.last = timeVal;}
              else{ if (timeVal < myTimeRange.first) {myTimeRange.first = timeVal;}}
            }
          }
    }
    return myTimeRange;
  }

  function getEdgeListEmails(myDomainData, elemObj, dataType){

    var myEmails = [];
    for (var i = 0; i < myDomainData.allEmails.length; i++) {
      var emailObj = myDomainData.allEmails[i];

      if (emailObj.from.indexOf(elemObj.fromLbl) >= 0) {
        if ((emailObj.to.indexOf(elemObj.toLbl) >= 0) || (emailObj.cc.indexOf(elemObj.toLbl) >= 0)) {
          myEmails.push(emailObj);
        }
      }
      if(dataType == "Undirected"){
        if (emailObj.from.indexOf(elemObj.toLbl) >= 0) {
          if ((emailObj.to.indexOf(elemObj.fromLbl) >= 0) || (emailObj.cc.indexOf(elemObj.fromLbl) >= 0)) {
            myEmails.push(emailObj);
          }
        }
      }
    }
    return myEmails;
  }

  /*generate the infoData entry*/
  function computeDataInfos(myEaaData,myDomainData) {
    var eaaData = myEaaData;
    var domainData = myDomainData;

    for (var key in eaaData.infoData) {
      eaaData.infoData[key]['edges'] = computeInfo(domainData.allData[key],domainData,key, 'edges');
      eaaData.infoData[key]['nodes'] = computeInfo(domainData.allData[key],domainData,key, 'nodes');
    }
    return eaaData;
  }
  function computeInfo(arrObj,myDomainData, dataType, type) {

    var objInfoData = {};

    switch (type) {
      case 'edges':

          //arrObj is the allData[netkey]
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
                                'baseTime': getTimeRange(arrObj, edgeObj.id, type, dataType),
                                'listEmails': getEdgeListEmails(myDomainData,edgeObj,dataType)
              }
            }
          }
          break;
      case 'nodes':
            //arrObj is the allData[netkey]
            var nodesList = arrObj.nodes;
            for (var nodeId in nodesList) {
              if (!objInfoData.hasOwnProperty(nodeId)) {
                objInfoData[nodeId] = {
                                    'id': nodeId,
                                    'label': nodesList[nodeId].label,
                                    'baseTime': getTimeRange(arrObj, nodeId, type, dataType),
                                    'domain': getDomain(arrObj,nodeId,dataType)
                }
              }
            }
            break;
    }
    return objInfoData;
  }

  return {
    computeDataInfos: computeDataInfos,
    getTimeRange: getTimeRange
  }
})();
