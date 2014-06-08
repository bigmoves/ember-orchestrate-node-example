// jQuery.ajax promise wrapper
var ajax = window.ajax = function () {
  return ic.ajax.request.apply(null, arguments);
};

// Cookie helpers
var cookies = {
  setItem: function(key, value, expires) {
    document.cookie = key + "=" + value + "; expires=" + new Date(expires) + "; path=/";
  },

  getItem: function(key) {
    var matches = document.cookie.match(new RegExp(key + "=(.*)(;)?"));
    return matches ? matches[1] : null;
  },

  removeItem: function(key) {
    document.cookie = key + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
  },

  clear: function() {
    document.cookie.split(";").forEach(function(cookie) {
      var key = cookie.replace(/=.*/, "");
      this.removeItem(key);
    }.bind(this));
  }
};

App = Ember.Application.create({
  apiToken: cookies.getItem('auth_token')
});

Ember.Application.initializer({
  name: 'Authentication',
  initialize: function(container, app) {
    container.register('session:main', App.SessionController);
    app.inject('controller', 'session', 'session:main');
    app.inject('route', 'session', 'session:main');

    container.register('session:auth', App.Auth);
    app.inject('session:main', 'auth', 'session:auth');
  }
});

App.Router.map(function() {
  this.route('signup');
  this.route('signin');
  this.route('home');
});

App.ApplicationRoute = Ember.Route.extend({
  beforeModel: function() {
    return this.get('session').fetch()
      .catch(function() {
        return;
      });
  },

  actions: {
    signOut: function() {
      this.get('session').close()
        .then(function() {
          window.App.reset();
        }, Ember.RSVP.rethrow);
    }
  }
});

App.IndexRoute = Ember.Route.extend({
  redirect: function() {
    this.transitionTo('home');
  }
});

App.AuthenticatedRoute = Ember.Route.extend({
  redirect: function() {
    if (!this.get('session.isAuthenticated')) {
      this.replaceWith('signin');
    }
  }
});

App.HomeRoute = App.AuthenticatedRoute.extend();

App.SigninRoute = Ember.Route.extend();

App.SignupRoute = Ember.Route.extend();

App.ApplicationController = Ember.Controller.extend();

App.SessionController = Ember.Object.extend({
  isAuthenticated: false,
  currentUser: null,
  afterRedirect: null,

  open: function(credentials) {
    var session = this;
    return this.get('auth').open(credentials, this)
      .then(function(user) {
        session.set('isAuthenticated', true);
        session.set('currentUser', user);
        return user;
      }, Ember.RSVP.reject);
  },

  fetch: function() {
    var session = this;
    return this.get('auth').fetch(this)
      .then(function(user) {
        session.set('isAuthenticated', true);
        session.set('currentUser', user);
        return user;
      }, Ember.RSVP.reject);
  },

  close: function() {
    var session = this;
    return this.get('auth').close(this)
      .then(function() {
        session.set('isAuthenticated', false);
        session.set('currentUser', null);
      }, Ember.RSVP.reject);
  }
});

App.SigninController = Ember.Controller.extend({
  reset: function() {
    this.set('email', null);
    this.set('password', null);
  }.on('init'),

  actions: {
    signIn: function() {
      var credentials = {
        email: this.get('email'),
        password: this.get('password')
      },
      controller = this;

      this.get('session').open(credentials)
      .then(function(user) {
        controller.reset();
        controller.transitionToRoute('home');
      }, function(error) {
        controller.set('notice', 'There was an error with your username or password.');
      });
    }
  }
});

App.SignupController = Ember.Controller.extend({
  reset: function() {
    this.setProperties({
      firstName: null,
      lastName: null,
      email: null,
      password: null
    });
  }.on('init'),

  actions: {
    signUp: function() {
      var data = this.getProperties('firstName', 'lastName','email', 'password'),
          controller = this;

      ajax({
        url: '/signup',
        type: 'POST',
        data: data
      }).then(function() {
        return controller.get('session').open({
          email: data.email,
          password: data.password
        });
      }).then(function(user) {
        Ember.run(function() {
          controller.set('notice', 'Account created!');
          controller.reset();
          controller.transitionToRoute('home');
        });
      }).catch(function() {
        Ember.run(function() {
          controller.set('password', null);
          controller.set('notice', 'Sorry, there was a problem.');
        });
      });
    }
  }
});

App.Auth = Ember.Object.extend({
  open: function(credentials) {
    var auth = this;
    return ajax({
      url: '/signin',
      type: 'POST',
      data: credentials
    }).then(function(data) {
      App.set('apiToken', data.token);
      cookies.setItem('auth_token', data.token, data.expires);
      $.ajaxSetup({
        headers: {
          'x-access-token': data.token
        }
      });
      return data.user;
    });
  },

  fetch: function() {
    var auth = this,
        token = App.get('apiToken');

    if (!token) { return Ember.RSVP.reject(); }

    return ajax({
      url: '/session',
      type: 'POST',
      data: {
        access_token: token
      }
    }).then(function(user) {
      // TODO need to catch error if cannot fetch user form orchestrate
      if (!user) { return Ember.RSVP.reject(); }
      return user;
    });
  },

  close: function() {
    cookies.removeItem('auth_token');
    App.set('apiToken', null);
    $.ajaxSetup({
      headers: {
        'x-access-token': 'none'
      }
    });
    return Ember.RSVP.resolve();
  }
});

Ember.TextField.reopen({
  classNames: ['form-control']
});

// http://alexspeller.com/simple-forms-with-ember/
App.FormFieldComponent = Ember.Component.extend({
  label: function() {
    // this turns camelCased words into Title case
    return this.get('for').underscore().replace(/_/g, " ").capitalize();
  }.property('for')
});
