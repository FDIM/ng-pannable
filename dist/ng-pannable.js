(function (module) {
  "use strict";

  module.run(['pannableService', function (pannableService) {
    var body = document.body || document.documentElement;
    body.addEventListener('click', handleClick, true);

    function handleClick(e) {
      if (pannableService.cancelSubsequentClick) {
        e.preventDefault();
        pannableService.cancelSubsequentClick = false;
        return false;
      }
    }
  }]);

  module.service('pannableService', function () {
    this.cancelSubsequentClick = false;
  });

  module.directive('pannable', ['pannableService', function (pannableService) {
    return {
      link: link
    };
    function link($scope, element, attr) {
      // table size is ok
      var vertical = false;
      var horizonal = false;

      var cancelDelay = 300;
      var cancelDelta = 10;
      var cancelTimeout;

      var panning = false;
      var lastPos = { x: 0, y: 0 };
      var currentPos = { x: 0, y: 0 };
      var panOffset = { x: 0, y: 0 };

      var animatonFrameId;
      var touching = false;
      var grabCursor = 'all-scroll';
      var grabbingCursor = 'all-scroll';
      var doc = angular.element(document);
      var pannableValidate = attr.pannableValidate;
      var body = angular.element(document.body || document.documentElement);
      attr.$observe(attr.pannable, watcher);
      watcher(attr.pannable);

      if (/firefox/i.test(navigator.userAgent)) {
        grabCursor = '-moz-grab';
        grabbingCursor = '-moz-grabbing';
      } else if (/chrome/i.test(navigator.userAgent)) {
        grabCursor = '-webkit-grab';
        grabbingCursor = '-webkit-grabbing';
      }


      function watcher(value) {
        if ($scope.$eval(value) !== false) {
          bind();
        } else {
          unbind();
        }
      }

      function bind() {
        element.on('mouseenter', mouseEnter);
        element.on('touchstart', touchStart);
      }

      function unbind() {
        element.off('mouseenter', mouseEnter);
        element.off('mousedown', mouseDown);
        element.off('touchend touchcancel', touchEnd);
      }

      function touchStart() {
        touching = true;
        element.on('touchend touchcancel', touchEnd);
      }

      function touchEnd() {
        touching = false;
        element.off('touchend touchcancel', touchEnd);
      }
      function mouseEnter(e) {
        if (touching) {
          return;
        }
        horizonal = true;
        vertical = true;
        if (element.prop('offsetWidth') >= element.prop('scrollWidth')) {
          horizonal = false;
        }
        if (element.prop('offsetHeight') >= element.prop('scrollHeight')) {
          vertical = false;
        }
        if (vertical || horizonal) {
          element.css({ cursor: panning ? grabbingCursor : grabCursor });
          element.on('mousedown', mouseDown);
          element.on('mouseleave', mouseLeave);
        } else {
          element.css({ cursor: '' });
        }
      }

      function mouseLeave(e) {
        element.off('mousedown', mouseDown);
      }

      function mouseDown(e) {
        if (touching) {
          return;
        }
        if (e.which != 1 && e.which != 2) {
          return;
        }
        panOffset.x = panOffset.y = 0;


        if (!pannableValidate || $scope.$eval(pannableValidate, { $event: e, $target: angular.element(e.target) })) {
          cancelTimeout = setTimeout(mouseUp, cancelDelay);
          body.addClass('no-select');

          element.css({ cursor: grabbingCursor });
          panning = true;
          lastPos.x = e.pageX;
          lastPos.y = e.pageY;
          animatonFrameId = window.requestAnimationFrame(updatePan);

          doc.on('mouseup', mouseUp).on('mousemove', mouseMove);
        }
      }

      function mouseUp(e) {
        body.removeClass('no-select');
        element.css({ cursor: grabCursor });
        panning = false;
        doc.off('mouseup', mouseUp).off('mousemove', mouseMove);
        window.cancelAnimationFrame(animatonFrameId);
      }

      function mouseMove(e) {
        if (!panning) {
          return;
        }

        currentPos.x += lastPos.x - e.pageX;
        currentPos.y += lastPos.y - e.pageY;
        panOffset.x += lastPos.x - e.pageX;
        panOffset.y += lastPos.y - e.pageY;

        lastPos.x = e.pageX;
        lastPos.y = e.pageY;

        if (cancelTimeout && (Math.abs(panOffset.x) > cancelDelta || Math.abs(panOffset.y) > cancelDelta)) {
          clearTimeout(cancelTimeout);
          cancelTimeout = undefined;
          pannableService.cancelSubsequentClick = true;
        }
      }

      function updatePan() {
        if (!panning) {
          return;
        }
        if (vertical) {
          element.prop('scrollTop', element.prop('scrollTop') + currentPos.y);
        }
        if (horizonal) {
          element.prop('scrollLeft', element.prop('scrollLeft') + currentPos.x);
        }
        currentPos.x = 0;
        currentPos.y = 0;
        animatonFrameId = window.requestAnimationFrame(updatePan);
      }
    }
  }]);
} (angular.module('ngPannable', [])))
