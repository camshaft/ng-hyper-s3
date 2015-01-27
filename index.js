/**
 * Module dependencies
 */

var S3 = require('s3');
var base = require('baseuri');
var hashfile = require('hash-file');

var name = 'ng-hyper-s3';

var pkg = module.exports = window.angular.module(name, []);

pkg.name = name;

pkg.directive('hyperS3', [
  'hyper',
  function(hyper) {
    return {
      restrict: 'A',
      link: function($scope, elem, attrs) {
        var input, s3Conf;
        var path = attrs.hyperUpload || attrs.hyperS3;

        hyper.get(path + '.s3', $scope, function(val) {
          s3Conf = val;
        });

        hyper.get(path, $scope, function(val) {
          input = val;
        });

        elem.bind('change', function() {
          var el = elem[0];
          if (!input || (!el.value && !el.files[0])) return;
          $scope.$eval(attrs.hyperS3Begin);
          $scope.$emit('hyper-s3-begin');

          hashfile(el.files[0], function(err, hash) {
            var config = {
              format: format(hash)
            };

            if (attrs.hyperS3Success) {
              config.redirect = attrs.hyperS3Success.charAt(0) === '/' ?
                base().replace(/\/$/, '') + attrs.hyperS3Success :
                attrs.hyperS3Success;
            }

            S3(el, config, s3Conf || input.config || input.s3).end(done);
          });
        });

        function done(err, url) {
          if (err) {
            $scope.hyperS3Error = err;
          } else {
            input.$model = url.replace(/\s/gi, '+');
          }
          $scope.$digest();
          $scope.$eval(attrs.hyperS3End);
          $scope.$emit('hyper-s3-end');
        }
      }
    };
  }
]);

function format(hash) {
  var sub = '/' + hash.substr(0, 2) + '/' + hash.substr(2);
  return function(prefix, name) {
    return prefix + sub + '/' + name;
  }
}
