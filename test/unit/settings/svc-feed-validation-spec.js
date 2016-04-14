/*jshint expr:true */
"use strict";

describe("Feed Validator", function () {
  var $httpBackend, feedValidator;

  beforeEach(module("risevision.widget.rss.settings", function ($provide) {
    // need to mock xmlToJSON, it uses DOMParser
    $provide.value("$window", {
      xmlToJSON: {
        parseString: function (xmlString) {
          if (xmlString.indexOf("http://test.com/valid") !== -1) {
            return validFeedJSON;
          }
          else if (xmlString.indexOf("http://test.com/invalid") !== -1) {
            return invalidFeedJSON;
          }
        }
      }
    });
  }));

  beforeEach(inject(function($injector) {
    $httpBackend = $injector.get("$httpBackend");

    $httpBackend.when("GET", "https://proxy.risevision.com/https://validator.w3.org/feed/check.cgi?url=http://test.com/valid&output=soap12")
      .respond(validFeedResponse);

    $httpBackend.when("GET", "https://proxy.risevision.com/https://validator.w3.org/feed/check.cgi?url=http://test.com/invalid&output=soap12")
      .respond(invalidFeedResponse);

    $httpBackend.when("GET", "https://feed-parser.risevision.com/http://test.com/unauthorized")
      .respond({ "Error": "401 Unauthorized" });

    $httpBackend.when("GET", "https://feed-parser.risevision.com/http://test.com/authorized")
      .respond("Feed data");

    $httpBackend.when("GET", "https://feed-parser.risevision.com/http://test.com/error")
      .respond(401, "");
  }));


  beforeEach(inject(function(_feedValidator_) {
    feedValidator = _feedValidator_;
  }));

  describe("feedValidator", function() {
    it("should exist", function() {
      expect(feedValidator).to.be.defined;
    });
  });

  describe("isValid", function() {
    it("should exist", function() {
      expect(feedValidator.isValid).be.defined;
      expect(feedValidator.isValid).to.be.a("function");
    });

    it("should return a value of true when feed is deemed W3C valid", function (done) {
      feedValidator.isValid("http://test.com/valid").then(function (value) {
        expect(value).to.be.true;
        done();
      });

      $httpBackend.flush();
    });

    it("should return a value of false when feed is deemed W3C invalid", function (done) {
      feedValidator.isValid("http://test.com/invalid").then(function (value) {
        expect(value).to.be.false;
        done();
      });

      $httpBackend.flush();

    });

  });

  describe("requiresAuthentication", function() {
    it("should exist", function() {
      expect(feedValidator.requiresAuthentication).be.defined;
      expect(feedValidator.requiresAuthentication).to.be.a("function");
    });

    it("should return a value of true when feed requires authentication", function (done) {
      feedValidator.requiresAuthentication("http://test.com/unauthorized").then(function (value) {
        expect(value).to.be.true;
        done();
      });

      $httpBackend.flush();
    });

    it("should return a value of false when feed does not require authentication", function (done) {
      feedValidator.requiresAuthentication("http://test.com/authorized").then(function (value) {
        expect(value).to.be.false;
        done();
      });

      $httpBackend.flush();
    });

    it("should return a value of false if authentication check fails", function (done) {
      feedValidator.requiresAuthentication("http://test.com/error").then(function (value) {
        expect(value).to.be.false;
        done();
      });

      $httpBackend.flush();
    });
  });

});
