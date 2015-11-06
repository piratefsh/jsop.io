import _ from 'lodash';
import FooTemplate from '../assets/templates/foo.tpl!';
import '../assets/styles/style.sass!';

console.log(BENCHSPEC);
console.log(FooTemplate({example: 'foobar'}));
console.log(_.VERSION);

