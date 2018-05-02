# ByD Assistant

A fork from [B1 Assistant](https://github.com/B1SA/b1Assistant) to integrate SAP Business by Design and Amazon Echo

## Pre Requisites
* A free trial account on  [SAP Cloud Platform](https://cloudplatform.sap.com) with **Cloud Foundry Trial** initialized
* Install and configure the [Cloud Foundry Command Line Interface (CLI)](https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/75125ef1e60e490e91eb58fe48c0f9e7.html#loio4ef907afb1254e8286882a2bdef0edf4) on your machine.

## Installation
### STEP 1: ByD OData API
* Import the all the available [models](models/) in the [SAP Businesss ByDesign Odata Services](https://www.youtube.com/watch?v=z6mF_1hFths)
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
* [Now you can talk to your SAP Business By Design](https://www.youtube.com/edit?o=U&video_id=tWBh9zDPaJc)


## License
BYD Assistant prototype is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information or see https://opensource.org/licenses/MIT.