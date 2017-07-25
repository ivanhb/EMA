<?php


function getDomainData($dataseturls,$myContacts){

    $dataseturl = $dataseturls[0];
    for($i = 1; $i < count($dataseturls); ++$i) {
        $dataseturl = $dataseturl."NEWURL".$dataseturls[$i];
    }

    $myContact = $myContacts[0];
    for($j = 1; $j < count($myContacts); ++$j) {
        $myContact = $myContact."NEWCONTACT".$myContacts[$j];
    }

    $output = array();
    $cmd = 'python2.7 server/dataGen.py getNodesEdges '.$dataseturl.' '.$myContact.' 2>&1';
    exec($cmd, $output);
    $data = json_decode(utf8_encode($output[0]));
    //print_r(json_last_error());
    //print_r($data);
    return $data;
}

function getAllEmails($dataseturls){

    $dataseturl = $dataseturls[0];
    for($i = 1; $i < count($dataseturls); ++$i) {
        $dataseturl = $dataseturl."NEWURL".$dataseturls[$i];
    }

    $output = array();
    $cmd = 'python2.7 server/dataGen.py getAllEmails '.$dataseturl.' 2>&1';
    exec($cmd, $output);
    $data = json_decode(utf8_encode($output[0]));
    return $data;
}

function genCountWordsMatrix($dataseturls,$dataset){

    $dataseturl = $dataseturls[0];
    for($i = 1; $i < count($dataseturls); ++$i) {
        $dataseturl = $dataseturl."NEWURL".$dataseturls[$i];
    }

    $output = array();
    $some_command = 'python2.7 server/nlp-proc.py termsCountMatrix '.$dataseturl.' '.$dataset;
    exec($some_command, $output);

    $data = json_decode($output[0]);
    return $data;
}

function getStopWords($dataset){

    $output = array();
    $some_command = 'python2.7 server/nlp-proc.py getStopWords '.$dataset;
    exec($some_command, $output);

    $data = json_decode($output[0]);
    return $data;
}

function genWordsXTime($dataseturls,$dataset,$wordsNum){

    $dataseturl = $dataseturls[0];
    for($i = 1; $i < count($dataseturls); ++$i) {
        $dataseturl = $dataseturl."NEWURL".$dataseturls[$i];
    }

    $output = array();
    $some_command = 'python2.7 server/nlp-proc.py wordsXtime '.$dataseturl.' '.$dataset.' '.$wordsNum;
    exec($some_command, $output);

    $data = json_decode(utf8_encode($output[0]));
    return $data;
}

function getOriginalMsgs($dataseturls, $dataset, $subjectname, $subjecttime){

    $dataseturl = $dataseturls[0];
    for($i = 1; $i < count($dataseturls); ++$i) {
        $dataseturl = $dataseturl."<newurl>".$dataseturls[$i];
    }

    $output = array();
    $aVal = array(utf8_encode($subjectname));
    $aValJson = json_encode($aVal);
    //.escapeshellarg(json_encode($aValJson));
    $some_command = 'python2.7 server/dataGen.py getOriginalEmails '.$dataseturl.' '.$dataset.' '.$subjecttime.' '.$subjectname.' 2>&1' ;
    exec($some_command, $output);

    $data = json_decode($output[0]);
    return $data;
}

function genWordsClus($dataseturls,$dataset,$conceptNum,$wordsNum){

    $dataseturl = $dataseturls[0];
    for($i = 1; $i < count($dataseturls); ++$i) {
        $dataseturl = $dataseturl."NEWURL".$dataseturls[$i];
    }

    $output = array();
    $some_command = 'python2.7 server/nlp-proc.py clusterwords '.$dataseturl.' '.$dataset.' '.$conceptNum.' '.$wordsNum.' 2>&1';
    exec($some_command, $output);

    $data = json_decode(utf8_encode($output[0]));
    return $data;
}

function getWordsOcc($dataseturls,$content,$datasetname,$freqWordsNum){

    $dataseturl = $dataseturls[0];
    for($i = 1; $i < count($dataseturls); ++$i) {
        $dataseturl = $dataseturl."<newurl>".$dataseturls[$i];
    }

    $contentStr = preg_replace("/[^A-Za-z0-9 ]/", ' ', $content);
    //$contentStr = preg_replace('~[\r\n]+~', ' ', $contentStr);

    $aVal = array(utf8_encode($contentStr));
    $aValJson = json_encode($aVal);

    $output = array();
    $my_command = 'python2.7 server/nlp-proc.py bestwords '.$dataseturl.' '.$datasetname.' '.$freqWordsNum.' '.escapeshellarg($aValJson) ;
    exec($my_command, $output);

    //array of json
    $data = json_decode($output[0]);
    return $data;
}



$aResult = array();
ini_set('memory_limit','-1');

if( !isset($_POST['functionname']) ) { $aResult['error'] = 'No function name!'; }
//if( !isset($_POST['arguments']) ) { $aResult['error'] = 'No function arguments!'; }
if( !isset($aResult['error']) ) {

    switch($_POST['functionname']) {

        case 'getStopWords':
            $val = getStopWords($_POST['arguments'][0]);
            $aResult['val'] = $val;
            break;

        case 'getWordsOcc':
            //arguments[objSystemConf.dataseturls,myTextContent,objSystemConf.datasetname,objSystemConf.freqWordsNum]
            $val = getWordsOcc($_POST['arguments'][0],$_POST['arguments'][1],$_POST['arguments'][2],$_POST['arguments'][3]);
            $aResult['val'] = $val;
            break;

        case 'genWordsClus':
            //[objSystemConf.dataseturl,objSystemConf.datasetname,objSystemConf.clusNum,objSystemConf.wordsXClus]
            $val = genWordsClus($_POST['arguments'][0],$_POST['arguments'][1],$_POST['arguments'][2],$_POST['arguments'][3]);
            $aResult['val'] = $val;
            break;

        case 'genCountWordsMatrix':
            $val = genCountWordsMatrix($_POST['arguments'][0],$_POST['arguments'][1]);
            $aResult['val'] = $val;
            break;

        case 'genWordsXTime':
            //arguments[objSystemConf.dataseturls,objSystemConf.datasetname,objSystemConf.wordsXtime]
            $val = genWordsXTime($_POST['arguments'][0],$_POST['arguments'][1],$_POST['arguments'][2]);
            $aResult['val'] = $val;
            break;

        case 'getOriginalMsgs':
            //arguments[objSystemConf.dataseturls, objSystemConf.datasetname, rowObj.name]
            $val = getOriginalMsgs($_POST['arguments'][0],$_POST['arguments'][1],$_POST['arguments'][2],$_POST['arguments'][3]);
            $aResult['val'] = $val;
            break;

        case 'getDomainData':
            //arguments[objSystemConf.dataseturl,objSystemConf.datasetname,objSystemConf.myContact]
            $val = getDomainData($_POST['arguments'][0],$_POST['arguments'][1]);
            $aResult['val'] = $val;
            break;

        case 'getAllEmails':
            //arguments[objSystemConf.dataseturl,objSystemConf.datasetname]
            $val = getAllEmails($_POST['arguments'][0]);
            $aResult['val'] = $val;
            break;

        default:
           $aResult['error'] = 'Not found function '.$_POST['functionname'].'!';
           break;
    }

}

echo json_encode($aResult);


?>
