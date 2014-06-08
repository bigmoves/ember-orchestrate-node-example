##Starter kit for Ember.js and Orchestrate apps

### Features
- JWT token based user authentication
- Twitter Bootstrap

### Prerequisites

- Register for a free [Orchestrate.io](http://orchestrate.io) account and create an application. Once you create an app, make note of the api key on the app's dashboard page.
- You will also need [Node](nodejs.org)

### Getting Started

```
$ git clone git@github.com:chadtmiller/ember-orchestrate.git
$ cd ember-orchestrate
$ npm install
$ ORCHESTRATE_API_KEY=somekey node server.js
```

Then navigate to `http://localhost:3000` in your browser.

By default, new users will be added to a collection called "users".

### Deploying to Heroku

```
$ heroku login
$ rm -rf .git
$ git init
$ git add .
$ git commit -m "init"
$ heroku create
```

After you run `heroku create`, you'll need to add the orchestrate api
key to app's environment variables. To do this, go to you heroku dashboard page 
and find the app you just created. Then go to the settings page and add
ORCHESTRATE_API_KEY and the corresponding key to the Config Variables.

Then run `git push heroku master` to deploy the app to heroku.
