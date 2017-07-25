
# coding: utf-8

# In[16]:



# In[60]:

import sys
sys.path.append('/anaconda/envs/py27/lib/python2.7/site-packages/')
#sys.path.append('/usr/local/lib/python2.7/site-packages')

#for smartdata server
#sys.path.append('/usr/local/lib/python2.7/dist-packages')

import json
import mailbox
from datetime import datetime, timedelta
import re
import email


# In[17]:

# In[61]:

class emailobj:
    origin = None
    target = None
    cc = None
    bcc = None
    subject = ""
    date = None 
    content = ""

    def __init__(self, origin, target, cc, bcc, subject, date, content):
        self.origin = origin
        self.target = target
        self.cc = cc
        self.bcc = bcc
        self.subject = subject
        self.date = date
        self.content = content


def retrievedata(mymail):
    emailArchive = []
    emailmsg = None
    
    for message in mymail:
            emailmsg = emailobj(normalizeContacts(message['from']),
                          normalizeContacts(message['to']),
                          normalizeContacts(message['cc']),
                          normalizeContacts(message['bcc']),
                          normalizeSubject(message['subject']),
                          normalizeDate(message['date']),
                          normalizeBody(message))
            emailArchive.append(emailmsg)
    return emailArchive

def retrieveOriginaldata(mymail):
    emailArchive = []
    emailmsg = None
    
    for message in mymail:
            emailmsg = emailobj(normalizeContacts(message['from']),
                          normalizeContacts(message['to']),
                          normalizeContacts(message['cc']),
                          normalizeContacts(message['bcc']),
                          normalizeSubject(message['subject']),
                          normalizeDate(message['date']),
                          message)
            emailArchive.append(emailmsg)
    return emailArchive


# In[19]:

# In[63]:

def genEmailArch(emailsData):   
            
    #emailArch [[origin],[target],[cc/bcc],"subject",date, "content","urls","emails"]
    emailArch = []
    for emailDir in emailsData:
        for emailmsg in emailDir:
            emailArch.append([
                list(set(emailmsg.origin)),
                list(set(emailmsg.target)),
                list(set(emailmsg.cc + emailmsg.bcc)),
                str(emailmsg.subject),
                emailmsg.date,
                emailmsg.content,
                infoInBody(emailmsg.content)[0],
                infoInBody(emailmsg.content)[1]
                ])
    return emailArch


# In[20]:

# In[64]:

def genNodes(emailArch):
    nodes = {}
    idCount = 0
    for emailRow in emailArch:
        allnodes = list(set(emailRow[0] + emailRow[1] + emailRow[2]))
        for n in allnodes:
            if(n not in nodes):
                nodes[n] = idCount
                idCount += 1
    return nodes

def genEdges(emailArch,nodes):
    edges = {}
    edgesInfo = []
    
    idCount = 0
    for emailRow in emailArch:
        for origin in emailRow[0]:
            targetNodes = list(set(emailRow[1] + emailRow[2]))
            for target in targetNodes:
                tuplaKey = (nodes[origin],nodes[target])
                if (tuplaKey not in edges):
                    edges[tuplaKey] = idCount
                    idCount += 1

                edgesInfo.append([
                    edges[tuplaKey],
                    tuplaKey[0],
                    tuplaKey[1],
                    emailRow[3],
                    emailRow[4],
                    emailRow[5],
                    emailRow[6],
                    emailRow[7]])
    return edgesInfo
         
def normalizeContacts(contacts):
    if contacts == None :
        return []
    else:
        tl = re.findall(r'[a-zA-Z0-9_-]+[.|\w]\w+@[a-zA-Z0-9_-]+[.]\w+[.|\w+]+',contacts)
        return list(set(tl))

def normalizeSubject(mysubject):
    if mysubject == None:
        return None
    else:
        ee = email.Header.decode_header(mysubject)
        return re.sub('Re: |RE: ', '', ee[0][0]) 

def normalizeDate(mydatetime):
    try:
        filterdate = re.sub(r' \+.*$| -.*$', "", mydatetime)
        #print filterdate
        myTime = datetime.strptime(filterdate, '%a, %d %b %Y %H:%M:%S')
        if (myTime.year < 20):
            #add 2000 years 
            years = 2000
            days_per_year = 365.24
            newtime = myTime + timedelta(days=(years*days_per_year))
            myTime = newtime
        return myTime.strftime('%Y/%m/%d %H:%M:%S')
    except (ValueError, TypeError, NameError):
        return ""

