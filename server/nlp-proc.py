
import sys
sys.path.append('/anaconda/envs/py27/lib/python2.7/site-packages/')
#sys.path.append('/usr/local/lib/python2.7/site-packages')

#for smartdata server
#sys.path.append('/usr/local/lib/python2.7/dist-packages')

import json
import re
import numpy as np

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import linear_kernel
import collections

import nltk
from nltk.corpus import stopwords

from dataGen import getAllArchive
from dataGen import getAllArchiveText
from datetime import datetime


def setStopWords(dataset):
    
    stop_words = None
    otherSWords = []
    
  
    if dataset == "clinton":
        stop_words = set(stopwords.words('english'))
        otherSWords = ['UNCLASSIFIED','U.S.','Department', 'State', 'Case', 'No.','No','US','Doc', 'Date','From','To','Subject','Clinton','clinton','sent','Sent','Send','Ok','ok','pm','am']
        stop_words.update(list(set(otherSWords)))
        
        #arrContent = getContacts()
        #allNames = []
        #for row in arrContent :
        #    split1 = row[0].split("@")
        #    for n in split1:
        #        split2= n.split(".")
        #        for m in split2:
        #            allNames.append(m)
        #    #allNames.append(unicode(names, "utf-8",errors='ignore'))
        #allNames = list(set(allNames))
        
        stop_words.update(allNames)
    
    elif dataset == "enron":
        stop_words = set(stopwords.words('english'))
        otherSWords = ['enron','No.','No','US','Ok','ok','pm','am','http','link','www','com','html','travelocity']
        stop_words.update(list(set(otherSWords)))
        
        #stop_words.update(allNames)
        
    elif dataset == "uniboIvan":
        stop_words = set(stopwords.words('italian'))
        eng_stop_words = set(stopwords.words('english'))
        stop_words.update(list(eng_stop_words))
        
        otherSWords = ['Grazie','grazie','Saluti','saluti','Salve','salve','Distinti','distinti','Cordiali','cordiali','http','pm','am','www']
        stop_words.update(list(set(otherSWords)))
    
    #additional stop words
    htmlTags =["a","abbr","acronym","address","area","b","base","bdo","big","blockquote","body","br","button","caption","cite","code","col","colgroup","dd","del","dfn","div","dl","DOCTYPE","dt","em","fieldset","form","h1","h2","h3","h4","h5","h6","head","html","hr","i","img","input","ins","kbd","label","legend","li","link","map","meta","noscript","object","ol","optgroup","option","p","param","pre","q","samp","script","select","small","span","strong","style","sub","sup","table","tbody","td","textarea","tfoot","th","thead","title","tr","tt","ul","var"]
    otherHtmlParams = ["font","width","height","href","gif","color","size","00","image","net","asp"]
    irrNumbers = []
    for i in range(101):
        irrNumbers.append(str(i))
    
    stop_words.update(list(set(htmlTags)))
    stop_words.update(list(set(otherHtmlParams)))
    stop_words.update(list(set(irrNumbers)))
    
    return stop_words

def inStopwords(word, stopwords):
    for sw in stopwords:
        if iequal(word,sw):
            return True
    return False

def bestwords(strtext,numWords,dataset):

    stop_words = setStopWords(dataset)
    text = strtext
    
    words = re.findall('\w+', text)
    filterWords = []
    for w in words:
        if not inStopwords(w, stop_words):
            filterWords.append(w)
        
    myColl = collections.Counter(filterWords)
    best10 = myColl.most_common(numWords)
    
    dicbest = []
    for elem in best10:
        elemJson = {}
        elemJson['word'] = elem[0]
        elemJson['value'] = elem[1]
        dicbest.append(elemJson)
        #dicbest[elem[0]] = elem[1]
    
    globalDic = {}
    globalDic['words'] = dicbest
    #return json.dumps(dicbest, ensure_ascii=False)    
    return globalDic

def termsCountMatrix(dataset,datasetUrls,voc):
    
    stopset = setStopWords(dataset)
    #returns a dictionary where keys are the pairs (subject,time)
    dicEmails = getAllArchiveText(datasetUrls)
    
    #create array of all emails retrieved
    arrEmails = []
    for k in dicEmails.keys():
        tupla = (k,dicEmails[k])
        arrEmails.append(tupla)
        
    #create corpus from all emails
    myCorpus = []
    for textElem in arrEmails:
        msgContent = re.sub('[^0-9\'.a-zA-Z]+', ' ', textElem[1])
        myCorpus.append(unicode(msgContent, "utf-8",errors='ignore'))
    
    vect = CountVectorizer(analyzer='word', vocabulary = list(set(voc)), ngram_range=(1,3), stop_words = stopset)
    count_matrix =  vect.fit_transform(myCorpus)
    feature_names = vect.get_feature_names()
    dense = count_matrix.todense()
    
    i=0
    dicTerms = {}
    for timeItem in dense :
        
        #array of all terms freq counts for each email
        email_scores = timeItem.tolist()[0]
        num_terms = len(email_scores)
        
        #phrases_scores: creates an array of pairs (term_array_index, term_score) for every email
        phrase_scores = [pair for pair in zip(range(0, num_terms), email_scores) if pair[1] > 0]
        
        #sort the phrases_scores
        sorted_phrase_scores = sorted(phrase_scores, key=lambda t: t[1] * -1)
        
        for phrase, score in [(feature_names[word_id], score) for (word_id, score) in phrase_scores]:
            data = {'score':score,'subject':arrEmails[i][0][0],'time':arrEmails[i][0][1]}
            
            if dicTerms.has_key(phrase):
                dicTerms[phrase].append(data)
            else:
                dicTerms[phrase] = [data]
                
        i= i + 1
    
    arrResTerms = []
    for termKey in dicTerms:
        #arrResTerms[dicTerms[termKey]['name']] = dicTerms[termKey]
        arrResTerms.append(dicTerms[termKey])
        
    #returns a JSON {phrase_word:[array-of-emails]}
    return dicTerms


