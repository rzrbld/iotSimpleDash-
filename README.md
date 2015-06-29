# iot Simple Dashboard
This is a AngularJS powered dashboard, Node.js and Sqlite3 based backend and Arduino project. Kind a AIO package, but all components: backend, frontend and arduino part you may use independently of each other.

###TO DO
* more readme
* REST API WADL or full docs

### Demo
WEB GUI (frontent) available at: http://dash.rzrbld.ru/
JSON REST API can be obtained at: http://rzrbld.ru:3000/data/


### Interaction scheme
{sensors} > {arduino} > REST API (JSON) > {backend} < REST API (JSON) > {frontend}

### Current version - 0.5

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
      'host':'http://89.108.88.202:3000/',
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
restapi.listen(3000);
.....
# done
```

###License: MIT
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