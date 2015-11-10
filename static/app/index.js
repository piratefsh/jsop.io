import _ from 'lodash';
import 'assets/styles/style.sass';

console.log(BENCHSPEC);
console.log(_.VERSION);
console.log(System);

System.transpiler = 'traceur';
const p = System.import('http://code.jquery.com/jquery-1.11.3.min.js')
p.then(function(m){
    console.log(m)
})
// require.ensure(['script!//code.jquery.com/jquery-1.11.3.min.js'], (require) => {
//     console.log($)
// });