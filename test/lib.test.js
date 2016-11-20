var request = require('mocha-ui-exports-request');
var e2e     = require('./util/e2e');

var sut = require('../')

module.exports = { 
  "swagger-params-alias" : { 
    "should be a factory function that names 2 arguments - fittingDef, bagpipes" : function() {
        Should(sut)
          .be.a.Function()
          .have.property("length", 2)
    },
    "calling it returns a pipe strategy function that names 2 arguments - ctx and next" : function() { 
        Should(sut({}, {config:{swaggerNodeRunner:{api:{getOperations:function(){return []}}}}}))
          .be.a.Function()
          .have.property("length", 2)
    },
    "when named as fitting in a swagger pipe" : {
      beforeAll: e2e({
        svc:          "test/fixtures/my-svc/app.js",
        logPath:      "./e2e-hello.log"
      }),
      afterAll: e2e.tearDown,
      "and used with an open-api spec with no x-alias attributes" : request({
          url: "http://localhost:10010/no-alias?name=scott"
      }).responds({
          status: 200, 
          body: JSON.stringify("Hello, scott!")
      }),
      "and used with an open-api spec with x-alias attributes, then" : {
        "requests that name the original parameter name" : request({
            url: "http://localhost:10010/has-alias?name=scott"
        }).responds({
            status: 200, 
            body: JSON.stringify("Hello, scott!")
        }),
        "requests that name the alias parameter name" : request({
            url: "http://localhost:10010/has-alias?n=scott"
        }).responds({
            status: 200, 
            body: JSON.stringify("Hello, scott!")
        }),
        "requests that provide value to both alias and original parameter name" : {
          "should use the value of the original name - i.e request" : request({
              url: "http://localhost:10010/has-alias?name=scott&n=joe"
          }).responds({
              status: 200, 
              body: JSON.stringify("Hello, scott!")
          })
        },
        "requests that do not provide both alias nor original name" : {
          "should be rejected, i.e - request" : request({
              url: "http://localhost:10010/has-alias?na=scott"
          }).responds({
              status: 400
          })
        }
      }
    }
  }
}