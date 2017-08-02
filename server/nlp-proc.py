# -*- coding: utf-8 -*-
from __future__ import absolute_import
from __future__ import print_function

import re
import sys
import json
import collections

from datetime import datetime

from nltk.corpus import stopwords

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import linear_kernel

from .dataGen import getAllArchive
from .dataGen import getAllArchiveText


def set_stop_words(dataset):

    stop_words = None

    if dataset == "clinton":
        stop_words = set(stopwords.words('english'))
        other_s_words = ['UNCLASSIFIED', 'U.S.', 'Department', 'State', 'Case', 'No.', 'No', 'US', 'Doc', 'Date',
                         'From', 'To', 'Subject', 'Clinton', 'clinton', 'sent', 'Sent', 'Send', 'Ok', 'ok', 'pm', 'am']
        stop_words.update(list(set(other_s_words)))

        # XXX: what? this wouldn't work for clinton
        # stop_words.update(allNames)
        raise ValueError('AllNames var is not defined')
    elif dataset == "enron":
        stop_words = set(stopwords.words('english'))
        other_s_words = ['enron', 'No.', 'No', 'US', 'Ok', 'ok', 'pm',
                         'am', 'http', 'link', 'www', 'com', 'html', 'travelocity']
        stop_words.update(list(set(other_s_words)))
    elif dataset == "uniboIvan":
        stop_words = set(stopwords.words('italian'))
        eng_stop_words = set(stopwords.words('english'))
        stop_words.update(list(eng_stop_words))

        other_s_words = ['Grazie', 'grazie', 'Saluti', 'saluti', 'Salve', 'salve',
                         'Distinti', 'distinti', 'Cordiali', 'cordiali', 'http', 'pm', 'am', 'www']
        stop_words.update(list(set(other_s_words)))

    # additional stop words
    html_tags = ["a", "abbr", "acronym", "address", "area", "b", "base", "bdo", "big", "blockquote", "body", "br",
                 "button", "caption", "cite", "code", "col", "colgroup", "dd", "del", "dfn", "div", "dl", "DOCTYPE",
                 "dt", "em", "fieldset", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "html", "hr", "i", "img",
                 "input", "ins", "kbd", "label", "legend", "li", "link", "map", "meta", "noscript", "object", "ol",
                 "optgroup", "option", "p", "param", "pre", "q", "samp", "script", "select", "small", "span", "strong",
                 "style", "sub", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "title", "tr", "tt",
                 "ul", "var"]
    other_html_params = ["font", "width", "height", "href", "gif", "color", "size", "00", "image", "net", "asp"]
    irr_numbers = []
    for i in range(101):
        irr_numbers.append(str(i))

    stop_words.update(list(set(html_tags)))
    stop_words.update(list(set(other_html_params)))
    stop_words.update(list(set(irr_numbers)))

    return stop_words


def in_stop_words(word, stop_words):
    for stop_word in stop_words:
        if iequal(word, stop_word):
            return True
    return False


def best_words(string_text, num_words, dataset):

    stop_words = set_stop_words(dataset)
    text = string_text

    words = re.findall('\w+', text)
    filter_words = []
    for w in words:
        if not in_stop_words(w, stop_words):
            filter_words.append(w)

    my_coll = collections.Counter(filter_words)
    best10 = my_coll.most_common(num_words)

    dicbest = list()
    for item in best10:
        item_json = dict()
        item_json['word'] = item[0]
        item_json['value'] = item[1]
        dicbest.append(item_json)

    global_dic = dict()
    global_dic['words'] = dicbest
    return global_dic


