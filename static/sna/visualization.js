
var visualizationSNA = (function () {

    var snaData = {};
    var mainData = {};
    var sysData = {};
    var myData = {};
    var strIndent = "\xa0\xa0\xa0\xa0\xa0\xa0";

    function initGraphNetwork(type,myMainData) {

        var mainData = myMainData;
        if(type == "Undirected"){
          mainData.visualizations.panel0.drawFunc = "drawUndirectedGN";
          mainData.visualizations.panel0.redrawFunc = "buildUndirectedGraphData";
          mainData.visualizations.panel0.active = true;
          mainData.visualizations.panel0.filter = true;
          mainData.visualizations.panel0.data = "Undirected";
        }else{
          mainData.visualizations.panel1.drawFunc = "drawDirectedGN";
          mainData.visualizations.panel1.redrawFunc = "buildDirectedGraphData";
          mainData.visualizations.panel1.active = true;
          mainData.visualizations.panel1.filter = true;
          mainData.visualizations.panel1.data = "Directed";
        }
        return mainData;
    }

    function drawGraphNetwork(containerId,type,sysData) {
      var container = document.getElementById(containerId);
      var data = {
        nodes: sysData.networksDS[type].nodes,
        edges: sysData.networksDS[type].edges,
      };
      var options = {
        interaction:{
          hover:true,
          hoverConnectedEdges: true,
        },
        physics: {
            "barnesHut": {
              "centralGravity": 1,
              "gravitationalConstant": -28000,
            },
        },
        nodes: {
          shape: 'dot',
          color: {
                  border:'#00ACE6',
                  //background: '#00ACE6',
                  hover: {
                    //border: '#FF5050',
                    //background: '#FF5050'
                  },
                  highlight: {
                    //background: '#FF5050',
                    //border: '#3c3c3c'
                  }
          },
          scaling:{
              min: 10,
              max: 60,
              label: {
                  min:8,
                  max:20
              }
          }
        },
        edges: {
          color:{
              //color: '#0099CC',
              //opacity: 0.8,
          },
          scaling:{
              min: 0.5,
              max: 12.5,
          },
        }
      };

      sysData.networks[type] = new vis.Network(container, data, options);
      /*
      sysData.networks[type].on("hoverNode", function(node){});
      sysData.networks[type].on("blurNode", function(node){});
      sysData.networks[type].on("click", function (params) {
          //console.log(params);
        if (!params.nodes[0] == []) {
          var selectedNodes = snaData.networks[currentPanel].getSelectedNodes();
          //onNodeSelection(selectedNodes[0],true,"filtered");
        }else{
          if (!params.edges[0] == []) {
              var selectedEdges = snaData.networks[currentPanel].getSelectedEdges();
              //onEdgeSelection(selectedEdges[0],true,"filtered");
          }
        }
      });
      sysData.networks[type].on("selectNode", function (params) {
          var selectedNodes = snaData.networks[currentPanel].getSelectedNodes();
          //console.log(selectedNodes[0]);
          snaData.networks[type].focus(selectedNodes[0]);
      });
      sysData.networks[type].on("doubleClick", function (params) {
        //if i select a node
        if (!params.nodes[0] == []) {

          snaData.netCache[currentPanel].nodes.push(snaData.networksDS[currentPanel].nodes.get());
          snaData.netCache[currentPanel].edges.push(snaData.networksDS[currentPanel].edges.get());

          var connectedNodes = snaData.networks[currentPanel].getConnectedNodes(params.nodes[0]);
          if(!isInArray(params.nodes[0], connectedNodes)){connectedNodes.push(params.nodes[0]);}

          //var arrNodes = getDataFromIds('nodes',connectedNodes);
          var arrNodes = snaData.networksDS[currentPanel].nodes.get(connectedNodes);
          //var arrEdges = getDataFromIds('edges',params.edges);
          var arrEdges = snaData.networksDS[currentPanel].edges.get(params.edges);

          updateGN(currentPanel,'nodes',arrNodes);
          updateGN(currentPanel,'edges',arrEdges);

          document.getElementById(currentPanel+'CircularPopup').style.visibility = "visible";
          genInfos();
          //defaultSet();
        }
        //if i click on an empty space I get back to the previous state
        else{
          if (snaData.netCache[currentPanel].nodes.length > 0) {
            var arrNodes = snaData.netCache[currentPanel].nodes.pop();
            if(arrNodes.length > 0){updateGN(currentPanel,'nodes',arrNodes);}
          }

          if (snaData.netCache[currentPanel].edges.length > 0) {
            var arrEdges = snaData.netCache[currentPanel].edges.pop();
            if(arrEdges.length > 0){updateGN(currentPanel,'edges',arrEdges);}
          }

          if ((snaData.netCache[currentPanel].nodes.length == 0) && (snaData.netCache[currentPanel].edges.length == 0)) {
              document.getElementById(currentPanel+'CircularPopup').style.visibility = "hidden";
          }
          genInfos();
          //defaultSet();
        }

      });
      */
      return {networks: sysData.networks};
    }

    function onNodeSelection(id,enterScope,selType) {
          netSelectedItem[currentPanel].node.id = id;
          netSelectedItem[currentPanel].node.selType = selType;
          var scope = angular.element(document.getElementById("infoTab")).scope();
          if (enterScope) {
              scope.$apply(function(){
                 nodeSelectedInfo(scope);
              });
          }else{
              nodeSelectedInfo(scope);
          }
    }
    function onEdgeSelection(id,enterScope,selType) {
          netSelectedItem[currentPanel].edge.id = id;
          netSelectedItem[currentPanel].edge.selType = selType;
          var scope = angular.element(document.getElementById("infoTab")).scope();
          if (enterScope) {
              scope.$apply(function(){
                  edgeSelectedInfo(scope);
              });
          }else{
              edgeSelectedInfo(scope);
          }
    }

    /*Build the network graph data according to what*/
    function buildGraphData(keyDataType) {
            var dicResults = {};

            var edgesResults = [];
            //index of inserted edges so no duplicates can happen
            var edgeIndex = {};
            for (var i = 0; i < sysData.filteredData[keyDataType].edges.length; i++) {
                var edgeObj = sysData.filteredData[keyDataType].edges[i];
                //in order to never add duplicates
                if (! edgeIndex.hasOwnProperty(edgeObj['id'])) {

                    /*add important fields to graph vis*/
                    if (keyDataType == "Directed") {
                        edgeObj['arrows'] = 'to';
                    }
                    edgeObj['value'] = edgeObj[sysData.objNetStyle[keyDataType].edgeSize];
                    var elemColor = guiUtil.mapColor(-1,'edge');
                    edgeObj['color'] = {'color':elemColor,'opacity':0.53,'highlight':'#848484','hover':'#848484'};
                    /********/

                    edgesResults.push(edgeObj);
                    edgeIndex[edgeObj['id']] = 'true';
                }
            }
            updateGN(keyDataType,'edges',edgesResults);

            var nodesResults = [];
            for (var i = 0; i < sysData.filteredData[keyDataType].nodes.length; i++) {
                var nodeObj = sysData.filteredData[keyDataType].nodes[i];

                /*add important fields to graph vis*/
                nodeObj['value'] = nodeObj[sysData.objNetStyle[keyDataType].nodeSize];
                var elemColor = guiUtil.mapColor(-1,'node');
                console.log(elemColor);
                nodeObj['color'] = {'background': elemColor, 'highlight':{background: elemColor,border:'#A0A0A0'},hover:{background:elemColor,border:'#A0A0A0'}};
                /********/

                nodesResults.push(nodeObj);
            }
            updateGN(keyDataType,'nodes',nodesResults);

            /*reset selected item*/
            sysData.netSelectedItem[keyDataType].node = {'id':null,'selType':null};
            sysData.netSelectedItem[keyDataType].edge = {'id':null,'selType':null};
            myData["netSelectedItem"] = sysData.netSelectedItem;
    }

    function updateGN(netType,dsType,arr) {
          switch (dsType) {
              case 'nodes':
                  sysData.networksDS[netType].nodes.clear();
                  sysData.networksDS[netType].nodes.add(arr);
                  break;
              case 'edges':
                  sysData.networksDS[netType].edges.clear();
                  sysData.networksDS[netType].edges.add(arr);
                  break;
          }
          myData["networksDS"] = sysData.networksDS;
      }

    /*generate the data needed*/
    function genVisualizationData(){

      function genNetworks(){
        var typeNet = ['Directed','Undirected'];
        var dataObj = {};
        for (var i = 0; i < typeNet.length; i++) {
          dataObj[typeNet[i]] = null;
        }
        return dataObj;
      }
      function genNetworkDS(){
        var typeNet = ['Directed','Undirected'];
        var dataObj = {};
        for (var i = 0; i < typeNet.length; i++) {
          dataObj[typeNet[i]] = {nodes: null, edges: null};
        }
        return dataObj;
      }
      function genNetCache(){
        var typeNet = ['Directed','Undirected'];
        var dataObj = {};
        for (var i = 0; i < typeNet.length; i++) {
          dataObj[typeNet[i]] = {nodes: [],edges: []};
        }
        return dataObj;
      }
      function genNetSelectedItem(){
        var typeNet = ['Directed','Undirected'];
        var dataObj = {};
        for (var i = 0; i < typeNet.length; i++) {
          dataObj[typeNet[i]] = { node:{id: null, selType: null}, edge:{id: null, selType: null}};
        }
        return dataObj;
      }
      function genNetStyle(){
        var typeNet = ['Directed','Undirected'];
        var dataObj = {};
        for (var i = 0; i < typeNet.length; i++) {
          dataObj[typeNet[i]] = {nodeSize: "sumEdgesW",edgeSize: "weight",nodeColor: "none",edgeColor: "none"};
        }
        return dataObj;
      }

      return {
        networks: genNetworks(),
        networksDS: genNetworkDS(),
        netCache: genNetCache(),
        netSelectedItem: genNetSelectedItem(),
        objNetStyle: genNetStyle()
      };
    }


    /*generate the array of rows to add in the info section*/
    function genNodeInfoSectionRows(obj,rowType){
      console.log(obj);
      var objInfo = analysisSNA.genNodeInfoSectionFields(obj);
      //Arr elements {newRow,typeRow}
      var arrRows = [
        {id: "title", row: {name: objInfo.label,"rowType": rowType,'iconClass':'large github middle aligned icon'},type: "title-elem"},
        {row: {name: "",value: "","rowType": rowType}, type: 'blank-row'},
        {row: {name: "",value: "","rowType": rowType}, type: 'fitted-divider-row'},
        {id: "database", row: {name:"Type: ",value: objInfo.dataType,"rowType": rowType}, type: "info-elem"},
        {row: {name:"Database: ",value: objInfo.database,"rowType": rowType}, type: "info-elem"},
        {row: {name: "",value: "","rowType": rowType}, type: 'fitted-divider-row'},
        {row: {name:"Degree: ",value:objInfo.degree,"rowType": rowType,'infoVal': util.getInfoText('nodeDegree'),'infoPos':'bottom center','infoClass':'icon small grey help circle'}, type: "info-elem"}
      ];
      if (objInfo.dataType == "Directed")
          arrRows.push(
            {row: {name: strIndent+"In-Degree: ",value: objInfo.inDegree,"rowType": rowType}, type: "sec-info-elem"},
            {row: {name: strIndent+"Out-Degree: ",value: objInfo.outDegree,"rowType": rowType}, type: "sec-info-elem"}
          );
      arrRows.push(
        {row: {name: "",value: "","rowType": rowType}, type:'fitted-divider-row'},
        {row: {name:"Number of all messages: ",value: objInfo.sumEdgesW, "rowType": rowType,'infoId': rowType+'-'+'numEmails','infoVal': util.getInfoText('messagesNumber'),'infoPos':'bottom center','infoClass':'icon small grey help circle'},type: "info-elem"}
      );
      if (objInfo.dataType == "Directed")
          arrRows.push(
            {row: {name: strIndent+"Messages received: ",value: objInfo.sumInEdgesW,"rowType": rowType}, type: "sec-info-elem"},
            {row: {name: strIndent+"Messages sent: ",value: objInfo.sumOutEdgesW,"rowType": rowType}, type: "sec-info-elem"}
          );
      return arrRows;
    }
    function genEdgeInfoSectionRows(obj,rowType){
      var objInfo = analysisSNA.genEdgeInfoSectionFields(obj);
      //Arr elements {row: ,type:}
      var arrRows = [
        {id: "title", row: {name: "From: "+objInfo.fromLbl,"rowType": rowType},type: "title-elem"},
        {id: "title", row: {name: "To: "+objInfo.toLbl,"rowType": rowType},type: "title-elem"},
        {row: {name: "",value: "","rowType": rowType},type: "blank-row"},
        {row: {name: "",value: "","rowType": rowType},type: "blank-row"},
        {id: "dataType", row: {name:"Edge type: ",value: objInfo.dataType,"rowType": rowType},type: "info-elem"},
        {row: {name:"Database: ",value: objInfo.database,"rowType": rowType}, type: "info-elem"},
        {row: {name: "",value: "","rowType": rowType},type: 'fitted-divider-row'},
        {row: {name:"Edge weight: ",value: objInfo.weight,"rowType": rowType,'infoVal': util.getInfoText('edgeWeight'),'infoPos':'bottom center','infoClass':'icon small grey help circle'}, type: "info-elem"}
      ];
      return arrRows;
    }
    function genNetInfoSectionRows(obj,rowType){
      var objInfo = analysisSNA.genNetInfoSectionFields(obj);
      //Arr elements {row: ,type:}
      var arrRows = [
        {id: "title", row: {name: "",value: "","rowType": rowType}, type: "blank-row"},
        {row: {name: "Number of nodes:",value: objInfo.numNodes,"rowType": rowType}, type: 'info-elem'},
        {row: {name: "Number of edges:",value: objInfo.numEdges,"rowType": rowType}, type: 'info-elem'},
        {row: {name: "",value: "","rowType": rowType},type: 'fitted-divider-row'},
        {row: {name: "Type of network:",value: objInfo.dataType,"rowType": rowType}, type: 'info-elem'},
        {row: {name: "",value: "","rowType": rowType},type: 'fitted-divider-row'}
      ];
      return arrRows;
    }
    function genAllNetInfoSectionRows(obj,rowType){
      var objInfo = analysisSNA.genAllNetInfoSectionFields(obj);
      //Arr elements {row: ,type:}
      var arrRows = [
        {id: "title", row: {name: "",value: "","rowType": rowType}, type: "blank-row"},
        {row: {name: "Number of nodes:",value: objInfo.numNodes,"rowType": rowType}, type: 'info-elem'},
        {row: {name: "Number of edges:",value: objInfo.numEdges,"rowType": rowType}, type: 'info-elem'},
        {row: {name: "",value: "","rowType": rowType},type: 'fitted-divider-row'},
        {row: {name: "Type of network:",value: objInfo.dataType,"rowType": rowType}, type: 'info-elem'},
        {row: {name: "",value: "","rowType": rowType},type: 'fitted-divider-row'}
      ];
      return arrRows;
    }
    function buildListRows(arrElems,rowType,initIndex){
      var arrRows = [];
      var i=0;
      while ( (i<(objSystemConf.rowsLimit + initIndex)) && (i< (arrElems.length)) ) {
        var arrElem = arrElems[i];
        var objInfo;

        //check if is a links
        if(arrElem.hasOwnProperty("fromLbl")){
            objInfo = analysisSNA.genLinksListSectionFields(arrElem);
            var myRow = {id: arrElem.id, type: 'edge' ,name: "From: "+arrElem.fromLbl, "origin": arrElem.from, "destination": arrElem.to, "rowType": rowType, selectable: {value: true, action: [{controller: "controllerSNA", func:"onLinkSelected", params: objInfo}]}};
            var myRow2nd = {"name2nd": 'To: '+ arrElem.toLbl, "iconValue": arrElem.weight};
            arrRows.push({row: util.extend(myRow,myRow2nd), type: 'list-elem'});
        }else {
            //is a contact
            objInfo = analysisSNA.genContactsListSectionFields(arrElem);
            arrRows.push({row: {type:'node',name:objInfo.label,id:objInfo.id,iconValue: objInfo.sumEdgesW, "rowType": rowType, selectable: {value: true, action: [{controller: "controllerSNA", func:"onContactSelected", params: objInfo}]}} ,type: 'contact-list-elem'});
        }

        //add divider for next elem
        arrRows.push({row: {name: "",value: "","rowType": rowType},type: 'fitted-divider-row'});
        i++;
      }

      //add the next button to load more elements
      if ((objSystemConf.rowsLimit+initIndex) < arrElems.length) {
        arrRows.push({row: {name: "",iconValue: "Load more ...","rowType": rowType+"-nextbtn",
          selectable: {value: true, action: [{controller: "controllerSNA", func:"nexElemsList", params: {'index':i,'arrElems':arrElems, rowType: rowType}}]}},
          type: 'middle-arrow'});
      }

      //return an array of all the rows
      return arrRows;
    }

    return {
      genVisualizationData: genVisualizationData,
      initGraphNetwork: initGraphNetwork,
      buildGraphData: buildGraphData,
      drawGraphNetwork: drawGraphNetwork,

      genNodeInfoSectionRows: genNodeInfoSectionRows,
      genEdgeInfoSectionRows: genEdgeInfoSectionRows,
      genNetInfoSectionRows: genNetInfoSectionRows,
      genAllNetInfoSectionRows: genAllNetInfoSectionRows,
      buildListRows: buildListRows
    }
})();