def wordsXtime(dataset,wordsNum,datasetUrls):
     
    stopset = setStopWords(dataset)
    
    dicEmails = getAllArchiveText(datasetUrls)
    
    #create array of all emails retrieved
    arrEmails = []
    for k in dicEmails.keys():
        tupla = (k,dicEmails[k])
        arrEmails.append(tupla)
    
    #create dictionary according to the dates
    dicTime = {}
    for elem in arrEmails:
        #time = elem[0][1]
        time = datetime.strptime(elem[0][1],'%Y/%m/%d %H:%M:%S')
        stepTime = time.strftime('%Y-%m')
        if stepTime in dicTime :
            dicTime[stepTime].append(elem[1])
        else:
            dicTime[stepTime] = [elem[1]]
            
    
    #convert to arr to keep indexes
    arrTimeContent = []
    for k in dicTime.keys():
        tupla = (k,dicTime[k])
        arrTimeContent.append(tupla)
        
    #create corpus
    myCorpus = []
    for elem in arrTimeContent:
        allMsgsContent = ""
        for textMsg in elem[1]:
            msgContent = re.sub('[^0-9\'.a-zA-Z]+', ' ', textMsg)
            allMsgsContent = allMsgsContent + " " + msgContent + " "
        myCorpus.append(unicode(allMsgsContent, "utf-8",errors='ignore'))
    
    #tf-idf vars    
    vect = TfidfVectorizer(analyzer='word', ngram_range=(1,3), min_df = 0, stop_words = stopset)
    tfidf_matrix =  vect.fit_transform(myCorpus)
    feature_names = vect.get_feature_names()
    dense = tfidf_matrix.todense()
    
    #build the final arr of Timeseries
    globalArrTime = []
    i=0
    for timeItem in dense :
        email = timeItem.tolist()[0]
        phrase_scores = [pair for pair in zip(range(0, len(email)), email) if pair[1] > 0]
        sorted_phrase_scores = sorted(phrase_scores, key=lambda t: t[1] * -1)
        
        dicTime = {}
        dicTime['name'] = str(arrTimeContent[i][0])
        dicTime['words'] = []
        
        #if dicTime['name'] == "2001-05":
        #    for phrase, score in [(feature_names[word_id], score) for (word_id, score) in sorted_phrase_scores][:100]:
        #        print phrase+" - "+str(score)
        
        for phrase, score in [(feature_names[word_id], score) for (word_id, score) in sorted_phrase_scores][:wordsNum * 10]:
            data = {'name':phrase,'score':score}
            dicTime['words'].append(data)
        #print dicTime
        
        globalArrTime.append(dicTime)
        i = i + 1
        
    finalArr = globalArrTime
    myVoc = []
    #get Best Words Num
    finalArr = []
    for dt in globalArrTime:
        
        dicTime = {}
        dicTime['name'] = dt['name']
        dicTime['words'] = []
        wordsXt = wordsNum
        for wScore in dt['words']:
            if checkGramTime(wScore,dt['words']):
                dicTime['words'].append(wScore)
                myVoc.append(wScore['name'])
                wordsXt = wordsXt - 1    
            if wordsXt == 0:
                break
        finalArr.append(dicTime)
    
    globalDic = {}
    globalDic['wordsXtime'] = finalArr
    globalDic['termsCount'] = termsCountMatrix(dataset,datasetUrls,myVoc)
    return globalDic
    

