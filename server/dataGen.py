# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import print_function

import re
import sys
import json
import email
import mailbox

from datetime import datetime, timedelta


class Email:
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


def retrieve_data(mymail):
    email_archive = []

    for message in mymail:
        email_message = Email(
            normalizeContacts(message['from']),
            normalizeContacts(message['to']),
            normalizeContacts(message['cc']),
            normalizeContacts(message['bcc']),
            normalizeSubject(message['subject']),
            normalizeDate(message['date']),
            normalizeBody(message))
        email_archive.append(email_message)
    return email_archive


def retrieve_original_data(mymail):
    email_archive = []

    for message in mymail:
        email_message = Email(
            normalizeContacts(message['from']),
            normalizeContacts(message['to']),
            normalizeContacts(message['cc']),
            normalizeContacts(message['bcc']),
            normalizeSubject(message['subject']),
            normalizeDate(message['date']),
            message)
        email_archive.append(email_message)
    return email_archive


def generate_email_archive(emails_data):
    # emailArch [[origin],[target],[cc/bcc],"subject",date, "content","urls","emails"]
    email_archive = []
    for emailDir in emails_data:
        for emailmsg in emailDir:
            email_archive.append([
                list(set(emailmsg.origin)),
                list(set(emailmsg.target)),
                list(set(emailmsg.cc + emailmsg.bcc)),
                str(emailmsg.subject),
                emailmsg.date,
                emailmsg.content,
                infoInBody(emailmsg.content)[0],
                infoInBody(emailmsg.content)[1]
            ])
    return email_archive


def genNodes(emailArch):
    nodes = {}
    idCount = 0
    for emailRow in emailArch:
        allnodes = list(set(emailRow[0] + emailRow[1] + emailRow[2]))
        for n in allnodes:
            if (n not in nodes):
                nodes[n] = idCount
                idCount += 1
    return nodes


def genEdges(emailArch, nodes):
    edges = {}
    edgesInfo = []

    idCount = 0
    for emailRow in emailArch:
        for origin in emailRow[0]:
            targetNodes = list(set(emailRow[1] + emailRow[2]))
            for target in targetNodes:
                tuplaKey = (nodes[origin], nodes[target])
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
    if contacts == None:
        return []
    else:
        tl = re.findall(
            r'[a-zA-Z0-9_-]+[.|\w]\w+@[a-zA-Z0-9_-]+[.]\w+[.|\w+]+', contacts)
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
        # print filterdate
        myTime = datetime.strptime(filterdate, '%a, %d %b %Y %H:%M:%S')
        if (myTime.year < 20):
            # add 2000 years
            years = 2000
            days_per_year = 365.24
            newtime = myTime + timedelta(days=(years * days_per_year))
            myTime = newtime
        return myTime.strftime('%Y/%m/%d %H:%M:%S')
    except (ValueError, TypeError, NameError):
        return ""


def infoInBody(msgbody):
    urls = re.findall(
        r'(http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?', msgbody)
    myurls = []
    for url in urls:
        myurls.append(url[1])
    emails = re.findall(
        r'[a-zA-Z0-9_-]+[.|\w]\w+@[a-zA-Z0-9_-]+[.]\w+[.|\w+]+', msgbody)
    # msgbody = re.sub('(http|ftp|https)://([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?', '', msgbody)

    urlString = ""
    for url in myurls:
        urlString = urlString + url + "<newelem>"

    emailString = ""
    for email in emails:
        emailString = emailString + email + "<newelem>"

    return (urlString, emailString)


def normalizeBody(message):
    msgbody = getbody(message)
    msgbody = removeReplies(msgbody, message)
    # remove too many white spaces
    msgbody = re.sub('[ ]{2,}', ' ', msgbody)
    # msgbody = re.sub("(\n|<|>|}|{|\")",' ',msgbody)
    msgbody = re.sub("[^a-zA-Z0-9]+", ' ', msgbody)
    # if(message['subject'] == 'Re: Bike sharing project'):
    #    print msgbody
    return msgbody


def removeReplies(msgbody, message):
    noReplies = msgbody
    # if message['In-Reply-To'] != None:
    # noReplies = ''.join(noReplies.partition('From:')[0:2])
    noReplies = re.sub(
        r' From:.*$| wrote:.*$| Original Message .*$| ha scritto:.*$| Da:.*$|-----Original Message-----.*$', "",
        noReplies)
    noReplies = re.sub('[_]{2,}', ' ', noReplies)
    return noReplies


def getbody(message):  # getting plain text 'email body'
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


