/*
 * Copyright 2014-2017 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global glowroot, JST, angular, Glowroot, Handlebars, $ */

glowroot.controller('JvmMBeanTreeCtrl', [
  '$scope',
  '$compile',
  '$location',
  '$http',
  'httpErrors',
  'queryStrings',
  function ($scope, $compile, $location, $http, httpErrors, queryStrings) {

    $scope.$parent.heading = 'MBean tree';
    $scope.expanded = [];       // A true/false list of expanded root nodes


    if ($scope.hideMainContent()) {
      return;
    }

    Handlebars.registerPartial('mbeanNodeExpanded', JST['mbean-node-expanded']);

    Handlebars.registerPartial('mbeanNodeUnexpanded', JST['mbean-node-unexpanded']);

    Handlebars.registerHelper('mbeanNodeIndentPx', function (mbeanNode) {
      return 30 * mbeanNode.depth;
    });

    Handlebars.registerHelper('ifSimpleValue', function (value, options) {
      if (!angular.isObject(value) && !angular.isArray(value)) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('ifNull', function (value, options) {
      if (value === null) {
        return options.fn(this);
      }
      return options.inverse(this);
    });

    Handlebars.registerHelper('indentedJson', function (value) {
      return JSON.stringify(value, null, 4);
    });

    var expandedObjectNames = $location.search().expanded || [];
    if (!angular.isArray(expandedObjectNames)) {
      expandedObjectNames = [expandedObjectNames];
    }

    var nodeMap = {};

    function updateLocation() {
      var query = {};
      if ($scope.layout.central) {
        query['agent-id'] = $scope.agentId;
      }
      query.expanded = expandedObjectNames;
      $location.search(query).replace();
    }

    function renderNext(mbeanNodes, start, lastParent) {
      // large numbers of mbean nodes (e.g. 20,000) render much faster when grouped into sub-divs
      var batchSize = 500;
      var i;
      var html = '';
      if (lastParent === undefined || lastParent === null) {
          lastParent = 0;
      }

      for (i = start; i < Math.min(start + batchSize, mbeanNodes.length); i++) {
        if (mbeanNodes[i].depth === 0) {
            mbeanNodes[i].isRoot = true;
            lastParent++;
            $scope.expanded[lastParent] = false;
        }
        mbeanNodes[i].parentId = lastParent;
        html += JST['mbean-node'](mbeanNodes[i]);
      }
      $('#mbeanTree').append(html);
      if (start + 100 < mbeanNodes.length) {
        setTimeout(function () {
          renderNext(mbeanNodes, start + batchSize, lastParent);
        }, 10);
      }
    }

    $scope.setAllExpanded = function(val) {
      for (var i = 1; i < $scope.expanded.length; ++i) {
        $scope.expanded[i] = val;
      }
    };

    $scope.refresh = function (deferred) {
      var queryData = {
        agentId: $scope.agentId,
        expanded: expandedObjectNames
      };
      $http.get('backend/jvm/mbean-tree' + queryStrings.encodeObject(queryData))
          .then(function (response) {
            $scope.loaded = true;
            $scope.agentNotConnected = response.data.agentNotConnected;
            if ($scope.agentNotConnected) {
              return;
            }
            var flattened = [];
            function recurse(list, depth) {
              angular.forEach(list, function (node) {
                node.depth = depth;
                if (node.objectName) {
                  nodeMap[node.objectName] = node;
                }
                flattened.push(node);
                if (node.childNodes) {
                  recurse(node.childNodes, depth + 1);
                }
              });
            }
            recurse(response.data, 0);
            $('#mbeanTree').empty();
            $scope.expanded = [];
            renderNext(flattened, 0);
            if (deferred) {
              deferred.resolve('Refreshed');
            }
            $compile($('#mbeanTree').contents())($scope);
          }, function (response) {
            httpErrors.handle(response, $scope, deferred);
          });
    };

    function incNodeVersion(node) {
      if (node.v) {
        node.v++;
      } else {
        node.v = 1;
      }
    }

    var mousedownPageX, mousedownPageY;

    $(document).off('mousedown.mbeanTree');
    $(document).on('mousedown.mbeanTree', '.gt-mbean-expanded-content, .gt-mbean-unexpanded-content', function (e) {
      mousedownPageX = e.pageX;
      mousedownPageY = e.pageY;
    });

    $('#mbeanTree').on('click', '.gt-mbean-expanded-content', function(e, keyboard) {
      if (!keyboard && (Math.abs(e.pageX - mousedownPageX) > 5 || Math.abs(e.pageY - mousedownPageY) > 5)) {
        // not a simple single click, probably highlighting text
        return;
      }
      var $parent = $(this).parent();
      var objectName = $parent.data('object-name');
      var index = expandedObjectNames.indexOf(objectName);
      expandedObjectNames.splice(index, 1);
      updateLocation();
      var node = nodeMap[objectName];
      incNodeVersion(node);
      delete node.attributeMap;
      $parent.html(JST['mbean-node-unexpanded'](node));
    });

    $('#mbeanTree').on('click', '.gt-mbean-unexpanded-content', function(e, keyboard) {
      if (!keyboard && (Math.abs(e.pageX - mousedownPageX) > 5 || Math.abs(e.pageY - mousedownPageY) > 5)) {
        // not a simple single click, probably highlighting text
        return;
      }
      var $parent = $(this).parent();
      var objectName = $parent.data('object-name');
      expandedObjectNames.push(objectName);
      updateLocation();
      var node = nodeMap[objectName];
      incNodeVersion(node);
      var v = node.v;
      $parent.html(JST['mbean-node-loading'](node));
      var $gtSpinner = $parent.find('.gt-spinner');
      var spinner = Glowroot.showSpinner($gtSpinner);
      var queryData = {
        agentId: $scope.agentId,
        objectName: node.objectName
      };
      $http.get('backend/jvm/mbean-attribute-map' + queryStrings.encodeObject(queryData))
          .then(function (response) {
            spinner.stop();
            if (node.v !== v) {
              // interrupted by close
              return;
            }
            node.attributeMap = response.data;
            $parent.html(JST['mbean-node-expanded'](node));
            $compile($parent.contents())($scope);
          }, function (response) {
            spinner.stop();
            httpErrors.handle(response, $scope);
          });
    });

    $scope.refresh();
  }
]);
