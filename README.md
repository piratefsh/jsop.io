# jsop
Javascript benchmark tool. jsop makes it easy to create/edit/run/discuss benchmark tests.

Powered by [benchmark.js](http://benchmarkjs.com/) and directly inspired by [jsperf.com](jsperf.com) by [@mathias](https://mathiasbynens.be).

jsop is under active development. Follow [@jsop_io](https://twitter.com/jsop_io) for updates.


## Key Features
  * ~~Create, edit, share and discuss benchmark tests.~~
  * ~~Run benchmark tests on any Javascript-enabled platform.~~
  * ~~Import existing benchmark tests from [jsperf.com](jsperf.com).~~
  * ~~Browse performance charts across platforms.~~
  * ~~Browse raw performance results via APIs.~~
  * ~~Run standalone, private instances.~~


## Why jsop.io? (Or, why jsperf.com?)

Javascript benchmarks give us real-world numbers to answer questions like:
  * What's the fastest way to [round numbers down](#jsop)?
  * What's the fastest way to [concat strings](#jsop)?
  * How much faster is the [latest version of jQuery](#jsop)?

At the same time, Javascript runs under many different conditions, so it's impossible to guarantee consistent results on different platforms.

**Publicly hosted benchmark tests** allow us to crowdsource real-world results under different conditions (e.g. operating systems, hardware, engines), so we can make more accurate conclusions.

For inspiration, explore the [Test Gallery](#jsop).


## Basic Usage

jsop is intended for testing short Javascript code snippets. Tests can be run on any Javascript-enabled platform.

  * For **web browser platforms** (e.g. Chrome, Safari, Firefox, IE)  
  Browse to [http://jsop.io/example](#jsop) and click "Run Test".

  * For **non-browser platforms** (e.g. NodeJS, iojs, PhantomJS, Rhino)  
  Download `jsop` and run `jsop test nodejs http://jsop.io/example`.

For more details, see [Tutorial](#jsop) and [API Documentation](#jsop).


## Advanced Usage

  * [Private Tests](#jsop)  
  It's as easy as `jsop start 8080`.

  * [Framework Integration](#jsop)  
  It might be possible to adapt jsop for various testing frameworks (e.g. QUnit, mocha, jasmine), by hooking into the framework's native `setup` / `teardown` / `test` APIs. If you manage to do this, let us know!


## Contributions

jsop is maintained in three main parts:

  * **jsop.io**  
  Manages benchmarks and results, with the following goals:
    1. high availability of benchmark tests and results,
    2. minimal storage/bandwidth costs,
    3. simple UI to create/edit/run/discuss benchmarks,
    4. allow for standalone, personal instances.

  Written in NodeJS (Express). For more details, see [Contributions#jsop.io](docs/contrib.md).


  * **jsop-runner**  
  Manages running benchmarks on different platforms, with the following goal:  
    1. maintain high accuracy and consistency across platforms.

  Written in Javascript (benchmark.js, system.js). For more details, see [Contributions#jsop-runner](docs/contrib.md).


  * **jsop-cli**
  Runs benchmarks on non-browser platforms, with the single goal of:
    1. increasing non-browser platform support.

  Written in Golang. For more details, see [Contributions#jsop-cli](docs/contrib.md).
