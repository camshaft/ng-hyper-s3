/**
 * Module dependencies
 */

var s3 = require('s3');
var base = require('baseuri');
var hashfile = require('hash-file');

var name = 'ng-hyper-s3';

var pkg = module.exports = window.angular.module(name, []);

pkg.name = name;

pkg.directive('hyperS3', [
  function() {
    return {
      restrict: 'A',
      link: function($scope, elem, attrs) {
        var input;

        $scope.$watch(attrs.hyperUpload, function(inpt) {
          input = inpt;
        });

        elem.bind('change', function() {
          var el = elem[0];
          if (!input || (!el.value && !el.files[0])) return;

          $scope.$emit('hyper-s3-begin');
          var success = attrs.hyperUploadSuccess || '/api';

          var redirect = success.charAt(0) === '/' ?
                base().replace(/\/$/, '') + success :
                success;

          hashfile(el.files[0], function(err, hash) {
            var config = {
              redirect: redirect,
              format: format(hash)
            };

            s3(el, config, input.config).end(done);
          });
        });

        function done(err, url) {
          if (err) {
            $scope.hyperS3Error = err;
          } else {
            input.$model = url.replace(/\s/gi, '+');
          }

          $scope.$emit('hyper-s3-end');
          $scope.$digest();
        }
      }
    };
  }
]);

function format(hash) {
  return function(prefix, name) {
    return prefix + '-' + hash + '-' + name;
  }
}
