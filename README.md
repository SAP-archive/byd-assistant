[![Open Source Love](https://firstcontributions.github.io/open-source-badges/badges/open-source-v1/open-source.svg)](https://github.com/firstcontributions/open-source-badges)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![CI](https://github.com/Ralphive/byDAssistant/workflows/CI/badge.svg)

# ByD Assistant 
A fork from [B1 Assistant](https://github.com/B1SA/b1Assistant) to integrate SAP Business ByDesign and Amazon Echo

## Contributions  
We are open to contributions specially to adapt the ByD Assistatnt to other languanges. We can support all the available [Alexa Locales](https://developer.amazon.com/en-US/docs/alexa/custom-skills/develop-skills-in-multiple-languages.html). If you want to help, submit a Pull Request with a lang file and a IntentSchema of your language of choice. Please use the [Lang Template](lang/template-lang.json) and the [Intent Schema Template](skill/template-IntentSchema.json) as a starting point.
Name then accordingly to the to the respective [Local Code](https://developer.amazon.com/en-US/docs/alexa/custom-skills/develop-skills-in-multiple-languages.html#h2-code-changes) Please don't change any of the %PLACEHOLDERS%.

If you have questions, please ask.


## Pre Requisites
* A free trial account on  [SAP Cloud Platform](https://cloudplatform.sap.com) with **Cloud Foundry Trial** initialized
* Install and configure the [Cloud Foundry Command Line Interface (CLI)](https://developers.sap.com/tutorials/cp-cf-download-cli.html) on your machine.

## Installation
### STEP 1: ByD OData API
* Import [this sales orders model](https://github.com/SAP-samples/sapbydesign-api-samples/blob/master/Custom%20OData%20Services/khsalesorder.xml) in the [SAP Businesss ByDesign Odata Services](https://www.youtube.com/watch?v=z6mF_1hFths)
* Activate the models and take note of the **service URL**

### STEP 2: Deployment of the ByD Assistant Backend in the SAP Cloud Platform
* Clone/Download this repository
* Update the application name in the [manifest.yml](manifest.yml)
* From the root directory, using the [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html), push your app to the SAP CP Cloud Foundry
```sh
$ cf push
```
Then set the Environment Variables accordingly
```sh
$ cf set-env <your app name> SMB_SERVER http://<your byd server>
$ cf set-env <your app name> SMB_PORT <Serverr Port>
$ cf set-env <your app name> SMB_PATH <Service URL from the model imported previously>
$ cf set-env <your app name> SMB_AUTH <[Base64 Encoded] user:password>
$ cf set-env <your app name> SMB_DEFAULT_BP <A Business Partner Code for the Sales Order>
```
For Example:
```sh
$ cf set-env bydassistant SMB_SERVER https://my023666.sapbydesign.com
$ cf set-env bydassistant SMB_PORT ""
$ cf set-env bydassistant SMB_PATH /sap/byd/odata/cust/v1/khsalesorderdemo
$ cf set-env bydassistant SMB_AUTH bWFuYWdlcjptYW5hZ2VyMTIz
$ cf set-env bydassistant SMB_DEFAULT_BP CP100110
```
Restart your application (so it can read the new environment variables)
```sh
$ cf restart bydassistant
```
You will see your backend URL (to be used in the next step)

* For details about app deployment check [Deploying a NodeJS app to SAP Cloud PLatform in this guide](https://github.com/B1SA/B1_SCP_HandsOn/blob/master/HandsOn_SCP_Instructions_v2.pdf)

### STEP 3: Configure the Alexa Skill
* Follow the steps int he [skill](skill/) folder to create your Alexa Skill and have it connected to the SAP Cloud Platform

## Test it
Now you can talk to your SAP Business By Design!
Demos: [🇬🇧](https://youtu.be/tWBh9zDPaJc)[🇫🇷](https://youtu.be/NLAif0wcHuU)
[🇮🇹](https://youtu.be/54JmuJ-1zeE) [🇲🇽](https://twitter.com/Ralphive/status/1316678233220317184?s=20)


## License
BYD Assistant prototype is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information or see https://opensource.org/licenses/MIT.
