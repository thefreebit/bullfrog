BullFrog
=========

BullFrog is an Artifactory specific open source Java APM based on [Glowroot](https://github.com/glowroot/glowroot).

## Requirements

* Java 6+
* Artifactory 4+

## BullFrog Additions

BullFrog builds on top of [Glowroot](https://github.com/glowroot/glowroot). The early phase will include Artifactory gauge defaults, cosmetic, terminology changes. 

The next phases will add:

* Dashboard - Monitor Artifactory and system resources on a single page
* View Artifactory specific properties from the BullFrog UI
* Alerts for known bottleneck resources (connections, threads, db, etc)

## Installation Instructions 

*Stay Tuned*

## Please report any issues!

 * [GitHub issue tracker](https://github.com/thefreebit/bullfrog/issues)


## Building

The usual:

    mvn clean install

Binary distribution is built under agent-parent/dist/target.

Building requires Java 7+ (in order to perform [Immutables](https://immutables.github.io) annotation processing) and Maven 3.1.0+.

## Contributing

BullFrog/Glowroot uses [Immutables](https://immutables.github.io) annotation processing to eliminate maintenance on lots of boilerplate code. If you are using Eclipse, this requires installing the [m2e-apt](https://github.com/jbosstools/m2e-apt) plugin and changing Window > Preferences > Maven > Annotation Processing to "Automatically configure JDT APT".

To work on the UI, run org.glowroot.ui.sandbox.UiSandboxMain under a debugger inside your favorite IDE. This starts Glowroot and generates a variety of sample traces to give the UI something to display. Connect your browser to http://localhost:4000.

Also, BullFrog/Glowroot uses [Bower](http://bower.io) and [Grunt](http://gruntjs.com) to build its web assets (dependency management, Javascript concat/minify, LESS compile/uncss/minify, AngularJS template concat/minify, asset revving and more). The first time you run `mvn clean install`, Node, Bower and Grunt are installed locally under the `ui` directory (thanks to the [frontend-maven-plugin](https://github.com/eirslett/frontend-maven-plugin)).

If you are modifying web assets, you either need to run grunt to re-build them after each change, or (better) run `grunt serve` from the `ui` directory and connect your browser to http://localhost:9000.

`grunt serve` serves up the Glowroot web assets to the browser without the concat/minify/rev step, which makes testing/debugging much easier. It reverse proxies non- static resource requests to http://localhost:4000 to be handled by Glowroot. It also watches for changes to the files and performs live-reload of web assets inside the browser.

## Integration tests

Integration tests are run during Maven's standard `integration-test` lifecycle phase.

The Glowroot agent has an [integration test harness](agent/it-harness) which makes it easy to run sample application code and then validate the data captured by the agent.  The integration test harness is able to run tests both using a custom weaving class loader (which is very convenient for running and debugging inside your favorite IDE), and by spawning a JVM with the -javaagent flag (which more correctly simulates real world conditions).

Browser-based integration tests are run using WebDriver.  By default they run against Firefox.  Thanks to [Sauce Labs](https://saucelabs.com), they also run against Chrome, IE (9, 10, 11) and Safari (6, 7, 8, 9) during every Travis CI build (see the jobs with TARGET=saucelabs).

## Microbenchmarks

Microbenchmarks are written using the excellent [JMH](http://openjdk.java.net/projects/code-tools/jmh/) benchmark harness. The microbenchmarks can be built and run under [agent-parent/benchmarks](agent-parent/benchmarks):

    mvn clean package
    java -jar target/benchmarks.jar -jvmArgs -javaagent:path/to/glowroot.jar

## Code quality

[Checker Framework](http://types.cs.washington.edu/checker-framework/) is used to eliminate fear of *null* with its rigorous [Nullness Checker](http://types.cs.washington.edu/checker-framework/current/checker-framework-manual.html#nullness-checker). It is run as part of every Travis CI build (see the job with TARGET=checker) and any violation fails the build.

## Dependency shading

All third party java libraries used by the agent are shaded under the org.glowroot.agent.shaded package to ensure there are no jar version conflicts with the application being monitored.

## License

BullFrog source code is licensed under the Apache License, Version 2.0.

See [Third Party Software](https://github.com/thefreebit/bullfrog/wiki/Third-Party-Software) for license detail of third party software included in the binary distribution.
