var app = angular.module("myDashApp", ['nvd3','xeditable']);
app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});

app.controller("myDashCtrl", function($scope,$http,$interval) {
    $scope.saveData = function(key,value){
        return localStorage.setItem(key, value);
    }

    $scope.getData = function(key){
        return localStorage.getItem(key);
    }

    $scope.temp = false;
    $scope.uuids = [];
    $scope.currentUUIDIndex = 0;
    $scope.dashboard = {};
    $scope.dashboard.title = 'Pick one sensor on left list';
    $scope.dashboard.chart = (($scope.getData('dashboard.chart')) ? $scope.getData('dashboard.chart') : 'stackedAreaChart');
    $scope.dashboard.period = (($scope.getData('dashboard.period')) ? $scope.getData('dashboard.period') : 'hour');
    $scope.refresh = {};
    $scope.refresh.sensorList = false;
    $scope.refresh.sensorData = false;
    $scope.autorefresh = {};
    $scope.autorefresh.counter = 0;
    $scope.autorefresh.status = (($scope.getData('autorefresh.status')) ? $scope.getData('autorefresh.status') : 'on');
    $scope.promiseRefresh = "";    
    $scope.backend = {
      'host':'http://89.108.88.202:3000/',
    };

    

    
    var refreshData = function() {
        if($scope.autorefresh.status=='on'){
          $scope.autorefresh.counter++;
          if($scope.autorefresh.counter>=100){
            $scope.autorefresh.counter=0;
            $scope.getSensorData();
          }
        }
    };


    $scope.toggleAutorefresh = function(){
      if($scope.autorefresh.status == 'on'){
        $scope.autorefresh.status = 'off';
        $interval.cancel($scope.promiseRefresh);
        $scope.promiseRefresh = undefined;
      }else{
        $scope.autorefresh.status = 'on';
        $scope.promiseRefresh = $interval(refreshData, 1000);
      }
      $scope.saveData('autorefresh.status', $scope.autorefresh.status);
    }


    $scope.changeChartType = function(){
      var chart;
      switch($scope.dashboard.chart){
        case 'lineWithFocusChart': 
          chart = {
                type: 'lineWithFocusChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 40
                },
                transitionDuration: 500,
                xAxis: {
                    axisLabel: 'Time',
                    tickFormat: function(d){
                        d=Number(d+'000');
                        return d3.time.format('%X')(new Date(d))
                    }
                },
                x2Axis: {
                    tickFormat: function(d){
                        d=Number(d+'000');
                        return d3.time.format('%X')(new Date(d))
                    },
                },
                yAxis: {
                    axisLabel: 'Values',
                    rotateYLabel: false
                },
                y2Axis: {
                }
            }
        break;
        case 'stackedAreaChart':
          chart = {
                type: 'stackedAreaChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 40
                },
                useVoronoi: false,
                clipEdge: true,
                transitionDuration: 500,
                useInteractiveGuideline: true,
                xAxis: {
                    showMaxMin: false,
                    tickFormat: function(d) {
                        d=Number(d+'000');
                        return d3.time.format('%X')(new Date(d))
                    }
                },
                yAxis: {
                }
            }
        break;
        case 'multiBarChart':
          chart = {
                type: 'multiBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 40
                },
                useVoronoi: false,
                clipEdge: false,
                transitionDuration: 500,
                useInteractiveGuideline: true,
                xAxis: {
                    showMaxMin: false,
                    tickFormat: function(d) {
                        d=Number(d+'000');
                        return d3.time.format('%X')(new Date(d))
                    }
                },
                yAxis: {
                }
            }
        break;
      }
      $scope.options = {
            chart: chart
      };
    }


    $scope.chartInit = function(data){
      $scope.data = data.items;
    }

    $scope.updateDashboardTitle = function(name,title){
      $scope.dashboard.title = name+' '+title;
    }

    $scope.changeDashboardChart = function(type){
      $scope.setRefresh('sensorData',true);
      $scope.dashboard.chart = type;
      //$scope.getSensorData();
      $scope.changeChartType();
      $scope.saveData('dashboard.chart',$scope.dashboard.chart.toString());
      $scope.setRefresh('sensorData',false);
    }

    $scope.changeDashboardPeriod = function(period){
      $scope.dashboard.period = period;
      $scope.getSensorData();
      $scope.saveData('dashboard.period',$scope.dashboard.period.toString());
    }


    $scope.chooseSensor = function(index){
      $scope.currentUUIDIndex = Number(index);
      $scope.getSensorData();
    }

    $scope.setRefresh = function(name,value){
      $scope.refresh[name] = value;
    }

    $scope.getSensorList = function() {
      $scope.setRefresh('sensorList',true);
      $http({
          method: 'GET',
          url: $scope.backend.host+'data/'
      }).
      success(function(data, status, headers, config) {
        // console.log('data:',data,'\nstatus:',status,'\nheaders',headers,'\nconfig',config);
        $scope.uuids = data.items;
        $scope.setRefresh('sensorList',false);
        $scope.getSensorData();

      }).
      error(function(data, status, headers, config) {
        // console.log('data:',data,'\nstatus:',status,'\nheaders',headers,'\nconfig',config)
        alert('unexpected error');
      });

    };




    $scope.getSensorData = function(){
      $scope.setRefresh('sensorData',true);
      var uuid = $scope.uuids[$scope.currentUUIDIndex].uuid,
          date = $scope.uuids[$scope.currentUUIDIndex].date,
          name = $scope.uuids[$scope.currentUUIDIndex].name,
          hour = ($scope.uuids[$scope.currentUUIDIndex].time).split(":")[0],
          period = $scope.dashboard.period,
          dataurl = '',
          now = '',
          lzHours = '';

      switch(period){
        case 'day':
          $scope.updateDashboardTitle(name || uuid, 'daily graph');
          dataurl = $scope.backend.host+'data/'+uuid+'/'+date;
        break;
        case 'hour':
          $scope.updateDashboardTitle(name || uuid, 'hour graph');
          now = new Date;
          lzHours = "00".substr(hour.length) + hour.toString();
          dataurl = $scope.backend.host+'data/'+uuid+'/'+date+'/'+lzHours;
        break;
      }

      $http({
          method: 'GET',
          url: dataurl
      }).
      success(function(data, status, headers, config) {
        // console.log('data:',data,'\nstatus:',status,'\nheaders',headers,'\nconfig',config);
        
        $scope.chartInit(data);
        $scope.setRefresh('sensorData',false);
      }).
      error(function(data, status, headers, config) {
        // console.log('data:',data,'\nstatus:',status,'\nheaders',headers,'\nconfig',config)
        alert('unexpected error');
      });
    }



    $scope.setUUIDName = function(name){
        var uuid = $scope.uuids[$scope.currentUUIDIndex].uuid;
        $http({
            method: 'POST',
            url: $scope.backend.host+'data/'+uuid+'/name',
            data: "name="+name,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).
        success(function(data, status, headers, config) {
          // console.log('data:',data,'\nstatus:',status,'\nheaders',headers,'\nconfig',config);
          return true;
        }).
        error(function(data, status, headers, config) {
          // console.log('data:',data,'\nstatus:',status,'\nheaders',headers,'\nconfig',config)
          alert('unexpected error');
        });
    };
    
    $scope.plural = function (tab){
      return tab.length > 1 ? 's': ''; 
    };

    $scope.getSensorList();
    $scope.changeChartType();
    
});
