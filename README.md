<!--
Old GitHub one-line description:
- Discussion forums with Question & Answers and Team Chat features. Plus embedded comments for your blog.

Current:
- Open source StackOverflow, Slack, Discourse, Reddit, Disqus hybrid — for your online community.

Other alternatives?:
- Community software, brings together the best from StackOverflow + Slack + Reddit + Discourse.
- Online community software. Find ideas and answers together, and pick the right things
to do, to change society, or grow your startup.
-->


Talkyard
=============================

Create a place to talk,
where your users find answers to their questions, and can suggest ideas.<br>
Place it at `community.your-website.org`.

<!-- People in your community need different types of discussions for different things?
Talkyard has: -->

 - **Find answers** in Question-Answers topics, like StackOverflow.
 - **Gather ideas** in open-ended topics, like at Reddit and Hacker News.
 - **Get work done** in team chat, like Slack.
 - **Solve problems** step by step, in flat by-time topics (coming soon).
 - **Talk with your blog visitors** in embedded comments, like Disqus.

<!--
 - **Improve your API docs**, by embedding comments at the end of each docs page, to make it easy for people to ask and tell you if something is unclear.
   -->

<!-- (The staff configure the topic type just once, in a per category setting.) -->

[**Support forum here**](https://www.talkyard.io/forum/latest/support), at Talkyard<i></i>.io — and report bugs there too.

Our vision is to build a tool that [people who change the world or their neighborood] can use
to find answers and pick the right things to do. That's why we have
Q&A (question-answers) and HackerNews & Reddit type topics,
where good answers and ideas rise to the top.

<!--
Talkyard (formerly EffectiveDiscussions) is discussion forum software, with chat and question-answers features.
And embedded comments for static websites / blogs.
Inspired by Discourse, Slack, StackOverflow, Reddit and Hacker News, Disqus. -->

Screenshots a bit below.<br>
See it live: https://www.talkyard.io/forum/latest<br>
Read about it, and demo forums: https://www.talkyard.io


### How install?

_This_ repository is for writing Talkyard source code, and building Docker images (docker build
files are in <code>./docker/<i>image-name</i>/</code>).
To _install_ Talkyard, instead go to: https://github.com/debiki/talkyard-prod-one
("-prod-one" means "production installation on one server").

Docker based installation. Automatic upgrades.
One installation can host many sites.
There's [hosting](https://www.talkyard.io/pricing), if you don't want to install it yourself.

This is beta software; there might be bugs.


### Screenshots

**Topic list:**

<!--
![topic-list-borders](https://user-images.githubusercontent.com/7477359/44306130-a3930080-a388-11e8-9cbc-e569f5ddb7a1.jpg)
 the old demo forum looks better? so use instead.  -->

![ed-demo-forum-index](https://cloud.githubusercontent.com/assets/7477359/19650764/bb3a1450-9a0a-11e6-884d-d23c93476db3.jpg)

<br>

**Question-Answers:**


![how-work-from-home-vpn-broken-borders](https://user-images.githubusercontent.com/7477359/44306101-0041eb80-a388-11e8-92e8-b8d417c47139.jpg)

<br>

**Chat:**

Currently, Talkyard is a mobile friendly web app.
Within half a year or a year (today is August 2018),
the plan is that there'll be a white labelled mobile app.
Meaning, people will be able to install your community, on their mobile phones,
as a separate app with your custom icon.
Push notifications for Android
(however, initially not for iPhone — iPhone currently cannot do PWA mobile app push notifications).

![ed-e2e-chat-owen-maria](https://cloud.githubusercontent.com/assets/7477359/19674424/608c49aa-9a88-11e6-8ccd-c2e7ceebd0c2.jpg)

<br>
<!--
![Q&A about how to wake up on time](https://user-images.githubusercontent.com/7477359/39368115-0549fad0-4a39-11e8-9bba-703d595d2b96.jpg)
-->
<!--
Hacker News / Reddit style discussion:
![ed-discussion-semantics-of-upvote-2013](https://cloud.githubusercontent.com/assets/7477359/19650769/bea906aa-9a0a-11e6-8ea2-9ad771981f46.jpg)
-->

**Admin-getting-started guide:**

![ed-admin-intro-guide](https://cloud.githubusercontent.com/assets/7477359/19679591/99a12098-9aa2-11e6-8b65-705c2548cbea.jpg)

<br>

**Users online:**

![ed-online-users](https://cloud.githubusercontent.com/assets/7477359/19680424/f0353f86-9aa5-11e6-84d9-94d46f228b93.jpg)

<br>


Contributing
-----------------------------

Want to contribute? Feel free to say hello in our community: <https://www.talkyard.io/forum/>.
Good for you if you ask the people there what is currently being worked on, so you won't
accidentally re-implement something that's almost done already — people
might be working in their own work-in-progress topic branches that you
don't know about.

Here's how to translate to a new language: [i18n-README](translations/i18n-README.md) (step 1 and 2 only).

You need to read and agree to our [Contributor License Agreement](./docs/CLA-v2.txt). You do that by
reading it (please do — there's a human friendly intro) and appending a single line
paragraph with your real name (no pseudonyms) and the following text, to all your commit messages:

> I, Your Full Name \<your@<i></i>email.address\>, agree to the Contributor License Agreement, docs/CLA-v2.txt.

Please squash your commits to just one (unless you're doing something complicated that's easier
to review in separate commits).




Getting Started
-----------------------------

#### Before you start

You need about 4 GB RAM for the development environment (whereas the production environment needs about 2 GB).
And a somewhat fast internet connection — you'll be downloading perhaps 0.5 (?) GB Docker images.

Install Docker-Compose, version 1.7.0+: https://docs.docker.com/compose/install/,
or simply, on Linux: (maybe a 'sudo' is missing on the 1st line?)

```
wget -qO- https://get.docker.com/ | sh
sudo curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
docker-compose --version  # should print "docker-compose version ... build ..."
```

Read [A brief intro to Docker-Compose](docs/intro-to-docker-compose.md) — unless you know
how to use docker-compose already.

#### The instructions

1. Clone this repository, `cd` into it. Then update submodules:

       git clone https://github.com/debiki/talkyard.git talkyard
       cd talkyard
       git submodule update --init

1. Append some settings to the system config so that ElasticSearch will work:
   (run this as one single command, not one line at a time)

       sudo tee -a /etc/sysctl.conf <<EOF

       ###################################################################
       # Talkyard settings
       #
       # Up the max backlog queue size (num connections per port), default = 128
       net.core.somaxconn=8192
       # ElasticSearch requires (at least) this, default = 65530
       # Docs: https://www.kernel.org/doc/Documentation/sysctl/vm.txt
       vm.max_map_count=262144
       EOF

    Reload the system config:

       sudo sysctl --system

1. Compile and SBT `publishLocal` a logging library. (Search for `[7SBMAQ2P]` in this Git repo, to find out why.)

       sudo s/d-cli
       project edLogging
       publishLocal
       # then CTRL+D to exit


1. Build and start all Docker containers: (this will take a while: some Docker images will be downloaded and built)

       sudo s/d up -d   # s/d = shortcut for docker-compose, so long to type.
                        # The 's' means "scripts" and 'd' means "docker-compose".

       # And tail the logs:
       sudo s/d logs -f

   This log message might take 10 - 20 minutes: (lots of stuff is being downloaded — we'll try to
   include all that in the Docker image directly instead, later)

       Loading project definition from /opt/talkyard/app/project

   Wait until this appears in the logs:

       app_1     |
       app_1     | --- (Running the application, auto-reloading is enabled) ---
       app_1     |
       app_1     | [info] p.c.s.NettyServer - Listening for HTTP on /0:0:0:0:0:0:0:0:9000
       app_1     | [info] p.c.s.NettyServer - Listening for HTTPS on /0:0:0:0:0:0:0:0:9443
       app_1     |
       app_1     | (Server started, use Ctrl+D to stop and go back to the console...)
       app_1     |


1. Compile all Scala files, start the server, as follows:

   Point your browser to http://localhost/. This sends a request to the Docker container
   named 'web', in which Nginx listens on port 80. Nginx sends the request to Play Framework
   in the 'app' container, port 9000. Play Framework then starts compiling Scala files; this
   takes a while — so the browser will show a 502 Bad Gateway error message (because Play
   didn't reply because it's busy compiling stuff).

   Eventually, when done compiling, Play Framework will start. Then this message will get logged:

       app_1  | [info] application - Starting... [EsM200HELLO]

   But it's easy to miss, because after that, the server logs even more messages. You can
   continue with the next step just below anyway — just keep reloading the browser page until
   any "is starting" message disappears.


1. Create a forum

   Reload the browser at http://localhost/. Now eventually a page should be shown.
   Sign up as admin with this email: `admin@example.com` (must be that email).
   As username and password you can type `admin` and `public1234`.

   You'll be asked to confirm your email address, by clicking a link in an email
   that was sent to you — but in fact the email couldn't be sent, because you haven't configured
   any email server, and `admin@example.com` isn't your address anyway.

   Instead look at the log messages. (Run `sudo docker-compose logs app` if you've closed
   the terminal with log messages.) There you'll find
   the email — it's written to the log files, in development mode. Copy the
   confirmation link from the `<a href=...>` and paste it in the browser's address bar.

You can shutdown everything like so: `sudo s/d-killdown`, and if Play Framework runs out of memory
(it'll do, if it recompiles Scala files and reloads the app many many times),
you can restart it like so: `sudo s/d-restart-web-app`.



Troubleshooting
-----------------------------

See [tips.mnd](./docs/tips.md).



Tests
-----------------------------

#### End-to-end tests

The end-to-end tests are written in TypeScript and uses Selenium and Webdriver.io.
See the [end-to-end tests readme](./docs/e2e-tests-readme.md).
And, if you want to test in a browser other than Chrome, see [Making *.localhost addresses work](./docs/wildcard-dot-localhost.md).


#### Security tests

The security tests are written in TypeScript and use Tape = test-anything-protocol for Node.js.
See the [security tests readme](./docs/security-tests-readme.md).


#### Unit tests

Stop everything: `sudo docker-compose down` and then: `s/cli` then type `test` + hit Enter.


#### Performance tests

Install Scala SBT, see http://www.scala-sbt.org/download.html. On Linux:

```
echo "deb https://dl.bintray.com/sbt/debian /" | sudo tee -a /etc/apt/sources.list.d/sbt.list
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 2EE0EA64E40A89B84B2DF73499E82A75642AC823
sudo apt-get update
sudo apt-get install sbt
```

Append to `/etc/security/limits.conf` ... hmm but now with Docker-Compose, which container?

    your_login_name hard nofile 65535
    your_login_name soft nofile 65535

Configure very high max-requests-per-ip-per-second etc Nginx limits — otherwise during the performance
test Nginx will start to rate limit stuff and reply 503 Service Not Available:

```
sudo docker-compose  -f docker-compose.yml  -f docker-compose-no-limits.yml  up -d
```


Technology
-----------------------------

- Client: React.js, TypeScript, Webdriver.io.
- Server: Scala and Play Framework. Nginx, Nchan, some Lua. React.js in Java's Nashorn Javascript engine.
- Databases: PostgreSQL, Redis, ElasticSearch.



Directories
-----------------------------

This project looks like so:


    server/
     |
     +-docker-compose.yml   <-- tells Docker how to run Talkyard
     |
     +-client/         <-- Javascript, CSS, React.js components
     | +-app/          <-- Client side code
     | +-server/       <-- React.js components rendered server side
     | :
     | :
     |
     +-app/            <-- Scala code — a Play Framework 2 application
     |
     +-tests/
     | +-app/          <-- Unit tests and functional tests, for the app server
     | +-e2e/          <-- End-to-end tests
     | +-security/     <-- Security tests
     |
     +-modules/
     | +-ed-dao-rdb/        <-- A database access object (DAO), for PostgreSQL
     | +-ed-core/           <-- Code shared by the DAO and by the ./app/ code
     | +-ed-prod-one-test/  <-- A production installation, for automatic tests
     | |
     | +-local/        <-- Ignored by .gitignore. Here you can override the
     | |                   default config values. If you want to, turn it into
     | |                   a Git repo.
     | |
     | ...Third party modules
     |
     +-public/         <-- Some images and libs, plus JS and CSS that Gulp
     |                     has bundled and minified from the client/ dir above.
     |
     +-docker/         <-- Dockerfiles for all docker-compose containers
     | +-web/          <-- Docker build stuff for the Nginx container
     | | +-modules/
     | |   +-nchan/    <-- WebSocket and PubSub for Nginx (a Git submodule)
     | |   +-luajit/   <-- Lua
     | |   ...
     | |
     | +-gulp/         <-- Container that runs Node.js and bundles JS and CSS
     | +-gulp-home/    <-- Mounted as Gulp container home-dir = disk cache
     | |
     | +-...           <-- More containers...
     | |
     | +-data/
     |   +-rdb         <-- Mounted as a volume in the Postgres container
     |   +-cache       <-- Mounted in the Redis container
     |   +-uploads     <-- Mounted read-write in the Play container, but
     |   |                 read-only in Nginx (to serve static files)
     |   ...
     |
     +-s/         <-- Utility scripts (typing "scripts/" is so long)
     |
     +-conf/      <-- Default config files that assume everything
                      is installed on localohost, and dev mode


Naming style, tags and a new word
-----------------------------

### CSS classes and ids

*Example*: `s_P_By_FN-Gst`. Here, `s_` is a prefix used for all classes, and
it means "some". For ids we use `t_` instead, means "the". `P` means Post. `By` means
who-was-it-written-By. `FN` means Full Name. `Gst` means Guest.

So, this is BEM (Block Element Modifier) with a few tweaks: Blocks/elements are separated with
only one underscore, and modifiers with only one dash. Blocks, elems and modifiers always
start with uppercase — because then it's easy to tell if we're dealing with an _abbreviation_
or not. For example, `FN` (full name) is an abbreviation. But `By` is not (since it continues with
lowercase letters).

Another example: `s_Dfs_Df_Ttl` — this means the title (Ttl), of a draft (Df),
in a list of drafts (Dfs).  You'll find abbreviations like Ttl and Df, in
[bem-blocks.txt](./docs/bem-blocks.txt).

<!-- I think these short names actually improve readability, once you know what they means.
Seeing `s_Dfs_Df_Ttl` in the source code — that's brief and quick to read, doesn't steal
the attention from other things nearby you're probably more inteested in.
(too chatty, skip this)  -->

For stuff with otherwise no class or id, and that should be clicked in end-to-end tests,
we use classes only, and the prefix `e_` (instead of `s_` or `t_`).


### Single and double quotes

In Typescript (and any Javascript), use single quotes for strings the computer cares about,
like CSS classes or ids, e.g. `className: 's_P'` or `reactRenderMethod = 'hydrate'`,
or React component display names.
For texts that humans read, instead use double quotes, like: `Button({ ...}, "Undo")`.
When doing this, you can be fairly certain that if you edit a single quote string,
without knowing what you're doing, something will break.
Whilst if you edit a double quoted string and fix e.g. a spelling errors: the computer
won't care, but humans like it.


### Tag the code

Some parts of a software system, knows how other parts of the software system works,
sometimes in not-obvious ways. Make such otherwise hidden duplicated knowledge visible,
by tagging the code with tags like: `[1ABCDE2]`.
Example: `// Also done here: [4JKAM7] when deleting pages.`.
Or there's a 3rd partly lib bug workaround in one source code file, for a problem that happens
in a different file, and an end-to-end test that got affected, example: `[5QKBRQ]`.
Tag those three places with the same tag.
Just type a number, random uppercase letters, and another number, to create a tag.
And copy-paste it to where the related code is.


### Message codes and magic underscores

Log messages, and plain text messages sent back to the browser, start with `TyM` if it's
an info message, and `TyE` if it's an error. Like, `"Server starting... [TyMHELLO]"` (a log message).

These messsage codes helps you instantly find the relevat source code, if there's
an error message anywhere. Otherwise, it can be terribly annoying,
when the browser says "Not found", and you have no idea where that message comes from.
For example, Nginx didn't find a location handler? Or a user is missing? Or a page? Or a post?
Or a client side route is missing? Or the hostname is wrong? Or ...?
And you search for "Not found" and find 1 000 matches.
Now, instead, you'll see `"Not found [TyE123ABC]"` — and you then search for "TyE123ABC"
and find the relevant source code.

Some message codes sent to the browser are checked for in end to end tests. They shall
have an underscore `_` at the *end* (because it's called *end* to *end* tests). So, if you see a
message code like: `"TyM0APPR_"` and you change it, you need to search for it
everywhere and update some end-to-end tests too.

Some message codes are checked for by production code Typescript, i.e. *front*end code.
They shall have a `_` at the beginnign (front) of the error code, and here's how they can be used
client side: `if (hasErrorCode(failedRequest, '_EsE403IUAM_'))`. — So, those two `_` tells you
that that error code is used both in the real frontend Typescript code, and in end-to-end-tests
(hmm there's no such e2e test though, but ought to be).


### Hen and henbirds

Source code comments should be concise, but writing "he or she" everywhere, when referring
to e.g. a user, becomes a bit verbose (because "he or she" is three words). There's
a short Swedish word that means "he or she", namely "hen". Let's start using it in English.

So: "hen" = either "he or she", or "him or her", depending on context.
And "hens" = "his or her", and "hen's" = "he or she is".

To refer to many hen = many-he-or-she, write "people". "Hens" however
means "his or her", just like "its" means, well, "its" (but not "things").

What about the bird previously called "hen"? Let's call it "henbird" instead.

So, hereafter, the word "hen" means "he or she". And the henbird, which I cannot
remember having mentioned or even thought about the past year, no longer gets
to occupy the short and useful word "hen".



Custom third party builds
-----------------------------

We're building & using a smaller version of Lodash, like so:
(this makes slim-bundle.min.js.gz 8kb = 4% smaller, as of September 2016)

    node_modules/lodash-cli/bin/lodash  include=assign,assignIn,before,bind,chain,clone,compact,concat,create,debounce,defaults,defer,delay,each,escape,every,filter,find,findLast,flatten,flattenDeep,forEach,forOwn,has,head,includes,identity,indexOf,isArguments,isArray,isBoolean,isDate,isEmpty,isEqual,isFinite,isFunction,isNaN,isNull,isNumber,isObject,isRegExp,isString,isUndefined,iteratee,keys,last,map,matches,max,min,mixin,negate,noConflict,noop,once,pick,reduce,remove,result,size,slice,some,sortBy,sumBy,take,tap,throttle,thru,toArray,uniq,uniqBy,uniqueId,value,values \
      --output client/third-party/lodash-custom.js

- For security reasons, we checkin only the resulting `.js` file (but not the `.min.js`) file
into source control (so that you can read the source code and see what it does).
- There are some Gulp plugins that builds Lodash but one seems abandonend (gulp-lodash-builder)
and the other (gulp-lodash-custom) analyzes all .js files, I guess that'd slow down the build
rather much + won't immediately work with Typescript?



Old Code
-----------------------------

In January 2015 I squashed all old 4300+ commits into one single commit,
because in the past I did some mistakes, so it feels better to start over again
from commit number 1. The old commit history is available here:
https://github.com/debiki/debiki-server-old



Credits
-----------------------------

I sometimes copy ideas from [Discourse](http://www.discourse.org/), and look at
its database structure, HTTP requests, and avatar pixel width. Discourse is
forum software.



License
-----------------------------

Currently AGPL — please let me know if you want me to change to GPL, contact info here: https://www.talkyard.io/contact


    Copyright (c) 2010-2018  Kaj Magnus Lindberg and Debiki AB

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.


vim: list et ts=2 sw=2 tw=0 fo=r
