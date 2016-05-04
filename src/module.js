"use strict";

;(function(module)
{
  module.service('GreetingService', [function()
  {
      var model = this;
      model.sayHello = sayHello;

      function sayHello()
      {
          return "hello there!";
      }

  }]);
}(angular.module('ngModule',[])))
