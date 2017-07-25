
var guiUtil = (function(){

  var guiData = {
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

  };

  /*Initialize the system GUI and HTML components*/
  function initSystemGui() {

          window.onresize = function(event) {
              if (objWordClusters.circlesJson != null) {
                  drawCirclePacking(objWordClusters.circlesJson);
              }
          };

          $('.helpIcon')
              .popup({
                  on: 'hover'
          });
          $('.ui.small.dropdown.item').dropdown();
          $("input:checkbox").on('click', function() {
              var $box = $(this);
              if ($box.is(":checked")) {
                var group = "input:checkbox[name='"+$box.attr("name") + "']";
                $(group).prop("checked", false);
                $box.prop("checked", true);

                //objNetStyle[$box.attr("name")] = $box.attr("value");
                objNetStyle[currentPanel][$box.attr("name").split("-")[1] ] = $box.attr("value");

                if(group.indexOf("edge") == -1){
                  //node option
                  var arrNodes = networksDS[currentPanel].nodes.get();
                  for (var i=0; i < arrNodes.length; i++) {
                      var elemObj = arrNodes[i];
                      var elemColor = mapColor(-1,'node');
                      var elemColorField = objNetStyle[currentPanel].nodeColor;
                      if (elemColorField != 'none') {
                          var elemId = null;
                          switch (elemColorField) {
                              case 'domain' : var jsonObj = emailDomains[currentPanel]['filtered'];
                                              elemId = jsonObj[elemObj[elemColorField]].id;
                                              break;
                              case 'cluster' : elemId = elemObj.cluster; break;
                          }
                          elemColor = mapColor(elemId,'node');
                      }

                      networksDS[currentPanel].nodes.update({'id': elemObj.id, 'value': elemObj[objNetStyle[currentPanel].nodeSize],
                                                            color: {'background': elemColor, 'highlight':{background: elemColor,border:'#A0A0A0'},hover:{background:elemColor,border:'#A0A0A0'}} });
                  }
                }else{
                  //edge option
                  var arrEdges = networksDS[currentPanel].edges.get();
                  for (var i=0; i < arrEdges.length; i++) {
                      var elemObj = arrEdges[i];
                      var elemColor = mapColor(-1,'edge');
                      var elemColorField = objNetStyle[currentPanel].edgeColor;
                      var myColor = null;
                      if (elemColorField != 'none')
                      {
                          var elemId = null;
                          switch (elemColorField) {
                              case 'domain' : var jsonObj = emailDomains[currentPanel]['filtered'];
                                              elemId = jsonObj[elemObj[elemColorField]].id;
                                              break;
                              case 'cluster' : elemId = elemObj.cluster; break;
                          }
                          elemColor = mapColor(elemId,'edge');
                          myColor = {'color':elemColor,'opacity':0.53,'highlight':elemColor,'hover':elemColor};
                      }else{
                          myColor = {'color':elemColor,'opacity':0.53,'highlight':'#848484','hover':'#848484'};
                      }
                      networksDS[currentPanel].edges.update({'id': elemObj.id, 'value': elemObj[objNetStyle[currentPanel].edgeSize], 'color': myColor });

                      /*
                      if (elemObj.id == "1933") {
                          console.log("here is 1933 !! ");
                          console.log(networksDS[currentPanel].edges.get(elemObj.id));
                      }
                      */
                  }
                }

              } else {
                $box.prop("checked", false);
              }
          });
          $('.ui.small.buttons.infoMenu2 .ui.button').on('click', function() {
            infosModule.clickMenuInfo2(this.id);
          });
          $('.ui.small.buttons.infoMenu1 .ui.button').on('click', function() {
            infosModule.clickMenuInfo1(this.id);
          });
          $('.ui.bottom.attached.tabular.menu .item').on('click', function() {
            clickPanelSwitch(this.id);
          });

          /*build the filters gui according to the data we have*/
          for (var keyFilter in mainData.filters.data) {
              var filterObj = mainData.filters.data[keyFilter];
              var filterVis = mainData.filters.visualization[keyFilter];

              if(filterObj.active == true){

                //in case it's textfield type of filter
                if(filterObj.type == "textfield"){
                  $('#'+filterVis.id).placeholder="Search for a "+filterObj.data+"...";
                  $('#'+filterVis.id).keydown(function(event) {
                      if (event.keyCode == 13) {
                        data.objFilter[mainData.filters.data[event.target.id].data] = this.value;
                        genFilteredData();
                        genInfoOnFilteredData();
                        var panelsVisObj = redrawPanels();
                        $('#'+mainData.filters.visualization[event.target.id].id).blur();
                      }
                  });
                  $('#'+filterVis.id).blur(function() {
                  });
                }

                //in case it's smallslider type of filter
                if(filterObj.type == "smallslider"){
                    $( '#'+filterVis.id).slider({
                      range: "max",
                      min: filterObj.min,
                      max: filterObj.max,
                      value: filterObj.max/10,
                      create: function() {
                        $( "#"+filterVis.handle).text( $( this ).slider( "value" ) );
                        $( "#"+filterVis.amount).val( $( this ).slider( "value" ) );
                        data.objFilter[filterObj.data] = filterObj.max/10;
                      },
                      slide: function( event, ui ) {
                        var filterVis = mainData.filters.visualization[event.target.id];
                        $( "#"+filterVis.amount).val( ui.value );
                      }
                    });
                    document.getElementById(filterVis.lbl).innerHTML = "[Max: "+filterObj.max+"]";
                  }

                //in case it's largeslider type of filter
                if(filterObj.type == "largeslider"){
                  var filterVis = mainData.filters.visualization[keyFilter];
                  $( '#'+filterVis.id).slider({
                    range: true,
                    min: filterObj.min,
                    max: filterObj.max,
                    values: [filterObj.start, filterObj.end],
                    create: function(){
                      if(filterObj.data == "time"){
                        $( '#'+filterVis.amount ).val(util.StringformatDate(new Date(filterObj.min)) + "     -     " + util.StringformatDate(new Date(filterObj.max)) );
                      }else{
                        $( '#'+filterVis.amount ).val(filterObj.min + "     -     " + filterObj.max);
                      }

                      var fromVal = filterObj.min;
                      var toVal = filterObj.max;
                      if(filterObj.data == "time"){
                        fromVal = new Date(fromVal);
                        toVal = new Date(toVal);
                      }
                      data.objFilter[filterObj.data]['from'] = fromVal;
                      data.objFilter[filterObj.data]['to'] = toVal;
                    },
                    slide: function( event, ui ) {
                      var filterVis = mainData.filters.visualization[event.target.id];
                      var dateS = new Date(ui.values[0]);
                      var dateE = new Date(ui.values[1]);
                      $( '#'+filterVis.amount ).val(util.StringformatDate(dateS) + "     -     " + util.StringformatDate(dateE) );
                      //updateObjFilter('time',{'from':formatDate( new Date(ui.values[0])),'to':formatDate( new Date(ui.values[1]))});
                    }
                    });
                }
              }
          }

          var timeout;
          $('.slider').on("slidestop", function(event, ui) {
            clearTimeout(timeout);
            timeout = setTimeout(function() {

            var filterObj = mainData.filters.data[event.target.id];
            var filterFunc = filterObj.filterFunc.split(".");

            if(filterObj.numInput <= 1){
              data.objFilter[filterObj.data] = ui.value;
            }else{
              var fromVal = ui.values[0];
              var toVal = ui.values[1];

              if(filterObj.data == "time"){
                fromVal = new Date(fromVal);
                toVal = new Date(toVal);
              }
              data.objFilter[filterObj.data]['from'] = fromVal;
              data.objFilter[filterObj.data]['to'] = toVal;
            }

            genFilteredData();
            genInfoOnFilteredData();

            console.log(data);
            console.log("Draw the panels");
            var panelsVisObj = redrawPanels();

            }, 50);
          });

          /*build panel visualizations*/
          for (var keyVis in mainData.visualizations) {
            if(mainData.visualizations[keyVis].active == true){
              var drawFunc = mainData.visualizations[keyVis].drawFunc.split(".");
              window['guiUtil'][drawFunc[0]](mainData.visualizations[keyVis].id);
            }
          }

          document.addEventListener('DOMContentLoaded', function () {
          });
  }

  /*Draw a Graph network*/
  function drawDirectedGN(containerId) {
    drawGraphNetwork(containerId,"Directed");
  }
  function drawUndirectedGN(containerId) {
    drawGraphNetwork(containerId,"Undirected");
  }
  function drawGraphNetwork(containerId,type) {

    data.networksDS[type].nodes = new vis.DataSet([]);
    data.networksDS[type].edges = new vis.DataSet([]);

    var container = document.getElementById(containerId);
    var myData = {
      nodes: data.networksDS[type].nodes,
      edges: data.networksDS[type].edges,
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
    data.networks[type] = new vis.Network(container, myData, options);
    data.networks[type].on("hoverNode", function(node){});
    data.networks[type].on("blurNode", function(node){});
    data.networks[type].on("selectNode", function (params) {
        var netKey = mainData.visualizations[currentPanel].data;
        var selectedNodes = data.networks[netKey].getSelectedNodes();
        data.networks[netKey].focus(selectedNodes[0]);
        window.stop();
        objInfoView.base = "selected";
        objInfoView.category = "contacts";
        mainData.infoSections[currentPanel][objInfoView.base][objInfoView.category] = {elem : data.networksDS[netKey].nodes.get(selectedNodes[0]), infos: null};
        infosModule.clickMenuInfo1('selected');
        infosModule.clickMenuInfo2('contacts');
        infosModule.genInfos();
    });
    data.networks[type].on("selectEdge", function (params) {
        var netKey = mainData.visualizations[currentPanel].data;
        var selectedEdges = data.networks[netKey].getSelectedEdges();

        if(data.networks[netKey].getSelectedNodes().length == 0){
          window.stop();
          objInfoView.base = "selected";
          objInfoView.category = "links";
          mainData.infoSections[currentPanel][objInfoView.base][objInfoView.category] = {elem: data.networksDS[netKey].edges.get(selectedEdges[0]), infos: null};
          infosModule.clickMenuInfo1('selected');
          infosModule.clickMenuInfo2('links');
          infosModule.genInfos();
        }
    });
  }

  /*Methods for the Graph Network generation*/
  function buildDirectedGraphData(){
    return {"Directed":buildGraphData("Directed")};
  }
  function buildUndirectedGraphData(){
    return {"Undirected":buildGraphData("Undirected")};
  }
  function buildGraphData(keyDataType) {
          var dicResults = {};

          var edgesResults = [];
          //index of inserted edges so no duplicates can happen
          var edgeIndex = {};
          for (var i = 0; i < data.filteredGraphDataInfo[keyDataType].edges.length; i++) {
              var edgeObj = data.filteredGraphDataInfo[keyDataType].edges[i];
              //in order to never add duplicates
              if (! edgeIndex.hasOwnProperty(edgeObj['id'])) {

                  /*add important fields to graph vis*/
                  if (keyDataType == "Directed") {
                      edgeObj['arrows'] = 'to';
                  }
                  edgeObj['value'] = edgeObj[data.objNetStyle[keyDataType].edgeSize];
                  var elemColor = mapColor(-1,'edge');
                  edgeObj['color'] = {'color':elemColor,'opacity':0.53,'highlight':'#848484','hover':'#848484'};
                  /********/

                  edgesResults.push(edgeObj);
                  edgeIndex[edgeObj['id']] = 'true';
              }
          }
          updateGN(keyDataType,'edges',edgesResults);

          var nodesResults = [];
          for (var i = 0; i < data.filteredGraphDataInfo[keyDataType].nodes.length; i++) {
              var nodeObj = data.filteredGraphDataInfo[keyDataType].nodes[i];

              /*add important fields to graph vis*/
              nodeObj['value'] = nodeObj[data.objNetStyle[keyDataType].nodeSize];
              var elemColor = mapColor(-1,'node');
              nodeObj['color'] = {'background': elemColor, 'highlight':{background: elemColor,border:'#A0A0A0'},hover:{background:elemColor,border:'#A0A0A0'}};
              /********/

              nodesResults.push(nodeObj);
          }
          updateGN(keyDataType,'nodes',nodesResults);

          /*reset selected item*/
          data.netSelectedItem[keyDataType].node = {'id':null,'selType':null};
          data.netSelectedItem[keyDataType].edge = {'id':null,'selType':null};

          return {nodes: nodesResults, edges: edgesResults};
  }
  function updateGN(netType,dsType,arr) {
    data.networksDS[netType][dsType].clear();
    data.networksDS[netType][dsType].add(arr);
  }
  function resetGNs(){
    for (var keyDataType in data.filteredData) {
      data.networksDS[keyDataType].nodes.clear();
      data.networksDS[keyDataType].edges.clear();
    }
  }

  /*Methods to apply on the panels visualization*/
  function redrawPanels(){
    var resObj = {};
    for (var panelKey in mainData.visualizations){
      if (mainData.visualizations[panelKey].active == true) {
        var redrawFunc = mainData.visualizations[panelKey].redrawFunc;
        var funcRes;

        switch (redrawFunc) {
          case "buildDirectedGraphData":
            funcRes = {"Directed":buildGraphData("Directed")};
            break;
          case "buildUndirectedGraphData":
            funcRes = {"Undirected":buildGraphData("Undirected")};
            break;
          default:
        }
        for (var key in funcRes) {
          resObj[key] = funcRes[key];
        }
      }
    }
    return resObj;
  }
  function switchPanel(panelId) {
      currentPanel = panelId;
      showPanel(panelId);
      showFilters(panelId);
      infosModule.genInfos();
  }
  function showPanel(panelId){
    /*Put the panel in front*/
    document.getElementById(panelId).style.visibility = "visible";
    document.getElementById(panelId).style.zIndex = "0";
    document.getElementById(panelId).style.pointerEvents = "all";
    document.getElementById(mainData.visualizations[panelId].styleMenu).style.visibility = "visible";

    /*hide all the others*/
    for (var panelKey in mainData.visualizations) {
      if(panelKey != panelId){
        document.getElementById(panelKey).style.visibility = "hidden";
        document.getElementById(panelKey).style.zIndex = "-1";
        document.getElementById(panelKey).style.pointerEvents = "none";
        document.getElementById(mainData.visualizations[panelKey].styleMenu).style.visibility = "hidden";
      }
    }
  }
  function showFilters(panelId) {

    for (var keyFilter in mainData.filters.data) {
      if(mainData.filters.data[keyFilter].active == false){
        $("#"+mainData.filters.visualization[keyFilter].id).addClass("disabledDiv");
      }else {
        $("#"+mainData.filters.visualization[keyFilter].id).removeClass("disabledDiv");
      }
    }

    if(mainData.visualizations[panelId].filter == false){
      $("#searchBar").addClass("disabledDiv");
      $("#timelineBar").addClass("disabledDiv");
      $("#infoSelections").addClass("disabledDiv");
      $("#infoIcon1").addClass("disabledDiv");
      $("#infoIcon2").addClass("disabledDiv");
    }else{
      if(mainData.visualizations[panelId].filter == true){
        $("#searchBar").removeClass("disabledDiv");
        $("#timelineBar").removeClass("disabledDiv");
        $("#infoSelections").removeClass("disabledDiv");
        $("#infoIcon1").removeClass("disabledDiv");
        $("#infoIcon2").removeClass("disabledDiv");
      }
    }
  }
  function clickPanelSwitch(clickScope) {
      var idDiv = "#"+clickScope;
      $('.ui.bottom.attached.tabular.menu .item').removeClass('active');
      $('.ui.bottom.attached.tabular.menu .item').css({'color': 'black','background-color': '#f2f2f2','border': '0.5px solid lightgray','font-weight' :'normal', 'font-size': 'small'});
      $(idDiv).css({'background-color': '#fff2e6','color': objSystemConf.filterColor,'border-top': 'none','font-weight' :'bold', 'font-size': 'medium'});
      $(idDiv).addClass('active');
  }

  /*A color mapping according to the id and type of data*/
  function mapColor(id,type) {
      var arrColors = guiData.colorPalette;
      var resColor = "hsl(195, 100%, 35%)";
      //console.log(emailDomains);
      //console.log(id);
      if (id != -1) {
          if (id < arrColors.length - 1) {
              resColor = arrColors[id];
          }else{
              resColor = arrColors[arrColors.length - 1];
          }
      }else{
          switch (type) {
              case 'node': resColor = arrColors[0]; break;
              case 'edge': resColor = arrColors[0];
                      //"rgba(0, 134, 179,0.5)";
                      //"rgba(59, 124, 171, 0.42)";
                      break;
          }
      }
      return resColor;
  }

  return {
    initSystemGui: initSystemGui,
    mapColor: mapColor,
    drawDirectedGN: drawDirectedGN,
    drawUndirectedGN: drawUndirectedGN,
    resetGNs: resetGNs,
    switchPanel: switchPanel,
    clickPanelSwitch: clickPanelSwitch,
    redrawPanels: redrawPanels
  }

})();