def wordClustering(dataset,conceptNum,wordsNum,datasetUrls):

    stopset = setStopWords(dataset)
    
    dicEmails = getAllArchiveText(datasetUrls)

    #create array of all emails retrieved
    arrEmails = []
    for k in dicEmails.keys():
        tupla = (k,dicEmails[k])
        arrEmails.append(tupla)
            
    myCorpus = []
    for elem in arrEmails:
        filteredText = re.sub('[^0-9\'.a-zA-Z]+', ' ', elem[1])
        myCorpus.append(unicode(filteredText, "utf-8",errors='ignore'))
        
    vectorizer = TfidfVectorizer(use_idf=True, ngram_range=(1,3), min_df = 0, stop_words = stopset)
    X = vectorizer.fit_transform(myCorpus)

    
    # Truncate the matrix to a number of components(concepts)
    lsa = TruncatedSVD(n_components=conceptNum, n_iter=100)
    lsa.fit(X)
    
    allData = []
    terms = vectorizer.get_feature_names()
    for i, comp in enumerate(lsa.components_):
        #merge 2 lists together terms and comp
        termsInComp = zip (terms,comp)
        sortedTerms =  sorted(termsInComp, key=lambda x: x[1], reverse=True) [:wordsNum*3]
        
        cluster = {}
        #cluster['name'] = "Concept %d" % i
        cluster['name'] = str(sortedTerms[0][0])
        cluster['id'] = str(i)
        clusterData =[]
        #print "Concept %d:" % i
        
        wordsXclus = wordsNum
        for term in sortedTerms:
            data = {}
            data['name'] = term[0]
            data['score'] = term[1]
            if checkGram(data,sortedTerms):
                clusterData.append(data)
                wordsXclus = wordsXclus - 1    
            if wordsXclus == 0:
                break
            #clusterData.append(data)
            #print term
        cluster['children'] = clusterData
        allData.append(cluster)
    
    arrCosSim = []
    for i in range(0,len(arrEmails)):
        cosine_similarities = linear_kernel(X[i:i+1], lsa.components_).flatten()
        
        objDic = {}
        objDic['subject'] = arrEmails[i][0][0]
        objDic['time'] = arrEmails[i][0][1]
        objDic['cosSim'] = []
        for i in range(0,len(cosine_similarities)-1):
            objCosScore = {}
            objCosScore['cluster'] = i
            objCosScore['score'] = cosine_similarities[i]
            objDic['cosSim'].append(objCosScore)
        
        arrCosSim.append(objDic)
    
    returnedDic = {}
    returnedDic['name'] = 'clusters'
    returnedDic['children'] = allData
    returnedDic['emailsClusters'] = arrCosSim
    
    return returnedDic

def checkGram(data,sortedTerms):
    for elem in sortedTerms:
        if data['name'] in elem[0]:
            if len(elem[0]) > len(data['name']):
                if data['score'] == elem[1]:
                    return False
    return True

def checkGramTime(data,sortedTerms):
    for elem in sortedTerms:
        if data['name'] in elem['name']:
            if len(elem['name']) > len(data['name']):
                if data['score'] == elem['score']:
                    return False
    return True

def iequal(a, b):
    try:
        return a.upper() == b.upper()
    except AttributeError:
        return a == b


#When this file is called
cmdargs = str(sys.argv)
functionname = str(sys.argv[1])
#datasetUrl = 'server/data/mbox/enron/enron-smith-m.mbox'

if(functionname == "bestwords"):
    mboxUrls = re.split('<newurl>', sys.argv[2])
    datasetName = str(sys.argv[3])
    numWords = int(sys.argv[4])
    allText = sys.argv[5]
    
    globalDic = bestwords(allText,numWords,datasetName)
    
    print json.dumps(globalDic, ensure_ascii=False)

elif(functionname == "wordsXtime"):
    mboxUrls = re.split('NEWURL', sys.argv[2])
    datasetName = str(sys.argv[3])
    wordsNum = int(sys.argv[4])
    
    globalDic = {}
    globalDic['name'] = 'wordsXtime'
    #globalDic['columns'] = wordsXtime(datasetName,wordsNum,mboxUrls)
    res = wordsXtime(datasetName,wordsNum,mboxUrls)
    
    print json.dumps(res, ensure_ascii=False)
    
elif(functionname == "clusterwords"):
    mboxUrls = re.split('NEWURL', sys.argv[2])
    datasetName = str(sys.argv[3])
    conceptNum = int(sys.argv[4])
    wordsNum = int(sys.argv[5])

    globalDic = wordClustering(datasetName,conceptNum,wordsNum,mboxUrls)

    print json.dumps(globalDic, ensure_ascii=False)
        
elif(functionname == "getStopWords"):
    
    datasetName = str(sys.argv[2])
    
    arrSW = []
    for sw in setStopWords(datasetName):
        arrSW.append(sw)
    
    globalDic = {}
    globalDic['stopWords'] = arrSW
    
    print json.dumps(globalDic, ensure_ascii=False)
    

'''   
elif(functionname == "termsCountMatrix"):
    mboxUrls = re.split('<newurl>', sys.argv[2])
    datasetName = str(sys.argv[3])

    globalDic = {}
    globalDic['termsCountMatrix'] = termsCountMatrix(datasetName,mboxUrls)
    print json.dumps(globalDic, ensure_ascii=False)
'''    

#exampleCall: python2.7 server/nlp-proc.py clusterwords server/data/mbox/enron/enron-smith-m.mbox enron 10 10
#returns : {name:'clusters',children:[{'name':clusterX,'children':childrenX}],
#           'emailsClusters':[{'subject':subjX,'time':timeX,'cosSim':[{}]}]}