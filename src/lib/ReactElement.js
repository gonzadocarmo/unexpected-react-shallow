var React = require('react');
var Diff = require('./diff');
var Element = require('./element');
var Equality = require('./equality');
var Write = require('./write');
var UnexpectedHtmlLike = require('unexpected-htmllike');
var JsxHtmlLikeAdapter = require('unexpected-htmllike-jsx-adapter');


var jsxAdapter = JsxHtmlLikeAdapter.create();

var jsxHtmlLike = new UnexpectedHtmlLike(jsxAdapter);

exports.addTypeTo = function (expect) {
    expect.addType({
        name: 'ReactElement',

        identify: function (value) {
            return React.isValidElement(value) ||
                (typeof value === 'object' &&
                 value !== null &&
                 (typeof value.type === 'function' || typeof value.type === 'string') &&
                 value.hasOwnProperty('props') &&
                 value.hasOwnProperty('ref') &&
                 value.hasOwnProperty('key'));
        },

        inspect: function (value, depth, output, inspect) {

            return jsxHtmlLike.inspect(value, depth, output, inspect);
        },

        diff: function (actual, expected, output, diff, inspect, equal) {
            return Diff.diffElements(actual, expected, output, diff, inspect, equal, { exactly: true });
        },

        equal: function (a, b, equal) {
            return Equality.elementsMatch(a, b, equal, { exactly: true });
        }
    });
};
