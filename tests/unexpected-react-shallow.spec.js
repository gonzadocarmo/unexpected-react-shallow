var Unexpected = require('unexpected');
var UnexpectedReactShallow = require('../src/unexpected-react-shallow');
var React = require('react/addons');

var expect = Unexpected.clone();

var ES5Component = React.createClass({
    displayName: 'ES5Component',
    render() { return null;}
});

function createNoNameComponent() {
    return React.createClass({
        displayName: '',
        render() { return null;}
    });
}

var NoNameComponent = createNoNameComponent();

class ClassComponent extends React.Component {
    render() {
        return (
            <div className="class-component">
                {this.props.content}
            </div>
        );
    }
}

class MyDiv extends React.Component {
    render() {
        return React.createElement('div', this.props);
    }
}

const FunctionComp = function (props) {
    return (<div {...props} />);
};

const versionParts = React.version.split('.');
const isReact014 = (parseFloat(versionParts[0] + '.' + versionParts[1]) >= 0.14);

describe('unexpected-react-shallow', () => {

    var testExpect;
    var renderer, renderer2;

    beforeEach(function () {
        renderer = React.addons.TestUtils.createRenderer();
        renderer2 = React.addons.TestUtils.createRenderer();

        testExpect = Unexpected.clone()
            .installPlugin(UnexpectedReactShallow);
    });

    it('identifies a ReactElement', () => {

        renderer.render(<MyDiv />);
        var element = renderer.getRenderOutput();

        testExpect(element, 'to be a', 'ReactElement');
    });

    if (isReact014) {
        it('identifies a pure function component', () => {

            renderer.render(<FunctionComp />);
            var element = renderer.getRenderOutput();

            testExpect(element, 'to be a', 'ReactElement');
        });
    }

    it('identifies a ShallowRenderer', () => {

        testExpect(renderer, 'to be a', 'ReactShallowRenderer');
    });

    describe('inspect', () => {

        it('outputs a tag element with no props', () => {

            renderer.render(<MyDiv />);
            expect(() => testExpect(renderer, 'to equal', ''), 'to throw',
                "expected <div /> to equal ''");
        });

        it('outputs a tag element with string  props', () => {

            renderer.render(<MyDiv className="test"/>);
            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected <div className="test" /> to equal 1');
        });

        it('outputs a tag element with number props', () => {

            renderer.render(<MyDiv id={42} />);
            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected <div id={42} /> to equal 1');
        });

        it('outputs a tag element with boolean props', () => {

            renderer.render(<MyDiv disabled={true} />);
            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected <div disabled={true} /> to equal 1');
        });

        it('outputs a tag element with null props', () => {

            renderer.render(<MyDiv className={null} />);
            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected <div className={null} /> to equal 1');
        });

        it('outputs a tag element with an undefined prop', () => {

            renderer.render(<MyDiv className={undefined} />);
            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected <div className={undefined} /> to equal 1');
        });

        it('outputs a tag element with an object prop', () => {

            var obj = { some: 'prop' };
            renderer.render(<MyDiv className={obj} />);
            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected <div className={...} /> to equal 1');
        });

        it('outputs a tag element with an function prop', () => {

            var fn = function (a, b) { return a + b; };
            renderer.render(<MyDiv onClick={fn} />);
            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected <div onClick={ function(){...} } /> to equal 1');
        });

        it('outputs a tag with a single string child', () => {

            renderer.render(<MyDiv className="test">some content</MyDiv>);
            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected\n' +
                '<div className="test">\n' +
                '  some content\n' +
                '</div>\n' +
                'to equal 1');
        });

        it('outputs an ES5 createClass component props and no children', () => {

            renderer.render(<MyDiv><ES5Component className="test">some content</ES5Component></MyDiv>);

            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ES5Component className="test">\n' +
                '    some content\n' +
                '  </ES5Component>\n' +
                '</div>\n' +
                'to equal 1');
        });

        it('outputs an ES5 class component props and children', () => {

            renderer.render(<MyDiv><ClassComponent className="test">some content</ClassComponent></MyDiv>);

            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent className="test">\n' +
                '    some content\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to equal 1');
        });

        it('outputs a set of deep nested components', () => {

            renderer.render(
                <MyDiv>
                    <ClassComponent className="test">
                        <ClassComponent some={1} more={true} props="yeah">
                          some content
                        </ClassComponent>
                        <ClassComponent some={1} more={true} props="yeah">
                          some different content
                        </ClassComponent>
                    </ClassComponent>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to equal', 1), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent className="test">\n' +
                '    <ClassComponent some={1} more={true} props="yeah">\n' +
                '      some content\n' +
                '    </ClassComponent>\n' +
                '    <ClassComponent some={1} more={true} props="yeah">\n' +
                '      some different content\n' +
                '    </ClassComponent>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to equal 1');
        });

        it('outputs a directly created custom ReactElement', function () {

            expect(() => testExpect(<ClassComponent className="foo" />, 'to equal', 1),
                'to throw', 'expected <ClassComponent className="foo" /> to equal 1');
        });

        it('outputs a directly created native ReactElement', function () {

            expect(() => testExpect(<MyDiv className="foo" />, 'to equal', 1),
                'to throw', 'expected <MyDiv className="foo" /> to equal 1');
        });

        it('outputs a directly created inline element (React 0.14)', function () {

            var inlineElement = {
                type: 'div',
                props: {
                    className: 'foo'
                },
                key: null,
                ref: null
            };

            expect(() => testExpect(inlineElement, 'to equal', 1), 'to throw',
            'expected <div className="foo" /> to equal 1');
        });

        /* This test is disabled. There's something with the way babel(possibly) is
         * converting the NoNameComponent - the name is coming out as 'Constructor'
         * Wallaby.js runs it fine (although wallaby.js has other issues with displayNames not appearing
         * via the babel transform for createClass, and only appearing if displayName is explicitely set.
         *
        it('outputs a component with no-display-name', function () {

            expect(() => testExpect(<NoNameComponent className="foo" />, 'to equal', 1), 'to throw',
                'expected <no-display-name className="foo" /> to equal 1');
        });
         */
    });

    describe('diff', () => {

        it('diffs within simple text content inside native element', () => {

            renderer.render(<MyDiv>Some simple content</MyDiv>);
            var expected = <div>Different content</div>;
            // testExpect(renderer, 'to have rendered', expected);

            expect(() => testExpect(renderer, 'to have rendered', expected), 'to throw',
             'expected\n' +
             '<div>\n' +
             '  Some simple content\n' +
             '</div>\n' +
             'to have rendered\n' +
             '<div>\n' +
             '  Different content\n' +
             '</div>\n' +
             '\n' +
             '<div>\n'+
             '  -Some simple content\n' +
             '  +Different content\n' +
             '</div>'
            );

        });

        it('shows changed props within a simple native element', () => {

            renderer.render(<MyDiv className="actual">Some simple content</MyDiv>);

            expect(() => testExpect(renderer, 'to have rendered',
                <div className="expected">
                    Some simple content
                </div>), 'to throw',
                'expected\n' +
                '<div className="actual">\n' +
	            '  Some simple content\n' +
                '</div>\n' +
                'to have rendered\n' +
	            '<div className="expected">\n' +
	            '  Some simple content\n' +
	            '</div>\n' +
                '\n' +
	            '<div className="actual" // -actual\n' +
                '                        // +expected\n' +
                '>\n' +
                '   Some simple content\n' +
                '</div>');
        });

        it('shows missing props within a simple native element', () => {

            renderer.render(<MyDiv>Some simple content</MyDiv>);

            expect(() => testExpect(renderer, 'to have rendered',
                    <div className="expected" id="123">
                        Some simple content
                    </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  Some simple content\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div className="expected" id="123">\n' +
                '  Some simple content\n' +
                '</div>\n' +
                '\n' +
                '<div // missing className="expected"\n' +
                '     // missing id="123"\n' +
                '>\n' +
                '   Some simple content\n' +
                '</div>');
        });

        it('ignores extra props within a simple native element', () => {

            renderer.render(<MyDiv id="123" className="extra">Some simple content</MyDiv>);

            testExpect(renderer, 'to have rendered',
                    <div id="123">
                        Some simple content
                    </div>);
        });

        it('does not ignore extra props when using `exactly`', function () {

            renderer.render(<MyDiv id="123" className="extra">Some simple content</MyDiv>);
            expect(() => {
                testExpect(renderer, 'to have exactly rendered',
                    <div id="123">
                        Some simple content
                    </div>);
            }, 'to throw',
                'expected\n' +
                '<div id="123" className="extra">\n' +
                '  Some simple content\n' +
                '</div>\n' +
                'to have exactly rendered\n' +
                '<div id="123">\n' +
                '  Some simple content\n' +
                '</div>\n' +
                '\n' +
                '<div id="123" className="extra" // should be removed\n' +
                '>\n' +
                '   Some simple content\n' +
                '</div>');
        });

        it('matches props on a custom component', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo">
                        <span className="bar">foo</span>
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent className="foo" test={true}>
                        <span className="bar">foo</span>
                    </ClassComponent>
                </div>);
        });

        it('matches content rendered as a number', function () {

            renderer.render(<ClassComponent content={0} />);
            testExpect(renderer, 'to have rendered', <div className="class-component">0</div>);
        });

        it('matches content as undefined', function () {

            renderer.render(<ClassComponent content={undefined} />);
            testExpect(renderer, 'to have rendered', <div className="class-component"></div>);
        });

        it('matches content as null', function () {

            renderer.render(<ClassComponent content={null} />);
            testExpect(renderer, 'to have rendered', <div className="class-component"></div>);
        });

        it('highlights diffs on a nested custom component', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo">
                        <span className="bar">foo</span>
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent className="foo" test={false}>
                        <span className="bar">foo</span>
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo">\n' +
                '    <span className="bar">\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have exactly rendered\n' +
                '<div>\n' +
                '  <ClassComponent className="foo" test={false}>\n' +
                '    <span className="bar">\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent test={true} // should equal false\n' +
                '                  className="foo">\n' +
                '    <span className="bar">\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>');

        });


        it('ignores extra props on a nested custom component when not using `exactly`', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo" extraProp="boo!">
                        <span className="bar">foo</span>
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                    <div>
                        <ClassComponent className="foo" test={true}>
                            <span className="bar">foo</span>
                        </ClassComponent>
                    </div>);

        });

        it('highlights extra props on a nested custom component when using `exactly`', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo" extraProp="boo!">
                        <span className="bar">foo</span>
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent className="foo" test={true}>
                        <span className="bar">foo</span>
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo" extraProp="boo!">\n' +
                '    <span className="bar">\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have exactly rendered\n' +
                '<div>\n' +
                '  <ClassComponent className="foo" test={true}>\n' +
                '    <span className="bar">\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo" extraProp="boo!" // should be removed\n' +
                '  >\n' +
                '    <span className="bar">\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>');


        });

        it('matches array of children in a custom component', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo">
                        <span className="one">1</span>
                        <span className="two">2</span>
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent className="foo" test={true}>
                        <span className="one">1</span>
                        <span className="two">2</span>
                    </ClassComponent>
                </div>);
        });

        it('highlights a removed item in an array of children in a custom component', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo">
                        <span className="one">1</span>
                        <span className="three">3</span>
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent className="foo" test={true}>
                        <span className="one">1</span>
                        <span className="two">2</span>
                        <span className="three">3</span>
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo">\n' +
                '    <span className="one">\n' +
                '      1\n' +
                '    </span>\n' +
                '    <span className="three">\n' +
                '      3\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have exactly rendered\n' +
                '<div>\n' +
                '  <ClassComponent className="foo" test={true}>\n' +
                '    <span className="one">\n' +
                '      1\n' +
                '    </span>\n' +
                '    <span className="two">\n' +
                '      2\n' +
                '    </span>\n' +
                '    <span className="three">\n' +
                '      3\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo">\n' +
                '    <span className="one">\n' +
                '      1\n' +
                '    </span>\n' +
                '    <span className="three" // -three\n' +
                '                            // +two\n' +
                '    >\n' +
                '      -3\n' +
                '      +2\n' +
                '    </span>\n' +
                '    // missing <span className="three">\n' +
                '    //           3\n' +
                '    //         </span>\n' +
                '  </ClassComponent>\n' +
                '</div>');
        });


        it('highlights an added item in an array of children in a custom component', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo">
                        <span className="one">1</span>
                        <span className="three">3</span>
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent className="foo" test={true}>
                        <span className="one">1</span>
                        <span className="two">2</span>
                        <span className="three">3</span>
                    </ClassComponent>
                </div>
            ), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo">\n' +
                '    <span className="one">\n' +
                '      1\n' +
                '    </span>\n' +
                '    <span className="three">\n' +
                '      3\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have exactly rendered\n' +
                '<div>\n' +
                '  <ClassComponent className="foo" test={true}>\n' +
                '    <span className="one">\n' +
                '      1\n' +
                '    </span>\n' +
                '    <span className="two">\n' +
                '      2\n' +
                '    </span>\n' +
                '    <span className="three">\n' +
                '      3\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo">\n' +
                '    <span className="one">\n' +
                '      1\n' +
                '    </span>\n' +
                '    <span className="three" // -three\n' +
                '                            // +two\n' +
                '    >\n' +
                '      -3\n' +
                '      +2\n' +
                '    </span>\n' +
                '    // missing <span className="three">\n' +
                '    //           3\n' +
                '    //         </span>\n' +
                '  </ClassComponent>\n' +
                '</div>');

        });

        it('accepts added children at the end of an array when not using `exactly`', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo">
                        <span className="one">1</span>
                        <span className="two">2</span>
                        <span className="three">3</span>
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent className="foo" test={true}>
                        <span className="one">1</span>
                        <span className="two">2</span>
                    </ClassComponent>
                </div>);
        });

        it('accepts added children in the middle of an array when not using `exactly`', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo">
                        <span className="one">1</span>
                        <span className="two">2</span>
                        <span className="three">3</span>
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent className="foo" test={true}>
                        <span className="one">1</span>
                        <span className="three">3</span>
                    </ClassComponent>
                </div>);
        });

        it('highlights different typed children', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent test={true} className="foo">
                        <ClassComponent child={true} />
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent className="foo" test={true}>
                        <ES5Component child={true} />
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo">\n' +
                '    <ClassComponent child={true} />\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div>\n' +
                '  <ClassComponent className="foo" test={true}>\n' +
                '    <ES5Component child={true} />\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent test={true} className="foo">\n' +
                '    <ClassComponent // should be ES5Component\n' +
                '                    child={true}></ClassComponent>\n' +
                '  </ClassComponent>\n' +
                '</div>');
        });

        it('matches matching objects as props deeply not be reference', function () {

            var objectA = { some: 'prop', arr: [ 1, 2, 3 ] };
            var objectB = { some: 'prop', arr: [ 1, 2, 3 ] };

            renderer.render(
                <MyDiv>
                    <ClassComponent test={objectA} />
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent test={objectB} />
                </div>);
        });

        it('highlights different objects as props deeply not be reference', function () {

            var objectA = { some: 'prop', arr: [ 1, 2, 3 ] };
            var objectB = { some: 'prop', arr: [ 1, 2, 4 ] };

            renderer.render(
                <MyDiv>
                    <ClassComponent test={objectA} />
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent test={objectB} />
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent test={...} />\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div>\n' +
                '  <ClassComponent test={...} />\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                "  <ClassComponent test={{ some: 'prop', arr: [ 1, 2, 3 ] }} // {\n" +
                "                                                            //   some: 'prop',\n" +
                '                                                            //   arr: [\n' +
                '                                                            //     1,\n' +
                '                                                            //     2,\n' +
                '                                                            //     3 // should equal 4\n' +
                '                                                            //   ]\n' +
                '                                                            // }\n' +
                '  ></ClassComponent>\n' +
                '</div>');
        });

        it('matches a multi-text child', function () {

            var content = 'test';
            var content2 = 'test';
            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some text {content}
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some text {content2}
                    </ClassComponent>
                </div>);
        });

        it('matches a multi-text child to a single text child without exactly', function () {

            var content = 'test';
            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some text {content}
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some text test
                    </ClassComponent>
                </div>);
        });

        it('matches a multi-text child including a number to a single text child without exactly', function () {

            var content = 5;
            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some {content} value
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some 5 value
                    </ClassComponent>
                </div>);
        });

        it('matches a multi-text child including a null to a single text child without exactly', function () {

            var content = null;
            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some {content} value
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some  value
                    </ClassComponent>
                </div>);
        });

        it('matches a multi-text child including an undefined to a single text child without exactly', function () {

            var content = undefined;
            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some {content} value
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some  value
                    </ClassComponent>
                </div>);
        });

        it('matches a multi-text child including a boolean to a single text child without exactly', function () {

            var content = true;
            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some {content} value
                    </ClassComponent>
                </MyDiv>
            );

            // An inline boolean is converted to null, so this "just works"
            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some  value
                    </ClassComponent>
                </div>);
        });

        it('highlights string break-down changes in a multi-text child with `exactly`', function () {

            var content = 'test';
            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some text {content}
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent>
                        some text test
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text test\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have exactly rendered\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text test\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    -some text \n' +
                '    +some text test\n' +
                '    test // should be removed\n' +
                '  </ClassComponent>\n' +
                '</div>');
        });

        it('highlights changed in a multi-text child', function () {

            var content = 'foo';
            var content2 = 'bar';
            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some text {content}
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some text {content2}
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text foo\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text bar\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    -some text foo\n' +
                '    +some text bar\n' +
                '  </ClassComponent>\n' +
                '</div>');
        });

        it('matches a mixed content child', function () {

            var content = <ES5Component foo="bar" />;
            var content2 = <ES5Component foo="bar" />;

            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some text {content}
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some text {content2}
                    </ClassComponent>
                </div>);
        });

        it('highlights changes in a mixed content child', function () {

            var content = <ES5Component foo="bar" />;
            var content2 = <ES5Component foo="blah" />;

            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some text {content}
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have rendered',
                <div>
                    <ClassComponent>
                        some text {content2}
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text \n' +
                '    <ES5Component foo="bar" />\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text \n' +
                '    <ES5Component foo="blah" />\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text \n' +
                '    <ES5Component foo="bar" // -bar\n' +
                '                            // +blah\n' +
                '    ></ES5Component>\n' +
                '  </ClassComponent>\n' +
                '</div>');
        });

        it('highlights removals in multi-string content', function () {
            var content = 'test';

            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        some text
                    </ClassComponent>
                </MyDiv>
            );
            expect(() => testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent>
                        some text {content}
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have exactly rendered\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    some text test\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    -some text\n' +
                '    +some text \n' +
                '    // missing test\n' +
                '  </ClassComponent>\n' +
                '</div>');
        });

        it('highlights removals in complex content with exactly', function () {
            var content = 'test';

            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        <div className="one" />
                        <ES5Component className="three" />
                        <span>foo</span>
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have exactly rendered',
                <div>
                    <ClassComponent>
                        <div className="one" />
                        <span>foo</span>
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    <div className="one" />\n' +
                '    <ES5Component className="three" />\n' +
                '    <span>\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have exactly rendered\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    <div className="one" />\n' +
                '    <span>\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    <div className="one" />\n' +
                '    <ES5Component className="three" /> // should be removed\n' +
                '    <span>\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>');
        });

        it('highlights removals in complex content with `with all children`', function () {
            var content = 'test';

            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        <div className="one" />
                        <ES5Component className="three" />
                        <span>foo</span>
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have rendered with all children',
                <div>
                    <ClassComponent>
                        <div className="one" />
                        <span>foo</span>
                    </ClassComponent>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    <div className="one" />\n' +
                '    <ES5Component className="three" />\n' +
                '    <span>\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to have rendered with all children\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    <div className="one" />\n' +
                '    <span>\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    <div className="one" />\n' +
                '    <ES5Component className="three" /> // should be removed\n' +
                '    <span>\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>');
        });

        it('highlights the block removal for deep children', function () {
            renderer.render(
                <MyDiv>
                    <ul>
                        <li>one</li>
                        <li>two</li>
                        <li>three</li>
                    </ul>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to have rendered with all children',
                <div>
                    <ul>
                        <li>one</li>
                        <li>two</li>
                    </ul>
                </div>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ul>\n' +
                '    <li>\n' +
                '      one\n' +
                '    </li>\n' +
                '    <li>\n' +
                '      two\n' +
                '    </li>\n' +
                '    <li>\n' +
                '      three\n' +
                '    </li>\n' +
                '  </ul>\n' +
                '</div>\n' +
                'to have rendered with all children\n' +
                '<div>\n' +
                '  <ul>\n' +
                '    <li>\n' +
                '      one\n' +
                '    </li>\n' +
                '    <li>\n' +
                '      two\n' +
                '    </li>\n' +
                '  </ul>\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ul>\n' +
                '    <li>\n' +
                '      one\n' +
                '    </li>\n' +
                '    <li>\n' +
                '      two\n' +
                '    </li>\n' +
                '    <li>    // should be removed\n' +
                '      three //\n' +
                '    </li>   //\n' +
                '  </ul>\n' +
                '</div>');
        });

        it('identifies when a string element should be a real element', function () {

            renderer.render(
                <MyDiv className="outer">
                    <span>123</span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to have rendered',
                <div className="outer">
                    123
                </div>), 'to throw',
                'expected\n' +
                '<div className="outer">\n' +
                '  <span>\n' +
                '    123\n' +
                '  </span>\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div className="outer">\n' +
                '  123\n' +
                '</div>\n' +
                '\n' +
                '<div className="outer">\n' +
                '  <span> // \n' +
                '    123  //\n' +
                "  </span>// should be '123'\n" +
                '</div>');
        });

        it('identifies when a number element should be a real element', function () {

            renderer.render(
                <MyDiv className="outer">
                    <span>{123}</span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to have rendered',
                <div className="outer">
                    {123}
                </div>), 'to throw',
                'expected\n' +
                '<div className="outer">\n' +
                '  <span>\n' +
                '    123\n' +
                '  </span>\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div className="outer">\n' +
                '  123\n' +
                '</div>\n' +
                '\n' +
                '<div className="outer">\n' +
                '  <span> // \n' +
                '    123  //\n' +
                "  </span>// should be 123\n" +
                '</div>');
        });



        it('identifies when a real element should be a string element', function () {

            renderer.render(
                <MyDiv className="outer">
                    123
                </MyDiv>);

            expect(() => testExpect(renderer, 'to have rendered',
                <div className="outer">
                    <span>123</span>
                </div>), 'to throw',
                'expected\n' +
                '<div className="outer">\n' +
                '  123\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div className="outer">\n' +
                '  <span>\n' +
                '    123\n' +
                '  </span>\n' +
                '</div>\n' +
                '\n' +
                '<div className="outer">\n' +
                "  123 // should be <span>\n" +
                '      //             123\n' +
                '      //           </span>\n' +
                '</div>');
        });

        it('identifies when a real element should be a number element', function () {

            renderer.render(
                <MyDiv className="outer">
                    {123}
                </MyDiv>);

            expect(() => testExpect(renderer, 'to have rendered',
                <div className="outer">
                    <span>123</span>
                </div>), 'to throw',
                'expected\n' +
                '<div className="outer">\n' +
                '  123\n' +
                '</div>\n' +
                'to have rendered\n' +
                '<div className="outer">\n' +
                '  <span>\n' +
                '    123\n' +
                '  </span>\n' +
                '</div>\n' +
                '\n' +
                '<div className="outer">\n' +
                '  123 // should be <span>\n' +
                '      //             123\n' +
                '      //           </span>\n' +
                '</div>');
        });

        it('ignores components that render null in an array when using `with all children`', function () {

            const RenderNull = React.createClass({

               render: function () {

                   const children = [ <span key="1">one</span>, null, <span key="2">two</span> ];
                    return (

                        <div className="something">
                            {children}
                        </div>
                    );
               }
            });
            renderer.render(<RenderNull />);
            testExpect(renderer, 'to have rendered with all children',
            <div>
                <span>one</span>
                <span>two</span>
            </div>);
        });

        it('ignores null children when using `with all children`', function () {

            const RenderNull = React.createClass({

                render: function () {

                    return (
                        <div>
                            {null}
                        </div>
                    );
                }
            });
            renderer.render(<RenderNull />);

            testExpect(renderer, 'to have rendered with all children', <div /> );
        });

        it("highlights when an element renders children when it shouldn't when using `with all children`", function () {

            const RenderNull = React.createClass({

                render: function () {

                    return (
                        <div>
                            <div />
                        </div>
                    );
                }
            });
            renderer.render(<RenderNull />);

            expect(() => testExpect(renderer, 'to have rendered with all children',
                <div></div>
            ), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <div />\n' +
                '</div>\n' +
                'to have rendered with all children <div />\n' +
                '\n' +
                '<div>\n' +
                '  <div /> // should be removed\n' +
                '</div>' );
        });
    });


    describe('`to equal`', function () {

        it('matches renderer output to a component tree', function () {

            renderer.render(<MyDiv><ClassComponent className="foo" /></MyDiv>);
            testExpect(renderer.getRenderOutput(), 'to equal', <div><ClassComponent className="foo" /></div>);
        });

        it('outputs a diff when the expected is different', function () {

            renderer.render(<MyDiv><ClassComponent className="foo" /></MyDiv>);

            expect(() => testExpect(renderer.getRenderOutput(),
                'to equal', <div><ClassComponent className="foobar" /></div>),
            'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent className="foo" />\n' +
                '</div>\n' +
                'to equal\n' +
                '<div>\n' +
                '  <ClassComponent className="foobar" />\n' +
                '</div>\n' +
                '\n' +
                '<div>\n' +
                '  <ClassComponent className="foo" // -foo\n' +
                '                                  // +foobar\n' +
                '  ></ClassComponent>\n' +
                '</div>');
        });
    });


    describe('contains', function () {

        it('finds an match at the top level', function () {

            renderer.render(<MyDiv><ClassComponent className="foo" /></MyDiv>);
            testExpect(renderer, 'to contain', <div><ClassComponent className="foo" /></div>);
        });

        it('finds a match at a deeper level', function () {

            renderer.render(<MyDiv><span><ClassComponent className="foo" /></span></MyDiv>);
            testExpect(renderer, 'to contain', <ClassComponent className="foo" />);
        });

        it('finds a string content', function () {
            renderer.render(<MyDiv><span>some content one</span><span>some content two</span></MyDiv>);
            testExpect(renderer, 'to contain', 'some content two');
        });

        it('does not find a string that does not exist', function () {

            renderer.render(<MyDiv><span>some content one</span><span>some content two</span></MyDiv>);
            expect(() => testExpect(renderer, 'to contain', 'some content three'), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    some content one\n'+
                '  </span>\n' +
                '  <span>\n' +
                '    some content two\n'+
                '  </span>\n' +
                '</div>\n' +
                "to contain 'some content three'");
        });



        it('does not find a partial string', function () {

            // This behaviour may change in a major version bump at some point.
            // Currently it's quite difficult to implement sensibly, as it would mean that searching
            // for an element with text content would also match if a partial string matched.
            // Maybe we allow a regex... :)
            renderer.render(<MyDiv><span>some content one</span><span>some content two</span></MyDiv>);
            expect(() => testExpect(renderer, 'to contain', 'some content'), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    some content one\n'+
                '  </span>\n' +
                '  <span>\n' +
                '    some content two\n'+
                '  </span>\n' +
                '</div>\n' +
                "to contain 'some content'");
        });

        it('finds a multi-part string', function () {

            renderer.render(<MyDiv><span>button clicked {5} times</span></MyDiv>);
            testExpect(renderer, 'to contain', 'button clicked 5 times');
        });

        it('does not find a multi-part string when `exactly` is used', function () {

            renderer.render(<MyDiv><span>button clicked {5} times</span></MyDiv>);
            expect(() => testExpect(renderer, 'to contain exactly', 'button clicked 5 times'),
                'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    button clicked 5 times\n' +
                '  </span>\n' +
                '</div>\n' +
                "to contain exactly 'button clicked 5 times'");
        });

        it('does not find a part of a multi-part string', function () {

            // See the 'does not find a partial string' test above
            // This behaviour may change
            renderer.render(<MyDiv><span>button clicked {5} times</span></MyDiv>);
            expect(() => testExpect(renderer, 'to contain', 'button clicked '), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    button clicked 5 times\n' +
                '  </span>\n' +
                '</div>\n' +
                "to contain 'button clicked '");
        });

        it('finds part of a multi-part string when exactly is used', function () {

            renderer.render(<MyDiv><span>button clicked {5} times</span></MyDiv>);
            testExpect(renderer, 'to contain exactly', 'button clicked ');
        });

        it('finds a match in an array of children', function () {

            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="cheese" />
                    </span>
                </MyDiv>);
            testExpect(renderer, 'to contain', <ClassComponent className="foo" />);
        });

        it('does not find a match when it does not exist', function () {

            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="cheese" />
                    </span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to contain', <ClassComponent className="notexists" />),
                'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    nested\n' +
                '  </span>\n' +
                '  <span>\n' +
                '    <ClassComponent className="bar" />\n' +
                '    <ClassComponent className="foo" />\n' +
                '    <ClassComponent className="cheese" />\n' +
                '  </span>\n' +
                '</div>\n' +
                'to contain <ClassComponent className="notexists" />');
        });

        it('does not find a match when the children of a candidate match are different', function () {

            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="candidate">
                            <span>something else</span>
                        </ClassComponent>
                    </span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to contain',
                    <ClassComponent className="candidate">
                        <span>cheese</span>
                    </ClassComponent>),
                    'to throw',
                    'expected\n' +
                    '<div>\n' +
                    '  <span>\n' +
                    '    nested\n' +
                    '  </span>\n' +
                    '  <span>\n' +
                    '    <ClassComponent className="bar" />\n' +
                    '    <ClassComponent className="foo" />\n' +
                    '    <ClassComponent className="candidate">\n' +
                    '      <span>\n' +
                    '        something else\n' +
                    '      </span>\n' +
                    '    </ClassComponent>\n' +
                    '  </span>\n' +
                    '</div>\n' +
                    'to contain\n' +
                    '<ClassComponent className="candidate">\n' +
                    '  <span>\n' +
                    '    cheese\n' +
                    '  </span>\n' +
                    '</ClassComponent>');
        });

        it('finds the match when there are extra children in the render, but `exactly` is not used', function () {
            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="candidate">
                            <span>one</span>
                            <span>two</span>
                            <span>three</span>
                        </ClassComponent>
                    </span>
                </MyDiv>);

            testExpect(renderer, 'to contain',
                <ClassComponent className="candidate">
                    <span>one</span>
                    <span>three</span>
                </ClassComponent>);
        });

        it('finds the match when there are extra props in the render, but `exactly` is not used', function () {
            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="candidate" id="123" />
                    </span>
                </MyDiv>);

            testExpect(renderer, 'to contain', <ClassComponent className="candidate"/>);
        });

        it('does not find a match when there are extra props in the render, and `exactly` is used', function () {
            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="candidate" id="123" />
                    </span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to contain exactly', <ClassComponent className="candidate"/>),
                'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    nested\n' +
                '  </span>\n' +
                '  <span>\n' +
                '    <ClassComponent className="bar" />\n' +
                '    <ClassComponent className="foo" />\n' +
                '    <ClassComponent className="candidate" id="123" />\n' +
                '  </span>\n' +
                '</div>\n' +
                'to contain exactly <ClassComponent className="candidate" />');
        });


        it('does not find a match when there are extra children in the render, and `exactly` is used', function () {
            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="candidate">
                            <span>one</span>
                            <span>two</span>
                            <span>three</span>
                        </ClassComponent>
                    </span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to contain exactly',
                <ClassComponent className="candidate">
                    <span>one</span>
                    <span>three</span>
                </ClassComponent>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    nested\n' +
                '  </span>\n' +
                '  <span>\n' +
                '    <ClassComponent className="bar" />\n' +
                '    <ClassComponent className="foo" />\n' +
                '    <ClassComponent className="candidate">\n' +
                '      <span>\n' +
                '        one\n' +
                '      </span>\n' +
                '      <span>\n' +
                '        two\n' +
                '      </span>\n' +
                '      <span>\n' +
                '        three\n' +
                '      </span>\n' +
                '    </ClassComponent>\n' +
                '  </span>\n' +
                '</div>\n' +
                'to contain exactly\n' +
                '<ClassComponent className="candidate">\n' +
                '  <span>\n' +
                '    one\n' +
                '  </span>\n' +
                '  <span>\n' +
                '    three\n' +
                '  </span>\n' +
                '</ClassComponent>');
        });

        it('does not find a match when there are extra children in the render, and `with all children` is used', function () {
            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="candidate">
                            <span>one</span>
                            <span>two</span>
                            <span>three</span>
                        </ClassComponent>
                    </span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to contain with all children',
                <ClassComponent className="candidate">
                    <span>one</span>
                    <span>three</span>
                </ClassComponent>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    nested\n' +
                '  </span>\n' +
                '  <span>\n' +
                '    <ClassComponent className="bar" />\n' +
                '    <ClassComponent className="foo" />\n' +
                '    <ClassComponent className="candidate">\n' +
                '      <span>\n' +
                '        one\n' +
                '      </span>\n' +
                '      <span>\n' +
                '        two\n' +
                '      </span>\n' +
                '      <span>\n' +
                '        three\n' +
                '      </span>\n' +
                '    </ClassComponent>\n' +
                '  </span>\n' +
                '</div>\n' +
                'to contain with all children\n' +
                '<ClassComponent className="candidate">\n' +
                '  <span>\n' +
                '    one\n' +
                '  </span>\n' +
                '  <span>\n' +
                '    three\n' +
                '  </span>\n' +
                '</ClassComponent>');
        });

        it('finds a match when the render contains children, but the expected does not, and `exactly` is not used', function () {
            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="candidate">
                            <span>one</span>
                            <span>two</span>
                            <span>three</span>
                        </ClassComponent>
                    </span>
                </MyDiv>);

            testExpect(renderer, 'to contain', <ClassComponent className="candidate" />);
        });

        it('does not find a match when the render contains children, but the expected does not, and `exactly` is used', function () {
            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="foo" />
                        <ClassComponent className="candidate">
                            <span>one</span>
                            <span>two</span>
                            <span>three</span>
                        </ClassComponent>
                    </span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to contain exactly', <ClassComponent className="candidate" />),
                'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    nested\n' +
                '  </span>\n' +
                '  <span>\n' +
                '    <ClassComponent className="bar" />\n' +
                '    <ClassComponent className="foo" />\n' +
                '    <ClassComponent className="candidate">\n' +
                '      <span>\n' +
                '        one\n' +
                '      </span>\n' +
                '      <span>\n' +
                '        two\n' +
                '      </span>\n' +
                '      <span>\n' +
                '        three\n' +
                '      </span>\n' +
                '    </ClassComponent>\n' +
                '  </span>\n' +
                '</div>\n' +
                'to contain exactly <ClassComponent className="candidate" />');
        });

        it('does not find a match if the expected has children, but the candidate match does not', function () {

            renderer.render(
                <MyDiv>
                    <span>nested</span>
                    <span>
                        <ClassComponent className="bar" />
                        <ClassComponent className="candidate" />
                    </span>
                </MyDiv>);

            expect(() => testExpect(renderer, 'to contain',
                <ClassComponent className="candidate">
                    <span>foo</span>
                </ClassComponent>), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <span>\n' +
                '    nested\n' +
                '  </span>\n' +
                '  <span>\n' +
                '    <ClassComponent className="bar" />\n' +
                '    <ClassComponent className="candidate" />\n' +
                '  </span>\n' +
                '</div>\n' +
                'to contain\n' +
                '<ClassComponent className="candidate">\n' +
                '  <span>\n' +
                '    foo\n' +
                '  </span>\n' +
                '</ClassComponent>');
        });

        it('matches even with removals in complex content without `exactly`', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        <MyDiv className="one" />
                        <ES5Component className="three" />
                        <span>foo</span>
                    </ClassComponent>
                </MyDiv>
            );

            testExpect(renderer, 'to contain',
                    <ClassComponent>
                        <MyDiv className="one" />
                        <span>foo</span>
                    </ClassComponent>
            );
        });

        it('does not match with a removal and an addition in complex content with `exactly`', function () {

            renderer.render(
                <MyDiv>
                    <ClassComponent>
                        <div className="one" />
                        <ES5Component className="three" />
                        <span>foo</span>
                    </ClassComponent>
                </MyDiv>
            );

            expect(() => testExpect(renderer, 'to contain exactly',
                <ClassComponent>
                    <div className="one" />
                    <ClassComponent className="three" />
                    <span>foo</span>
                </ClassComponent>
            ), 'to throw',
                'expected\n' +
                '<div>\n' +
                '  <ClassComponent>\n' +
                '    <div className="one" />\n' +
                '    <ES5Component className="three" />\n' +
                '    <span>\n' +
                '      foo\n' +
                '    </span>\n' +
                '  </ClassComponent>\n' +
                '</div>\n' +
                'to contain exactly\n' +
                '<ClassComponent>\n' +
                '  <div className="one" />\n' +
                '  <ClassComponent className="three" />\n' +
                '  <span>\n' +
                '    foo\n' +
                '  </span>\n' +
                '</ClassComponent>');
        });
    });

    describe('to satisfy', () => {

        describe('renderOutput', () => {

            it('should satisfy a matching output', () => {

                renderer.render(
                    <MyDiv>
                        <span className="one">foo</span>
                        <span className="two">bar</span>
                    </MyDiv>
                );

                testExpect(renderer.getRenderOutput(), 'to satisfy',
                <div>
                    <span>foo</span>
                    <span>bar</span>
                </div>);
            });
        });
    });

});