def infoInBody(msgbody):
    urls = re.findall(ur'(http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?',msgbody)
    myurls = []
    for url in urls:
        myurls.append(url[1])
    emails = re.findall(r'[a-zA-Z0-9_-]+[.|\w]\w+@[a-zA-Z0-9_-]+[.]\w+[.|\w+]+',msgbody);
    #msgbody = re.sub('(http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?', '', msgbody)
    
    urlString = ""
    for url in myurls:
        urlString = urlString + url + "<newelem>"
    
    emailString = ""
    for email in emails:
        emailString = emailString + email + "<newelem>"
    
    return (urlString,emailString)
    
def normalizeBody(message):
    msgbody = getbody(message)
    msgbody = removeReplies(msgbody,message)
    #remove too many white spaces
    msgbody = re.sub('[ ]{2,}', ' ', msgbody)
    #msgbody = re.sub("(\n|<|>|}|{|\")",' ',msgbody)
    msgbody = re.sub("[^a-zA-Z0-9]+",' ', msgbody)
    #if(message['subject'] == 'Re: Bike sharing project'):
    #    print msgbody
    return msgbody

def removeReplies(msgbody,message):
    noReplies = msgbody
    #if message['In-Reply-To'] != None:
    #noReplies = ''.join(noReplies.partition('From:')[0:2])
    noReplies = re.sub(r' From:.*$| wrote:.*$| Original Message .*$| ha scritto:.*$| Da:.*$|-----Original Message-----.*$', "", noReplies)
    noReplies = re.sub('[_]{2,}', ' ', noReplies)
    return noReplies

def getbody(message): #getting plain text 'email body'
    body = "None"
    if message.is_multipart():
        for part in message.walk():
            if part.is_multipart():
                for subpart in part.walk():
                    if subpart.get_content_type() == 'text/plain':
                        body = subpart.get_payload(decode=True)
            elif part.get_content_type() == 'text/plain':
                body = part.get_payload(decode=True)
    elif message.get_content_type() == 'text/plain':
        body = message.get_payload(decode=True)
    return body

def genEdgesNodesJson(edges,nodes,myContacts):
    
    nodesDic = {}
    for k in nodes.keys():
        nodesDic[nodes[k]] = k
    
    myContactIds = []
    for myContact in myContacts:
        if myContact in nodes:
            myContactIds.append(nodes[myContact])
    
    undEdgesId = 0
    dicUndEdgesId = {}
    for k in edges:
        lista = [k[1],k[2]]
        lista.sort()
        tupla = tuple(lista)
        if tupla not in dicUndEdgesId:
            dicUndEdgesId[tupla] = undEdgesId
            undEdgesId = undEdgesId + 1
        
    arrEdgesDirected = []
    arrEdgesUndirected = []
    objDicDirectedNodes = {}
    objDicUndirectedNodes = {}
    arrCollSubj = collaborativeSubj(edges)
    for k in edges:
        objDic = {}
        
        #Directed case
        objDic['id'] = k[0]
        objDic['origin'] = k[1]
        objDic['target'] = k[2]
        objDic['originLbl'] = nodesDic[objDic['origin']]
        objDic['targetLbl'] = nodesDic[objDic['target']]
        objDic['subject'] = k[3]
        objDic['time'] = k[4]
        objDic['content'] = k[5]
        objDic['urls'] = k[6]
        objDic['emails'] = k[7]
        
        arrEdgesDirected.append(objDic)

        objDicDirectedNodes[objDic['origin']] = objDic['originLbl']
        objDicDirectedNodes[objDic['target']] = objDic['targetLbl']
        
        #Undirected case
        if ((not(k[1] in myContactIds)) and (not(k[2] in myContactIds))):
            if k[3] in arrCollSubj :
                lista = [k[1],k[2]]
                lista.sort()
                tupla = tuple(lista)
                objDic = {}
                objDic['id'] = dicUndEdgesId[tupla]
                objDic['origin'] = tupla[0]
                objDic['target'] = tupla[1]
                objDic['originLbl'] = nodesDic[objDic['origin']]
                objDic['targetLbl'] = nodesDic[objDic['target']]
                objDic['subject'] = k[3]
                objDic['time'] = k[4]
                objDic['content'] = k[5]
                objDic['urls'] = k[6]
                objDic['emails'] = k[7]

                arrEdgesUndirected.append(objDic)
                objDicUndirectedNodes[objDic['origin']] = objDic['originLbl']
                objDicUndirectedNodes[objDic['target']] = objDic['targetLbl']
    
    
    arrNodesDirected = []
    for k in objDicDirectedNodes.keys():
        objDic = {}
        objDic['id'] = k
        objDic['label'] = objDicDirectedNodes[k]
        arrNodesDirected.append(objDic)
        
    arrNodesUndirected = []
    for k in objDicUndirectedNodes.keys():
        objDic = {}
        objDic['id'] = k
        objDic['label'] = objDicUndirectedNodes[k]
        arrNodesUndirected.append(objDic)
    
    globalDic = {}
    internalDic = {}
    internalDic['directed'] = arrEdgesDirected
    internalDic['undirected'] = arrEdgesUndirected
    globalDic['edges'] = internalDic
    
    internalDic = {}
    internalDic['directed'] = arrNodesDirected
    internalDic['undirected'] = arrNodesUndirected
    globalDic['nodes'] = internalDic

        
    return globalDic

