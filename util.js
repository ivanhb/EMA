var util = (function () {

      function jsonToArr(obj){
        var resArr = [];
        for (var keyId in obj) {
          resArr.push(obj[keyId]);
        }
        return resArr;
      }

      function getMax(arr, prop) {
            var max;
            for (var i=0 ; i<arr.length ; i++) {
              if (!max || parseInt(arr[i][prop]) > parseInt(max[prop]))
                  max = arr[i];
            }
            return max;
      }

      function getMin(arr, prop) {
        var min;
            for (var i=0 ; i<arr.length ; i++) {
              if (!min || parseInt(arr[i][prop]) > parseInt(min[prop]))
                  min = arr[i];
            }
            return min;
      }

      function avgByKey(arr,key){
            var sum = 0;
            for (var i=0; i<arr.length; i++) {
                  sum = sum + arr[i][key];
            }
            var avg = sum/arr.length ;
            return avg;
      }

      function sortByKey(array, key, type) {
            return array.sort(function(a, b) {

              if ((key == "label") || (key == "originLbl")){
                var x = a[key].toLowerCase();
                var y = b[key].toLowerCase();
              }else{
                  if (key == "date") {
                       var x = new Date(a[key]);
                       var y = new Date(b[key]);
                  }else{
                        if (key == "score") {
                              var x = parseFloat(a[key]);
                              var y = parseFloat(b[key]);
                        }
                        else{
                              var x = parseInt(a[key]);
                              var y = parseInt(b[key]);
                        }
                  }
              }

              if (type == 'desc') {
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
              }else{
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
              }
            });
      }

      function sortArray(array,dataType,type) {
            return array.sort(function(a, b) {

              var x = parseInt(a);
              var y = parseInt(b);

              if (dataType == "datetime") {
                  var x = new Date(a);
                  var y = new Date(b);
              }

              if (type == 'desc') {
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
              }else{
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
              }
            });
      }

      function ifInArrJsonReturnVal(arrJson,key,val,retKey){
            if (arrJson != null) {
                  for (var i=0;i<arrJson.length;i++) {
                    var objElem = arrJson[i];
                    if (objElem[key] == val) {
                        if (retKey = "all") {
                          return objElem;
                        }else{
                          return objElem[retKey];
                        }
                    }
                  }
            }
            return -1;
      }

      function maxJsonVal(jsonObj,keyVal) {
            var max= -1;
            if (jsonObj != {}) {
                  for (key in jsonObj) {
                        var elem = jsonObj[key][keyVal];
                        if (elem > max){
                              max = elem;
                        }
                  }
            }

            return max;
      }

      function maxOccInArr(array){
          if(array.length == 0)
              return null;

          var modeMap = {};
          var maxEl = array[0];
          var maxCount = 0;
          for(var i = 0; i < array.length; i++)
          {
              var el = array[i];
              if(!modeMap.hasOwnProperty(el)){
                  modeMap[el] = 1;
              }
              else{
                  modeMap[el]++;
              }

              if(modeMap[el] > maxCount)
              {
                  maxEl = el;
                  maxCount = modeMap[el];
              }
          }
          return maxEl;
      }

      function edgeSide(edge,nodeId) {
          if (edge.from == nodeId) {
            return 'sender';
          }else{return 'receiver';}
      }

      function getIdsArr(arr) {
        arrIds = [];
        for (var i in arr) {
          arrIds.push(arr[i].id);
        }
        return arrIds;
      }

      function formatDate(value){
        return value.getFullYear() + "/" + ((value.getMonth()) + 1) + "/" + value.getDate();
      }

      function undoformatDate(dString){
          var parts = dString.split('/');
          //javascript counts months from 0: January - 0, February - 1, etc
          return mydate = new Date(parts[0],parts[1]-1,parts[2]);
      }

      function StringformatDate(value) {
        var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
        return value.getDate() + " " + monthNames[value.getMonth()] + " " + value.getFullYear();
      }

      function StringformatDateYM(value) {
         var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
         return  monthNames[value.getMonth()] + " " + value.getFullYear();
      }

      function StringformatDateM(value) {
        var monthNames = ["January", "February", "March", "April", "May", "June","July", "August", "September", "October", "November", "December"];
        return  monthNames[value.getMonth()];
      }

      //dateA granularity bigger than dateB
      function inDate(dateA,dateB) {
            if (date.A.getMonth() == dateB.getMonth) {
                  return true
            }
            return false;
      }

      function laterDate(arrJson,val){
            if (arrJson.length > 0) {
                  var bestDate = new Date(arrJson[0][val]);
                  for (var i = 1; i < arrJson.length; i++){
                        var iDate = new Date(arrJson[i][val]);
                        if (iDate > bestDate) {
                              bestDate = iDate;
                        }
                  }
                  return bestDate;
            }
            return -1;
      }

      function earlierDate(arrJson,val){
            if (arrJson.length > 0) {
                  var bestDate = new Date(arrJson[0][val]);
                  for (var i = 1; i < arrJson.length; i++){
                        var iDate = new Date(arrJson[i][val]);
                        if (iDate < bestDate) {
                              bestDate = iDate;
                        }
                  }
                  return bestDate;
            }
            return -1;
      }

      function lengthJsonObj(obj) {
            var count=0;
            for(var prop in obj) {
               if (obj.hasOwnProperty(prop)) {
                  ++count;
               }
            }
            return count;
      }

      function extend(a, b){
            for(var key in b)
                if(b.hasOwnProperty(key))
                    a[key] = b[key];
            return a;
      }

      function getInfoText(typeX) {
          var textualContent = "";
          switch (typeX) {
              case 'nodeValue': textualContent = "Node value: the sum of all connected edges weight"; break;
              case 'edgeWeight': textualContent = "Edge weight: the number of messages between two nodes"; break;
              case 'nodeDegree': textualContent = "The number of connected edges"; break;
              case 'relationshipsNetwork': textualContent = ""; break;
              case 'msgsTrafficNetwork': textualContent = ""; break;
              case 'concepts': textualContent = ""; break;
              case 'wordsFrequency': textualContent = ""; break;
              case 'infoMenu1': textualContent = ""; break;
              case 'infoMenu2': textualContent = ""; break;
              case 'messagesNumber': textualContent = "The effective number of messages: e.g if the email=[from: A, to: B, cc: C], then we have 2 messages: A-B and A-C"; break;
              case 'emailsNumber': textualContent = "The original number of emails: e.g if the email=[from: A, to: B, cc: C], then we have 1 email, we don't consider individual messages to all the destinations"; break;
              case 'subjectsTimeline': textualContent = "Click on the subject name to open the related timeline. Clicking on a timeline element will show the original related message"; break;
              default: textualContent = ""; break;
          }

          return textualContent;
      }

      function mergeNodesEdges(nodes,edges){
          var finalArr = [];
          for (var i=0; i<edges.length;i++) {
              var fromNode = nodes.get(edges[i].from);
              var toNode = nodes.get(edges[i].to);
              if ((fromNode != null) && (toNode != null)) {
                  finalArr.push(edges[i]);
              }
          }
          return finalArr;
      }

      function bestCollaborators(nodeId){
          var edgesIdArr = networks[currentPanel].getConnectedEdges(nodeId);
          var bestEdgeVal = {edge:0,inEdge:0,outEdge:0};
          var bestEdgeId = {edge:null,inEdge:null,outEdge:null};

          for (var i=0; i<edgesIdArr.length;i++) {

              var edgeObj = networksDS[currentPanel].edges.get(edgesIdArr[i]);
              var edgeVal = parseInt(edgeObj.value);
              if ( edgeVal > bestEdgeVal.edge) {
                  bestEdgeVal.edge = edgeVal;
                  bestEdgeId.edge = edgesIdArr[i];
              }

              switch (edgeSide(edgeObj,nodeId)) {

                  case 'sender':
                        if (edgeVal > bestEdgeVal.outEdge) {
                            bestEdgeVal.outEdge = edgeVal;
                            bestEdgeId.outEdge = edgesIdArr[i];
                        }
                        break;

                  case 'receiver':
                        if (edgeVal > bestEdgeVal.inEdge) {
                            bestEdgeVal.inEdge = edgeVal;
                            bestEdgeId.inEdge = edgesIdArr[i];
                        }
                        break;
              }
          }

          var bestEdge = {edge:networksDS[currentPanel].edges.get(bestEdgeId.edge), inEdge:networksDS[currentPanel].edges.get(bestEdgeId.inEdge), outEdge:networksDS[currentPanel].edges.get(bestEdgeId.outEdge) };
          var bestNodes = {node: null,fromNode: null,toNode: null};
          if (edgeSide(bestEdge.edge,nodeId) == "sender") {bestNodes.node = bestEdge.edge.to;}else{bestNodes.node = bestEdge.edge.from;}
          bestNodes.fromNode = bestEdge.inEdge.from;
          bestNodes.toNode = bestEdge.outEdge.to;

          return bestNodes;
        }

      function orderSubjList(arrSubj) {
          var arrSubjCounts = [];
          for (var i=0;i<arrSubj.length;i++) {
              var objSubj = {'subject':arrSubj[i].subject,
                              'count(time)':arrSubj[i].timeS.length,
                              'timeS': arrSubj[i].timeS
                          };
              arrSubjCounts.push(objSubj);
          }

          return sortByKey(arrSubjCounts, 'count(time)','desc');
      }

      function intersection_destructive(a, b, fieldAtt){
        var result = [];
        while( a.length > 0 && b.length > 0 )
        {
           if      (a[0][fieldAtt] < b[0][fieldAtt] ){ a.shift(); }
           else if (a[0][fieldAtt] > b[0][fieldAtt] ){ b.shift(); }
           else /* they're equal */
           {
             result.push(a.shift());
             b.shift();
           }
        }

        return result;
      }

      function intersectWithOriginalData(a,b,fieldAtt){
        var result = [];

        /*get array of fieldAtt for b*/
        var okIdsArr = [];
        for (var i = 0; i < b.length; i++) {
          okIdsArr.push(b[i][fieldAtt]);
        }

        for (var i = 0; i < a.length; i++) {
          if(okIdsArr.indexOf(a[i][fieldAtt]) >= 0){
            result.push(a[i]);
          }
        }

        return result;
      }

      function findNested(obj, key, memo) {
        var i,
            proto = Object.prototype,
            ts = proto.toString,
            hasOwn = proto.hasOwnProperty.bind(obj);

        if ('[object Array]' !== ts.call(memo)) memo = [];

        for (i in obj) {
          if (hasOwn(i)) {
            if (i === key) {
              memo.push(obj[i]);
            } else if ('[object Array]' === ts.call(obj[i]) || '[object Object]' === ts.call(obj[i])) {
              findNested(obj[i], key, memo);
            }
          }
        }

        return memo;
      }

      function pushAttInObj(originalObj,obj){
        resObj = originalObj;
        for (var keyAtt in obj) {
          resObj[keyAtt] = obj[keyAtt];
        }
        return resObj;
      }

      return {
        pushAttInObj: pushAttInObj,
        ifInArrJsonReturnVal: ifInArrJsonReturnVal,
        formatDate: formatDate,
        StringformatDate: StringformatDate,
        formatDate: formatDate,
        lengthJsonObj: lengthJsonObj,
        extend:extend,
        jsonToArr: jsonToArr,
        getInfoText: getInfoText
      }
})();
