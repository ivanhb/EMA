# emailAnalytics

A visual web-based framework meant for Email data analysis in digital and forensic investigation.
The image legendOnion.png shows the general Framework architecture. Each different analysis will be contained in a unique folder inside the static/ folder. This architecture is meant to be flexible for updates and additional integration of new components and data analysis.

## Requirements:
1. Python-2.7: you can download and install it from (https://www.python.org/) 
2. Python libraries needed:
```
    - pip install simplejson 
    - pip install regex
    - pip install numpy
    - pip install scikit-learn
    - pip install MySQL-python
    - pip install nltk
    - pip install mailbox
```
    
## Setting up the system:
1. unzip vis.zip inside static/
2. unzip semantic.zip inside static/
3. move all the directory of the project into your local web server directory 
4. open your browser and type (http://localhost/emailAnalytics/index.html)

## Framework structure :
The framework architecture is represented in an onion form with different layers. The idea is to make each component and layer independent. This will make the framework more flexible for modifications or improvements to each individual part of it, as well as for the integration of new analysis. 

For example static/sna directory contains the Social Network Analysis component. Each layer of SNA is a different .js file: analysis, filtering and visualization. In addition we have a controller.js file which is the manager and the the main handler to call the procedures of SNA.
