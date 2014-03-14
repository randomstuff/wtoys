wtoys
=====

A collection of (one!) web based games based around the concept of
remixing the web.

See the [demo](http://wtoys.gabriel.netlib.re/).

Games
-----

### memory

A simple memory with user customisable tiles:

* drag and drop images from the web or your filesystem;
* copy/paste them;
* use images from a webcam;
* use a plain text file with URIs.

Installation
------------

    # Fetch dependencies:
    ./fetch.sh

Roadmap
-------

General:

 * use a real build system;
 * update dependencies (bootstrap, angular);
 * mobile firendly UI;
 * offline mode;
 * apps (Mozilla OpenWebApp, Chrome app, Mobile apps);
 * integration with webActivity (Firefox/Android);
 * create reusable libraries;
 * polyfill [Media Fragments](http://www.w3.org/TR/media-frags/) (possible ?)

Memory:

 * better UI;
 * video tiles;
 * audio tiles;
 * mixed (image + audio) tiles;
 * pairs of tiles;
 * filesystem API (save image);
 * add support for webActivity (pick image…).
