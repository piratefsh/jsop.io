import FooTemplate from 'templates/foo.tpl!';
import _ from 'lodash';

console.log(FooTemplate({example: 'foobar'}));
console.log(_.VERSION);
