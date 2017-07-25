
/*An angular module to generate dynamically rows inside the Info Section*/
angular.module('infosApp', [])
.directive('hover-directive', function() {
      console.log("i am in angular hover !!");
      return{
            link: function(){$('.helpIcon')
                  .popup({
                        on: 'hover'
                  });}
      }
})
.controller('infosController', function($scope) {
      var rowList = this;
      //{name:"",value: null,type: null,id: null,rowType: objInfoView.base+"-"+objInfoView.category}
	  rowList.rows = [];
	  rowList.title = {'name':'','val':'','cssName':'','cssVal':''};
	  rowList.styleCssTable = "";


	  $scope.addTitleRow = function(options) {
			rowList.title = {'name':options.name ,'val': options.value,'cssName': options.styleCssName,'cssVal': options.styleCssVal};
	  }

	  $scope.resetAll = function(){
			rowList.rows = [];
	  }

    $scope.addRowAfter = function(baseRow,newRow,type){
            var index = -1;

            //need to check dinamicaly the position in array
            var baseRowPos = getMyPos(baseRow,rowList.rows);

            if (baseRowPos != rowList.rows.length - 1) {
                  var nextRow = rowList.rows[baseRowPos + 1];
                  if (nextRow != null) {
                        index = baseRowPos + 1;
                  }
            }

            var myRow = setStyle(newRow,type);
            myRow['posId'] = rowList.rows.length;
            if (index != -1) {
                  rowList.rows.splice(index, 0, myRow);
            }else{
                  rowList.rows.push(myRow);
            }

      }

      $scope.removeMySubRows = function(myRow){
            var index= -1;

            var myRowPos = getMyPos(myRow,rowList.rows);

            index = myRowPos + 1;
            var numRows = myRow.timeS.length;

            rowList.rows.splice(index, numRows);
      }

      $scope.removeCurtainSubRows = function(myRow){
            var index= -1;

            var myRowPos = getMyPos(myRow,rowList.rows);

            index = myRowPos + 1;
            var numRows = myRow.elems.length;

            rowList.rows.splice(index, numRows);
      }

      $scope.isSubjectSelected = function(myRow){
            var myRowPos = getMyPos(myRow,rowList.rows);
            if (myRowPos == rowList.rows.length - 1) {
                  return false;
            }else{
                  var nextRow = rowList.rows[myRowPos + 1];

                  if (nextRow.type == "subject-time") {
                        var subjNameArr = myRow.name.split("-");
                        var newSubjName = strIndent +"+  "+subjNameArr[1];
                        myRow.name = newSubjName;
                        return true;
                  }else{
                        var subjNameArr = myRow.name.split("+");
                        var newSubjName = strIndent +"-  "+subjNameArr[1];
                        myRow.name = newSubjName;
                        return false;
                  }
            }
      }

      $scope.isCurtainElemSelected = function(myRow){
            var myRowPos = getMyPos(myRow,rowList.rows);
            if (myRowPos == rowList.rows.length - 1) {
                  return false;
            }else{
                  var nextRow = rowList.rows[myRowPos + 1];

                  //if next row is a sub-row generated from clciking the curtainElem
                  if (nextRow.fatherRow != null) {
                        var curtainNameArr = myRow.name.split("-");
                        myRow.name = "+  "+curtainNameArr[1];
                        return true;
                  }
                  else{
                        var curtainNameArr = myRow.name.split("+");
                        myRow.name = "+  "+subjNameArr[1];
                        return false;
                  }
            }
      }

	  $scope.addRow = function(newRow,type){
			var myRow = setStyle(newRow,type);
            myRow['posId'] = rowList.rows.length;
			rowList.rows.push(myRow);
	  }

    $scope.addRow2 = function(rowType,arrValues){

            var myRow = buildRow(rowType,arrValues);
            rowList.rows.push(myRow);
	  }

    $scope.removeLastRow = function(){
			rowList.rows.pop();
	  }

    $scope.setOnInit = function () {

            $('.helpIcon')
                  .popup({
                        on: 'hover'
                  });
    }

	  $scope.setOver = function (rowObj) {
            var selectableBool = false;
            if (rowObj.hasOwnProperty('selectable')) {
              selectableBool = rowObj.selectable.value;
            }
            if (selectableBool){
                  hoverEffect(true,rowObj);
            }
	  }

      $scope.setOutOver = function (rowObj) {
            var selectableBool = false;
            if (rowObj.hasOwnProperty('selectable')) {
              selectableBool = rowObj.selectable.value;
            }
            if (selectableBool) {
                  hoverEffect(false,rowObj);
            }
	  }

    $scope.setSelected = function (rowObj) {
            var selectableBool = false;
            if (rowObj.hasOwnProperty('selectable')) {
              selectableBool = rowObj.selectable.value;
            }
            if (selectableBool) {
                  infosModule.handleSelection(rowObj.selectable.action, this);
            }
    }

    function hoverEffect(hoverOnBool,rowObj) {

            var color = "black";
            var cursor = "none";
            if (hoverOnBool) {
                  color = objSystemConf.infoColor;
                  cursor = 'pointer';
            }

            //var fontArrSize = ['xx-small','x-small','small','medium','large','x-large'];
            if (rowObj.hasOwnProperty('styleCssName')) {
                  rowObj['styleCssName']['color'] = color;
                  rowObj['styleCssName']['cursor'] = cursor;
            }

            if (rowObj.hasOwnProperty('styleCssVal')) {
                  rowObj['styleCssVal']['color'] = color;
                  rowObj['styleCssVal']['cursor'] = cursor;
            }

            if (rowObj.hasOwnProperty('styleCssName2nd')) {
                  rowObj['styleCssName2nd']['color'] = color;
                  rowObj['styleCssName2nd']['cursor'] = cursor;
            }

            if (rowObj.hasOwnProperty('styleCssVal2nd')) {
                  rowObj['styleCssVal2nd']['color'] = color;
                  rowObj['styleCssVal2nd']['cursor'] = cursor;
            }

            if (rowObj.hasOwnProperty('styleCssIcon')) {
                  rowObj['styleCssIcon']['color'] = color;
                  rowObj['styleCssIcon']['cursor'] = cursor;
            }
      }
    function setStyle(rowObj,type) {
            var myRow = rowObj;

            // [defined/personalize].a.b.c.d,
            // a: sizeRow, b: colorElem, c: bgColor, d: border
            //Style and font of the row
            var typeArr = type.split(".");


            for (var i=0; i<typeArr.length; i++) {
                  //code
                  switch (typeArr[i]) {

                        case 'personalize':
                              myRow['styleCssName'] = {};
                              myRow['styleCssVal'] = {};
                              break;

                        case 'blank-row':
                              myRow['styleCssName'] = {border:'none', fontSize: 'x-small', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {border:'none', fontSize: 'x-small', backgroundColor: objSystemConf.infoBGColor};
                              break;

                        case 'middle-arrow':
                              myRow['styleCssVal'] = {fontSize: '95%', backgroundColor: objSystemConf.infoBGColor};
                              //myRow['iconClass'] = "ui large label right floated";
                              myRow['iconClass'] = "ui large label right floated";
                              //myRow['styleCssIcon'] = {'iconColor': 'black','display': 'inline-block', 'translate': 'translate(0%, 50%)', 'right':'5%'};
                              myRow['styleCssIcon'] = {'display': 'inline-block', 'color': 'black','cursor':'none', 'translate': 'translate(0%, 5%)', 'right':'40%'};
                              myRow['styleMainClass']= {'display': 'inline-block', 'type':'content'};
                              break;

                        case 'divider-row':
                              myRow['classStyle'] = "ui divider";
                              break;

                        case 'fitted-divider-row':
                              myRow['iconClass'] = "ui fitted divider";
                              break;

                        case 'xsmall-list-elem':
                              myRow['styleCssName'] = {fontSize: 'x-small', color:objSystemConf.infoColor, backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: 'x-small', color:objSystemConf.infoColor, backgroundColor: objSystemConf.infoBGColor};
                              break;

                        case 'list-elem-dashed':
                              myRow['styleCssName'] = {borderBottom: '0.5px dashed lightgray', fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              break;

                        case 'list-2line-elem-dashed':
                              myRow['styleCssName'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssName2nd'] = {borderBottom: '0.5px dashed lightgray',fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal2nd'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['iconClass'] = "ui circular medium label right floated";
                              myRow['styleCssIcon'] = {'iconColor': 'black','display': 'inline-block', 'translate': 'translate(0%, 5%)', 'right':'5%'};
                              myRow['styleMainClass']= {'display': 'inline-block', 'type':'content'};
                              break;

                        case 'list-elem-hidden':
                              myRow['styleCssName'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: 'x-small', backgroundColor: objSystemConf.infoBGColor};
                              break;

                        case 'list-elem':
                              myRow['styleCssName'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssName2nd'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal2nd'] = {fontSize: '85%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['iconClass'] = "ui circular medium label right floated";
                              myRow['styleCssIcon'] = {'iconColor': 'black','display': 'inline-block', 'translate': 'translate(0%, 5%)', 'right':'5%'};
                              myRow['styleMainClass']= {'display': 'inline-block', 'type':'content'};
                              break;

                        case 'contact-list-elem':
                              myRow['styleCssName'] = {fontSize: '95%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: '95%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['iconClass'] = "ui circular medium label right floated";
                              myRow['styleCssIcon'] = {'iconColor': 'black','display': 'inline-block', 'translate': 'translate(0%, 5%)', 'right':'5%'};
                              myRow['styleMainClass']= {'display': 'inline-block', 'type':'content'};
                              break;

                        case 'small-title-elem':
                              myRow['styleCssName'] = {fontSize: '110%', border:'none',backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: '110%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleMainClass']= {'display': 'inline-block', 'type':'content right floated','right':'3%'};
                              break;

                        case 'ribbon-title-elem':
                              myRow['iconClass'] = 'ui right ribbon label';

                        case 'important-elem':
                              myRow['styleCssName'] = {border:'none',fontSize: 'large', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {border:'none', fontSize: 'medium', color:objSystemConf.infoColor, backgroundColor: objSystemConf.infoBGColor};
                              break;

                        case 'info-elem':
                              myRow['styleCssName'] = {border:'none',fontSize: '110%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {border:'none',fontSize: '110%', color:objSystemConf.infoColor, backgroundColor: objSystemConf.infoBGColor};
                              myRow['classStyle'] = "nine wide";
                              myRow['styleMainClass']= {'display': 'inline-block', 'type':'content'};
                              break;

                        case 'sec-info-elem':
                              myRow['styleCssName'] = {border:'none',fontSize: '100%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {border:'none',fontSize: '100%', color:objSystemConf.infoColor, backgroundColor: objSystemConf.infoBGColor};
                              myRow['classStyle'] = "nine wide";
                              break;

                        case 'single-important-value':
                              myRow['styleCssName'] = {border:'none', fontSize: 'medium', color:objSystemConf.infoColor, backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {border:'none',backgroundColor: objSystemConf.infoBGColor};
                              myRow['classStyle'] = "fourteen wide";
                              break;

                        case 'title-elem-red':
                              myRow['styleCssName'] = {fontSize: '150%', color:objSystemConf.infoColor, border:'none',backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: '150%', backgroundColor: objSystemConf.infoBGColor};
                              break;

                        case 'title-elem':
                              myRow['styleCssName'] = {fontSize: '150%', border:'none',backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: '150%', backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleMainClass']= {'display': 'inline-block', 'type':'content'};
                              break;


                        case 'title-link-elem':
                              //myRow['styleCssName'] = "{fontSize: 'large', color:'white',fontWeight:'bold', backgroundColor: objSystemConf.infoColor}";
                              myRow['styleCssName'] = {fontSize: 'large', color:objSystemConf.infoColor,fontWeight:'bold',textDecoration: 'underline' ,backgroundColor: objSystemConf.infoBGColor};
                              myRow['styleCssVal'] = {fontSize: 'large', backgroundColor: objSystemConf.infoBGColor};
                              break;

                        default :
                              //example list-elem.Val;border;none
                              var typeParam = typeArr[i].split(";");
                              myRow['styleCss'+typeParam[0]][typeParam[1]] = typeParam[2];
                              break;
                  }
            }

            return myRow;
      }
    function getMyPos(baseRow,rows){
          var baseRowPos = -1;
          for(var i=0; i< rows.length; i++){
                var rowObj = rows[i];
                if (rowObj.posId == baseRow.posId){
                      baseRowPos = i;
                }
          }

          return baseRowPos;
    }
});

/*Methods to define the model and handle the Information Section*/
var infosModule = (function () {

  //Click on the 1st menu layer in the info section (base)
  function clickMenuInfo1(clickScope){
      objInfoView.base= clickScope;
      var idDiv = "#"+clickScope;
      $('.ui.small.buttons.infoMenu1 .ui.button').removeClass('active');
      $('.ui.small.buttons.infoMenu1 .ui.button').css({'background-color': 'white','color': 'black','font-weight' :'normal', 'font-size': 'small'});
      $(idDiv).css({'color': 'white','background-color': objSystemConf.infoColor,'font-weight' :'bold', 'font-size': 'medium'});
      $(idDiv).addClass('active');
  }

  //Click on the 2nd menu layer in the info section (category)
  function clickMenuInfo2(clickScope){
      objInfoView.category= clickScope;
      var idDiv = "#"+clickScope;
      $('.ui.small.buttons.infoMenu2 .ui.button').removeClass('active');
      $('.ui.small.buttons.infoMenu2 .ui.button').css({'background-color': 'white','color': 'black','font-weight' :'normal', 'font-size': 'small'});
      $(idDiv).css({'color': 'white','background-color': objSystemConf.infoColor,'font-weight' :'bold', 'font-size': 'medium'});
      $(idDiv).addClass('active');
  }

  //Each time i want to generate information i the info section this method is called
  function genInfos(infoTab){

    //build the rows to visualize
    //check if there is an elem selected, and generate his info rows
    var panelData = mainData.visualizations[currentPanel]['data'];
    var objBaseInfo = mainData.infoSections[currentPanel][objInfoView.base][objInfoView.category];
    if(objBaseInfo.elem != null){
      if(objBaseInfo.infos == null){
        var rowsToAdd = [];
        for (var i = 0; i < data.infoSectionsGens[objInfoView.base][objInfoView.category].length; i++) {
          var infoObj = data.infoSectionsGens[objInfoView.base][objInfoView.category][i];
          if(panelData == infoObj.id){
            var infoRows = window[infoObj.controller]["genInfoSectionRows"](objBaseInfo.elem, objInfoView.base+"-"+objInfoView.category,0);
            for (var i = 0; i < infoRows.length; i++) {
              rowsToAdd.push(infoRows[i]);
            }
          }
        }
        mainData.infoSections[currentPanel][objInfoView.base][objInfoView.category].infos = rowsToAdd;
      }

      //add the rows to the information section
      var arrOfRows = mainData.infoSections[currentPanel][objInfoView.base][objInfoView.category].infos;
      var angScope = angular.element(document.getElementById("infoTab")).scope();
      if (infoTab != null) {
        angScope = infoTab;
        angScope.resetAll();
        for (var i = 0; i < arrOfRows.length; i++) {
          angScope.addRow(arrOfRows[i].row,arrOfRows[i].type);
        }
      }else{
        angScope.$apply(function(){
          angScope.resetAll();
          for (var i = 0; i < arrOfRows.length; i++) {
            angScope.addRow(arrOfRows[i].row,arrOfRows[i].type);
          }
        });
      }
    }else{
      var angScope = angular.element(document.getElementById("infoTab")).scope();
      if (infoTab != null) {angScope = infoTab; angScope.resetAll();
      }else{
        angScope.$apply(function(){angScope.resetAll();});
      }
    }
  }

  //update the information section menu
  function updateInfoSecMenu(obj){
    clickMenuInfo1(obj.objInfoView.base);
    clickMenuInfo2(obj.objInfoView.category);
    mainData.infoSections[currentPanel][objInfoView.base][objInfoView.category] = obj.objBaseInfo;
  }

  //upgrade and add new rows to the current info section
  function upgradeInfoSec(obj){
    var newRows = obj.newRows;
    var angScope = angular.element(document.getElementById("infoTab")).scope();
    angScope.removeLastRow();
    for (var i = 0; i < newRows.length; i++) {
      angScope.addRow(newRows[i].row,newRows[i].type);
    }
  }

  //handle the selected elems and actuate the action
  function handleSelection(actObj, angScope){
    // example : actObj = [{controller: "controllerSNA", func:"onContactSelected", params: objInfo}]
    for (var i = 0; i < actObj.length; i++) {
      var resObj = window[actObj[i].controller]["handleSelections"](actObj[i].func, actObj[i].params);

      switch (resObj.actionType) {
        case "updateInfoSec":
          updateInfoSecMenu(resObj);
          genInfos(angScope);
          break;
        case "upgradeInfoSec":
          upgradeInfoSec(resObj);
          break;
      }
    }
  }

  return {
    clickMenuInfo1: clickMenuInfo1,
    clickMenuInfo2: clickMenuInfo2,
    genInfos: genInfos,
    handleSelection: handleSelection
  }
})();