def genEdgesNodesJson(edges, nodes, myContacts):
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
        lista = [k[1], k[2]]
        lista.sort()
        tupla = tuple(lista)
        if tupla not in dicUndEdgesId:
            dicUndEdgesId[tupla] = undEdgesId
            undEdgesId = undEdgesId + 1

    arr_edges_directed = []
    arr_edges_undirected = []
    obj_dic_directed_nodes = {}
    objDicUndirectedNodes = {}
    arrCollSubj = collaborative_subj(edges)
    for k in edges:
        objDic = {}

        # Directed case
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

        arr_edges_directed.append(objDic)

        obj_dic_directed_nodes[objDic['origin']] = objDic['originLbl']
        obj_dic_directed_nodes[objDic['target']] = objDic['targetLbl']

        # Undirected case
        if ((not (k[1] in myContactIds)) and (not (k[2] in myContactIds))):
            if k[3] in arrCollSubj:
                lista = [k[1], k[2]]
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

                arr_edges_undirected.append(objDic)
                objDicUndirectedNodes[objDic['origin']] = objDic['originLbl']
                objDicUndirectedNodes[objDic['target']] = objDic['targetLbl']

    arrNodesDirected = []
    for k in obj_dic_directed_nodes.keys():
        objDic = {}
        objDic['id'] = k
        objDic['label'] = obj_dic_directed_nodes[k]
        arrNodesDirected.append(objDic)

    arrNodesUndirected = []
    for k in objDicUndirectedNodes.keys():
        objDic = {}
        objDic['id'] = k
        objDic['label'] = objDicUndirectedNodes[k]
        arrNodesUndirected.append(objDic)

    globalDic = {}
    internalDic = {}
    internalDic['directed'] = arr_edges_directed
    internalDic['undirected'] = arr_edges_undirected
    globalDic['edges'] = internalDic

    internalDic = {}
    internalDic['directed'] = arrNodesDirected
    internalDic['undirected'] = arrNodesUndirected
    globalDic['nodes'] = internalDic

    return globalDic


def getTest():
    stringa = "ciao"
    return stringa


def get_all_archive(mboxUrl):
    emailData = []
    emailData.append(retrieve_data(mailbox.mbox(str(mboxUrl))))

    emailArch = generate_email_archive(emailData)

    return emailArch


# returns archive dictionary {(subject,time)} -> content
def get_all_archive_text(mboxUrls):
    email_data = []
    for mbox_url in mboxUrls:
        email_data.append(retrieve_data(mailbox.mbox(str(mbox_url))))
    email_arch = generate_email_archive(email_data)

    dic_emails = {}
    for email in email_arch:
        # (subject,time) the tupla key
        tupla = (email[3], email[4])
        # content to the key
        dic_emails[tupla] = email[5]
    return dic_emails


def getEmailsOfSub(subj, subjTime, arrMboxUrl):
    arrEmails = []
    for mboxUrl in arrMboxUrl:
        mymail = mailbox.mbox(mboxUrl)
        for message in mymail:
            if (normalizeSubject(message['subject']) == subj):
                mytime = normalizeDate(message['date'])
                # return [str(mytime),subjTime]
                if (str(mytime) == subjTime):
                    msgObj = {'date': str(mytime), 'allmsg': str(message)}
                    arrEmails.append(msgObj)
    return arrEmails


def get_nodes_contents(nodes, mboxUrl):
    email_data = list()
    email_data.append(retrieve_data(mailbox.mbox(str(mboxUrl))))
    email_arch = generate_email_archive(email_data)
    return email_arch


def convert_to_json(email_archive):
    emails_json = list()
    for e in email_archive:
        email_obj = dict()
        email_obj['from'] = e[0]
        email_obj['to'] = e[1]
        email_obj['cc'] = e[2]
        email_obj['subject'] = e[3]
        email_obj['time'] = e[4]
        email_obj['content'] = e[5]
        emails_json.append(email_obj)
    return emails_json


def collaborative_subj(edges):
    dic_subj = dict()

    for k in edges:
        if k[3] not in dic_subj:
            dic_subj[k[3]] = []
            dic_subj[k[3]].append(k[4])
        else:
            if k[4] not in dic_subj[k[3]]:
                dic_subj[k[3]].append(k[4])

    list_subj = list
    for k in dic_subj.keys():
        if len(dic_subj[k]) > 1:
            list_subj.append(k)
    return list_subj


cmdargs = str(sys.argv)
functionname = str(sys.argv[1])

if functionname == "getNodesEdges":
    mboxUrls = re.split('NEWURL', sys.argv[2])
    mboxMyContacts = re.split('NEWCONTACT', sys.argv[3])
    emailData = []

    for mboxUrl in mboxUrls:
        emailData.append(retrieve_data(mailbox.mbox(mboxUrl)))

    emailArch = generate_email_archive(emailData)
    nodes = genNodes(emailArch)
    edges = genEdges(emailArch, nodes)
    allData = genEdgesNodesJson(edges, nodes, mboxMyContacts)

    result_dict = dict()
    result_dict['allEmails'] = convert_to_json(emailArch)
    result_dict['nodesEdges'] = allData
    print(json.dumps(result_dict, ensure_ascii=False))

elif functionname == 'getOriginalEmails':
    mboxUrls = re.split('<newurl>', sys.argv[2])
    datasetName = str(sys.argv[3])
    subjectTime = sys.argv[4] + " " + sys.argv[5]
    subject = str(sys.argv[6])

    for i in range(7, len(sys.argv)):
        subject = subject + " " + sys.argv[i]

    global_dict = dict()
    global_dict['name'] = subject
    global_dict['msgs'] = getEmailsOfSub(subject, subjectTime, mboxUrls)

    print(json.dumps(global_dict, ensure_ascii=False))

elif functionname == 'getAllEmails':
    mboxUrls = re.split('NEWURL', sys.argv[2])
    emailData = []

    for mboxUrl in mboxUrls:
        emailData.append(retrieve_original_data(mailbox.mbox(mboxUrl)))

    emailArch = generate_email_archive(emailData)

    result_dict = dict()
    result_dict['allEmails'] = convert_to_json(emailArch)
    print(json.dumps(result_dict, ensure_ascii=False))