def getTest():
    stringa = "ciao"
    return stringa

def getAllArchive(mboxUrl):
    emailData = []
    emailData.append(retrievedata(mailbox.mbox(str(mboxUrl))))
    
    emailArch = genEmailArch(emailData)
    
    return emailArch
  
#returns archive dictionary {(subject,time)} -> content  
def getAllArchiveText(mboxUrls):
    emailData = []
    for mboxUrl in mboxUrls:
        emailData.append(retrievedata(mailbox.mbox(str(mboxUrl))))
    emailArch = genEmailArch(emailData)
    
    dicEmails = {}
    for e in emailArch:
        #(subject,time) the tupla key
        tupla = (e[3],e[4])
        #content to the key
        dicEmails[tupla] = e[5]
    return dicEmails
    
def getEmailsOfSub(subj,subjTime,arrMboxUrl):
    arrEmails = []
    for mboxUrl in arrMboxUrl:
        mymail = mailbox.mbox(mboxUrl)
        for message in mymail:
            if(normalizeSubject(message['subject']) == subj):
                mytime = normalizeDate(message['date'])
                #return [str(mytime),subjTime]
                if(str(mytime) == subjTime):
                    msgObj = {'date': str(mytime),'allmsg':str(message)}
                    arrEmails.append(msgObj)
    return arrEmails

def getNodesContents(nodes,mboxUrl):
    emailData = []
    emailData.append(retrievedata(mailbox.mbox(str(mboxUrl))))
    
    emailArch = genEmailArch(emailData)
    
    
    return emailArch

# In[69]:

def convertToJSON(emailArch):
    emailsJSON = []
    for e in emailArch:
        emailObj = {}
        emailObj['from'] = e[0]
        emailObj['to'] = e[1]
        emailObj['cc'] = e[2]
        emailObj['subject'] = e[3]
        emailObj['time'] = e[4]
        emailObj['content'] = e[5]
        emailsJSON.append(emailObj)
    return emailsJSON

    
def collaborativeSubj(edges):
    dicSubj = {}
    
    for k in edges:
        if k[3] not in dicSubj:
            dicSubj[k[3]] = []
            dicSubj[k[3]].append(k[4])
        else:
            if k[4] not in dicSubj[k[3]]:
                dicSubj[k[3]].append(k[4])
        
    arrSubj = []
    for k in dicSubj.keys():
        if (int(len(dicSubj[k])) > 1):
            arrSubj.append(k)
    return arrSubj


cmdargs = str(sys.argv)
functionname = str(sys.argv[1])

if(functionname == "getNodesEdges"):
    
    mboxUrls = re.split('NEWURL', sys.argv[2])
    mboxMyContacts = re.split('NEWCONTACT', sys.argv[3])
    emailData = []
    
    for mboxUrl in mboxUrls:
        emailData.append(retrievedata(mailbox.mbox(mboxUrl)))

    
    emailArch = genEmailArch(emailData)
    nodes = genNodes(emailArch)
    edges = genEdges(emailArch,nodes)
    allData = genEdgesNodesJson(edges,nodes,mboxMyContacts)

    resultDic = {}
    resultDic['allEmails'] = convertToJSON(emailArch)
    resultDic['nodesEdges'] = allData
    
    print json.dumps(resultDic, ensure_ascii=False)


elif(functionname == 'getOriginalEmails'):
    
    mboxUrls = re.split('<newurl>', sys.argv[2])
    datasetName = str(sys.argv[3])
    subjectTime = sys.argv[4]+" "+sys.argv[5]
    subject = str(sys.argv[6])
    
    for i in range(7,len(sys.argv)):
        subject = subject + " " + sys.argv[i]
    
    globalDic = {}
    globalDic['name'] = subject
    globalDic['msgs'] = getEmailsOfSub(subject,subjectTime,mboxUrls)
    
    print json.dumps(globalDic, ensure_ascii=False)

elif(functionname == 'getAllEmails'):
    
    mboxUrls = re.split('NEWURL', sys.argv[2])
    emailData = []
    
    for mboxUrl in mboxUrls:
        emailData.append(retrieveOriginaldata(mailbox.mbox(mboxUrl)))

    emailArch = genEmailArch(emailData)
    
    resultDic = {}
    resultDic['allEmails'] = convertToJSON(emailArch)
    print json.dumps(resultDic, ensure_ascii=False)