def terms_count_matrix(dataset, dataset_urls, voc):

    stopset = set_stop_words(dataset)
    # returns a dictionary where keys are the pairs (subject,time)
    dic_emails = getAllArchiveText(dataset_urls)

    # create array of all emails retrieved
    arr_emails = []
    for k in dic_emails.keys():
        tupla = (k, dic_emails[k])
        arr_emails.append(tupla)

    # create corpus from all emails
    my_corpus = []
    for textElem in arr_emails:
        msg_content = re.sub('[^0-9\'.a-zA-Z]+', ' ', textElem[1])
        my_corpus.append(u'{}'.format(msg_content))

    vect = CountVectorizer(analyzer='word', vocabulary=list(
        set(voc)), ngram_range=(1, 3), stop_words=stopset)
    count_matrix = vect.fit_transform(my_corpus)
    feature_names = vect.get_feature_names()
    dense = count_matrix.todense()

    i = 0
    dic_terms = dict()
    for timeItem in dense:

        # array of all terms freq counts for each email
        email_scores = timeItem.tolist()[0]
        num_terms = len(email_scores)

        # phrases_scores: creates an array of pairs (term_array_index, term_score) for every email
        phrase_scores = [pair for pair in zip(
            range(0, num_terms), email_scores) if pair[1] > 0]

        # sort the phrases_scores
        # XXX: sorted_phrase_scores is not used
        # sorted_phrase_scores = sorted(phrase_scores, key=lambda t: t[1] * -1)

        for phrase, score in [(feature_names[word_id], score) for (word_id, score) in phrase_scores]:
            data = {'score': score,
                    'subject': arr_emails[i][0][0], 'time': arr_emails[i][0][1]}

            if dic_terms.has_key(phrase):
                dic_terms[phrase].append(data)
            else:
                dic_terms[phrase] = [data]
        i += 1

    arr_res_terms = []
    for termKey in dic_terms:
        # arr_res_terms[dicTerms[termKey]['name']] = dicTerms[termKey]
        arr_res_terms.append(dic_terms[termKey])

    # returns a JSON {phrase_word:[array-of-emails]}
    return dic_terms


def words_per_time(dataset, words_num, dataset_urls):

    stopset = set_stop_words(dataset)
    dic_emails = getAllArchiveText(dataset_urls)

    # create array of all emails retrieved
    arr_emails = []
    for k in dic_emails.keys():
        tupla = (k, dic_emails[k])
        arr_emails.append(tupla)

    # create dictionary according to the dates
    dic_time = {}
    for elem in arr_emails:
        time = datetime.strptime(elem[0][1], '%Y/%m/%d %H:%M:%S')
        step_time = time.strftime('%Y-%m')
        if step_time in dic_time:
            dic_time[step_time].append(elem[1])
        else:
            dic_time[step_time] = [elem[1]]

    # convert to arr to keep indexes
    arr_time_content = []
    for k in dic_time.keys():
        tupla = (k, dic_time[k])
        arr_time_content.append(tupla)

    # create corpus
    my_corpus = []
    for elem in arr_time_content:
        all_msgs_content = ""
        for text_msg in elem[1]:
            msg_content = re.sub('[^0-9\'.a-zA-Z]+', ' ', text_msg)
            all_msgs_content = all_msgs_content + " " + msg_content + " "
        my_corpus.append(u'{}'.format(all_msgs_content))

    # tf-idf vars
    vect = TfidfVectorizer(analyzer='word', ngram_range=(
        1, 3), min_df=0, stop_words=stopset)
    tfidf_matrix = vect.fit_transform(my_corpus)
    feature_names = vect.get_feature_names()
    dense = tfidf_matrix.todense()

    # build the final arr of Timeseries
    global_arr_time = []
    i = 0
    for timeItem in dense:
        email = timeItem.tolist()[0]
        phrase_scores = [pair for pair in zip(
            range(0, len(email)), email) if pair[1] > 0]
        sorted_phrase_scores = sorted(phrase_scores, key=lambda t: t[1] * -1)

        dic_time = dict()
        dic_time['name'] = str(arr_time_content[i][0])
        dic_time['words'] = []

        for phrase, score in [(feature_names[word_id], score)
                              for (word_id, score) in sorted_phrase_scores][:words_num * 10]:
            data = {'name': phrase, 'score': score}
            dic_time['words'].append(data)
        # print dicTime

        global_arr_time.append(dic_time)
        i = i + 1

    # get Best Words Num
    my_voc = []
    final_arr = []
    for dt in global_arr_time:
        dic_time = dict()
        dic_time['name'] = dt['name']
        dic_time['words'] = []
        words_xt = words_num
        for wScore in dt['words']:
            if check_gram_time(wScore, dt['words']):
                dic_time['words'].append(wScore)
                my_voc.append(wScore['name'])
                words_xt = words_xt - 1
            if words_xt == 0:
                break
        final_arr.append(dic_time)

    global_dic = dict()
    global_dic['wordsXtime'] = final_arr
    global_dic['termsCount'] = terms_count_matrix(dataset, dataset_urls, my_voc)
    return global_dic


