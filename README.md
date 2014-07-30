# louder
> Syncs streaming music on multiple devices

## Getting Started
Before you begin, please make sure you have both
[npm](https://github.com/npm/npm) and [node](http://nodejs.org/) installed

Download the latest version of louder:
```shell
$ git clone https://github.com/joshjeong/louder.git
```


In the root directory, run:

```shell
$ npm install
```

to install the following dependencies:

  - body-parser: 1.4.3
  - express: 4.6.1
  - indexof: 0.0.1
  - jade: 1.4.2
  - nodemon: ^1.2.1
  - socket.io: 1.0.6
  - underscore: 1.6.


Current build also requires a soundcloud Client ID -
- get one at [soundcloud.com](https://developers.soundcloud.com/)
- create the evnironment file at this path: /public/js/env.js
- add the following code to the environment file:
`CLIENT_ID = "YOUR_API_KEY"`


Load load the application with:
```shell
$ node server.js
```

Alternatively, download and use [nodemon](https://github.com/remy/nodemon) to run the server during development
```shell
$ nodemon server.js
```

When running on a local server, louder will default to port 8080. Visit http://localhost:8080 to start the app
