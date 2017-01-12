# iot Simple Dashboard
This is a AngularJS powered dashboard, Node.js and Sqlite3 based backend and Arduino project. Kind a AIO package, but all components: backend, frontend and arduino part you may use independently of each other.


### Demo
* WEB GUI (frontend) available at: http://dash.rzrbld.ru/
* JSON REST API (backend) can be obtained at: http://rzrbld.ru:4000/data/


### Contact
[razblade@gmail.com]


### Interaction scheme
{sensors} > {arduino} > REST API (JSON) > {backend} < REST API (JSON) > {frontend}

### Current version - 0.52
* added time and date filteres
* new alert block
* backend speedups on day view
* fix autorefresh

### Frontend requirements
* [AngularJS]
* [Twitter Bootstrap] css part
* [Angular-nvd3]
* [Angular-xeditable]
* [nvd3]
* [Font-Awesome]
* [d3]
* [bower] or another package manager
* [nginx] or anoter web server

#### not using depends:
* [jQuery]
* [Twitter Bootstrap] js part

### Backend requirements
* [node.js]
* [Express]
* [sqlite3]
* [body-parser]
* [forever] not required, but needed if you wish to run API as service

### arduino "requirements"
* [arduino] uno r3 or clone
* esp8266 as WiFi shield
* DHT 11\22, photoresistor, 1602 LCD

### Frontend Installation

```sh
$ cd Frontent # (or you name it folder)
# install depends
$ bower install angularjs bootstrap angular-nvd3 font-awesome angular-xeditable
# if you got your onw backend, change IP:PORT in main.js
$ vim assets/js/main.js
.....
    $scope.backend = {
      'host':'http://176.58.108.193:4000/',
    };
.....
# done
```

### Backend Installation

```sh
$ cd Backend # (or you name it folder)
# install depends
$ npm install express sqlite3 body-parser
# to change default IP:PORT
$ vim restApiDashboard.js
.....
restapi.listen(4000);
.....
# done
```

###License: MIT

The MIT License (MIT)
Copyright (c) 2012,2013,2014,2015
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.



[node.js]:http://nodejs.org
[Twitter Bootstrap]:http://twitter.github.com/bootstrap/
[express]:http://expressjs.com
[AngularJS]:http://angularjs.org
[Angular-nvd3]:http://krispo.github.io/angular-nvd3/
[Angular-xeditable]:http://vitalets.github.io/angular-xeditable/
[nvd3]:http://nvd3.org/
[Font-Awesome]:http://fortawesome.github.io/Font-Awesome/
[d3]:https://github.com/mbostock/d3
[jQuery]:https://jquery.com
[body-parser]:https://github.com/expressjs/body-parser
[arduino]:https://www.arduino.cc/
[forever]:https://github.com/foreverjs/forever
[bower]:http://bower.io/
[nginx]:http://nginx.org/
[sqlite3]:http://github.com/mapbox/node-sqlite3
[razblade@gmail.com]:mailto:razblade@gmail.com