def word_clustering(dataset, conceptNum, wordsNum, datasetUrls):

    stop_set = set_stop_words(dataset)

    dic_emails = getAllArchiveText(datasetUrls)

    # create array of all emails retrieved
    arrEmails = []
    for k in dic_emails.keys():
        tupla = (k, dic_emails[k])
        arrEmails.append(tupla)

    my_corpus = []
    for elem in arrEmails:
        filtered_text = re.sub('[^0-9\'.a-zA-Z]+', ' ', elem[1])
        my_corpus.append(u'{}'.format(filtered_text))

    vectorizer = TfidfVectorizer(use_idf=True, ngram_range=(
        1, 3), min_df=0, stop_words=stop_set)
    X = vectorizer.fit_transform(my_corpus)

    # Truncate the matrix to a number of components(concepts)
    lsa = TruncatedSVD(n_components=conceptNum, n_iter=100)
    lsa.fit(X)

    all_data = list()
    terms = vectorizer.get_feature_names()
    for i, comp in enumerate(lsa.components_):
        # merge 2 lists together terms and comp
        terms_in_comp = zip(terms, comp)
        sorted_terms = sorted(terms_in_comp, key=lambda x: x[1], reverse=True)[:wordsNum*3]

        cluster = dict()
        cluster['name'] = str(sorted_terms[0][0])
        cluster['id'] = str(i)
        cluster_data = []

        words_xclus = wordsNum
        for term in sorted_terms:
            data = dict()
            data['name'] = term[0]
            data['score'] = term[1]
            if check_gram(data, sorted_terms):
                cluster_data.append(data)
                words_xclus = words_xclus - 1
            if words_xclus == 0:
                break
        cluster['children'] = cluster_data
        all_data.append(cluster)

    arr_cos_sim = []
    for i in range(0, len(arrEmails)):
        cosine_similarities = linear_kernel(
            X[i:i+1], lsa.components_).flatten()

        obj_dic = {}
        obj_dic['subject'] = arrEmails[i][0][0]
        obj_dic['time'] = arrEmails[i][0][1]
        obj_dic['cosSim'] = []
        for i in range(0, len(cosine_similarities)-1):
            obj_cos_score = {}
            obj_cos_score['cluster'] = i
            obj_cos_score['score'] = cosine_similarities[i]
            obj_dic['cosSim'].append(obj_cos_score)

        arr_cos_sim.append(obj_dic)

    returned_dic = dict()
    returned_dic['name'] = 'clusters'
    returned_dic['children'] = all_data
    returned_dic['emailsClusters'] = arr_cos_sim

    return returned_dic


def check_gram(data, sorted_terms):
    for elem in sorted_terms:
        if data['name'] in elem[0]:
            if len(elem[0]) > len(data['name']):
                if data['score'] == elem[1]:
                    return False
    return True


def check_gram_time(data, sortedTerms):
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


# When this file is called
cmdargs = str(sys.argv)
functionname = str(sys.argv[1])
# datasetUrl = 'server/data/mbox/enron/enron-smith-m.mbox'

if functionname == "bestwords":
    mboxUrls = re.split('<newurl>', sys.argv[2])
    datasetName = str(sys.argv[3])
    numWords = int(sys.argv[4])
    allText = sys.argv[5]
    global_dict = best_words(allText, numWords, datasetName)
    print(json.dumps(global_dict, ensure_ascii=False))
elif functionname == "wordsXtime":
    mboxUrls = re.split('NEWURL', sys.argv[2])
    datasetName = str(sys.argv[3])
    wordsNum = int(sys.argv[4])
    global_dict = dict()
    global_dict['name'] = 'wordsXtime'
    res = words_per_time(datasetName, wordsNum, mboxUrls)
    print(json.dumps(res, ensure_ascii=False))
elif functionname == "clusterwords":
    mboxUrls = re.split('NEWURL', sys.argv[2])
    datasetName = str(sys.argv[3])
    conceptNum = int(sys.argv[4])
    wordsNum = int(sys.argv[5])
    global_dict = word_clustering(datasetName, conceptNum, wordsNum, mboxUrls)
    print(json.dumps(global_dict, ensure_ascii=False))

elif functionname == "getStopWords":
    datasetName = str(sys.argv[2])
    arr_sw = []
    for sw in set_stop_words(datasetName):
        arr_sw.append(sw)
    global_dict = dict()
    global_dict['stopWords'] = arr_sw

    print(json.dumps(global_dict, ensure_ascii=False))


# exampleCall: python2.7 server/nlp-proc.py clusterwords server/data/mbox/enron/enron-smith-m.mbox enron 10 10
# returns : {name:'clusters',children:[{'name':clusterX,'children':childrenX}],
#           'emailsClusters':[{'subject':subjX,'time':timeX,'cosSim':[{}]}]}
