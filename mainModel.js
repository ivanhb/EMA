
/*Analysis related to the domain data: the data in the core*/
var domainDataAnalysis = (function (){

  function convertDomainData(myDomainData){

    var resDic = {};
    for (var keyDataType in myDomainData.allData) {
    /*directed undirected*/
    resDic[keyDataType] = {};

      for (var keyElems in myDomainData.allData[keyDataType]) {
        /*nodes edges*/

        objsList = myDomainData.allData[keyDataType][keyElems];
        switch (keyElems) {
          case 'edges':
            resDic[keyDataType][keyElems] = [];
            for (var i=0; i< objsList.length;i++) {
              var edgeObj = objsList[i];
              resDic[keyDataType][keyElems].push({
                'id': edgeObj.id,
                'from': edgeObj.origin,
                'to': edgeObj.target,
                'fromLbl': edgeObj.originLbl,
                'toLbl': edgeObj.targetLbl,
                'subject': edgeObj.subject,
                'content': edgeObj.content,
                'time': edgeObj.time
              });
            }
            break;
          case 'nodes':
            resDic[keyDataType][keyElems] = {};
            for (var keyNode in objsList) {
              var nodeObj = objsList[keyNode];
              resDic[keyDataType][keyElems][keyNode] = nodeObj;
            }
            break;
        }
      }
    }
    return resDic;
  }
  return {
    convertDomainData: convertDomainData
  }
})();

/*Define the strategies/politics to apply when initializing and
updating the fields inside the data object in the main*/
var dataPolitics = (function (){
  var dataPolitics = {
    infoData: {init: "addAtt", update: "updateAtt"},
    filteredData: {init: null, update: "filterIntersect"},
    filteredGraphDataInfo: {init: null, update: "filterIntersect"},
    netCache: {init: null, update: null},
    netSelectedItem: {init: null, update: "redefine"},
    networks: {init: "redefine", update: null},
    networksDS: {init: "redefine", update: "redefine"},
    objFilter: {init: "addAttDirect", update: null},
    objNetStyle: {init: null, update: null},
    emailDomains: {init: null, update: null},
    infoSectionsGens: {init: null, update: null},
    infoSectionsVis: {init: null, update: null}
  }

  function getDataPolitics(dataName){
    if (dataPolitics.hasOwnProperty(dataName)) {
      return dataPolitics[dataName];
    }else {
      return null;
    }
  }
  function applyDataPolitics(keyData, phase, originalDataObj, dataObj){
    function addAttDirect(originalDataObj, dataObj){
      var resObj = originalDataObj;
      for (var keyAtt in dataObj) {
        if (!resObj.hasOwnProperty(keyAtt)) {
            resObj[keyAtt] = dataObj[keyAtt];
        }
      }
      return resObj;
    }
    function addAtt(originalDataObj, dataObj){

      var resObj = originalDataObj;
      for (var keyDataType in dataObj) {
        /*"directed", "undirected"*/
        var dataObjDataType = dataObj[keyDataType];

        for (var keyElems in dataObj[keyDataType]){
          /*"nodes", "edges"*/
          var dataObjElems = dataObjDataType[keyElems];

          for (var keyelem in dataObjElems) {
            /*the actual object*/
            var obj = dataObjElems[keyelem];

            if (resObj[keyDataType][keyElems].hasOwnProperty(keyelem)) {
              /*i will add new attributes*/

              for (var keyAtt in obj) {
                  if(!resObj[keyDataType][keyElems][keyelem].hasOwnProperty(keyAtt)){
                    resObj[keyDataType][keyElems][keyelem][keyAtt] = obj[keyAtt];
                  }
              }
            }
          }
        }
      }
      return resObj;
    }
    function updateAtt(originalDataObj, dataObj){
      return addAtt(originalDataObj, dataObj);
    }
    function filterIntersect(originalDataObj, dataObj){
          var resObj = {};
          for (var keyDataType in originalDataObj) {
            /*"directed", "undirected"*/
            resObj[keyDataType] = {};

            //for (var keyElems in originalDataObj[keyDataType]){
              /*"nodes", "edges"*/
              resObj[keyDataType].edges = [];
              resObj[keyDataType].nodes = [];
              var nodesIndex = {};
              for (var i = 0; i < dataObj[keyDataType].edges.length; i++) {
                  var dataObjElem = dataObj[keyDataType].edges[i];

                  if (util.ifInArrJsonReturnVal(originalDataObj[keyDataType].edges,"id",dataObjElem.id,"id") != -1){
                    //is in
                    resObj[keyDataType].edges.push(dataObjElem);

                    if(!nodesIndex.hasOwnProperty(dataObjElem.from)){
                      resObj[keyDataType].nodes.push(util.ifInArrJsonReturnVal(dataObj[keyDataType].nodes,"id",dataObjElem.from,"all"));
                      nodesIndex[dataObjElem.from] = dataObjElem.fromLbl;
                    }

                    if(!nodesIndex.hasOwnProperty(dataObjElem.to)){
                      resObj[keyDataType].nodes.push(util.ifInArrJsonReturnVal(dataObj[keyDataType].nodes,"id",dataObjElem.to,"all"));
                      nodesIndex[dataObjElem.to] = dataObjElem.toLbl;
                    }
                  }
              }
            //}
          }

          return resObj;
    }

    switch (dataPolitics[keyData][phase]) {
      case "filterIntersect": return filterIntersect(originalDataObj, dataObj); break;
      case "updateAtt": return updateAtt(originalDataObj, dataObj); break;
      case "addAttDirect": return addAttDirect(originalDataObj, dataObj); break;
      case "addAtt": return addAtt(originalDataObj, dataObj); break;
      case "redefine": return dataObj; break;
      case null: return originalDataObj; break;
    }
  }
  return {
    getDataPolitics: getDataPolitics,
    applyDataPolitics: applyDataPolitics
  }
})();

/*Update the data generated from the controllers*/
function updateMainData(myDataObj,phase){
  mainData = myDataObj;
}
function updateData(myDataObj,phase){
      /*fields to add like: infoData*/
      for (var keyDataField in myDataObj) {

        if(data.hasOwnProperty(keyDataField)){
          data[keyDataField] = dataPolitics.applyDataPolitics(keyDataField, phase, data[keyDataField] ,myDataObj[keyDataField]);
        }else {
          data[keyDataField] = myDataObj[keyDataField];
        }
      }
}
