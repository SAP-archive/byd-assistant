[![REUSE status](https://api.reuse.software/badge/github.com/SAP-Samples/byd-assistant)](https://api.reuse.software/info/github.com/SAP-Samples/byd-assistant)
[![License: Apache2](https://img.shields.io/badge/License-Apache2-green.svg)](https://opensource.org/licenses/Apache-2.0)
![CI](https://github.com/SAP-Samples/byd-assistant/workflows/CI/badge.svg)
[![Open Source Love](https://firstcontributions.github.io/open-source-badges/badges/open-source-v1/open-source.svg)](https://github.com/firstcontributions/open-source-badges)

# byd-assistant [🇬🇧](https://youtu.be/tWBh9zDPaJc)[🇫🇷](https://youtu.be/NLAif0wcHuU)[🇮🇹](https://youtu.be/54JmuJ-1zeE)[🇲🇽](https://twitter.com/Ralphive/status/1316678233220317184)
_Originally forked from [B1 Assistant](https://github.com/B1SA/b1Assistant)_

A sample [Alexa Skill](https://www.amazon.co.uk/b?ie=UTF8&node=10068517031) to demonstrate the integration between Amazon Echo x SAP Business ByDesign

## Requirements
* [Install the Cloud Foundry CLI](https://developers.sap.com/tutorials/cp-cf-download-cli.html)
* [Learn the Fundamentals of SCP Cloud Foundry](https://developers.sap.com/tutorials/cp-cf-fundamentals.html)
* [Amazon developer account](https://developer.amazon.com/)


## Deployment
### STEP 1: ByD OData API
* Import [this sales orders model](https://github.com/SAP-samples/sapbydesign-api-samples/blob/master/Custom%20OData%20Services/khsalesorder.xml) in the [SAP Businesss ByDesign Odata Services](https://www.youtube.com/watch?v=z6mF_1hFths)
* Activate the models and take note of the **service URL**

### STEP 2: Deployment of the ByD Assistant Backend in the SAP Cloud Platform
* Clone/Download this repository
* From the root directory, using the [Cloud Foundry CLI](https://docs.cloudfoundry.org/cf-cli/install-go-cli.html), push your app to the SAP CP Cloud Foundry
```sh
$ cf push --random-route
```
Then set the Environment Variables according to the example:
```sh
$ cf set-env bydassistant SMB_SERVER https://my023666.sapbydesign.com
$ cf set-env bydassistant SMB_PORT ""
$ cf set-env bydassistant SMB_PATH /sap/byd/odata/cust/v1/khsalesorderdemo
$ cf set-env bydassistant SMB_AUTH bWFuYWdlcjptYW5hZ2VyMTIz
$ cf set-env bydassistant SMB_DEFAULT_BP CP100110
```
_AUTH is [Base64 Encoded](https://www.base64encode.org/) user:password*_

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
[🇮🇹](https://youtu.be/54JmuJ-1zeE)[🇲🇽](https://twitter.com/Ralphive/status/1316678233220317184)

## Support and Contributions  
This repository is provided "as-is". With no Warranty or support

We are open to contributions specially to adapt the ByD Assistatnt to other languanges. We can support all the available [Alexa Locales](https://developer.amazon.com/en-US/docs/alexa/custom-skills/develop-skills-in-multiple-languages.html). If you want to help, submit a Pull Request with a lang file and a IntentSchema of your language of choice. Please use the [Lang Template](lang/template-lang.json) and the [Intent Schema Template](skill/template-IntentSchema.json) as a starting point.
Name then accordingly to the to the respective [Local Code](https://developer.amazon.com/en-US/docs/alexa/custom-skills/develop-skills-in-multiple-languages.html#h2-code-changes) Please don't change any of the %PLACEHOLDERS%.

If you have questions, please ask.

## License
Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved. This project is licensed under the Apache Software License, version 2.0 except as noted otherwise in the [LICENSE](LICENSES/Apache-2.0.txt) file.
