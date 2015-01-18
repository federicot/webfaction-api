var xmlrpc = require('xmlrpc');
var util = require('util');
var _ = require('underscore');
var q = require('q');

var client = xmlrpc.createSecureClient('https://api.webfaction.com');

var Webfaction = function(username, password) {
  this.username = username;
  this.password = password;
  this.session_id = null;
  this.account = null;
  this.commands = [];
};

/*
 * Helpers
 */

Webfaction.prototype.methodCall = function(method, params) {
  var defer = q.defer();

  if (!params) params = [];
  params.unshift(this.session_id);

  client.methodCall(method, params, function (err, value) {
    if (err) {
        defer.reject(err);
    } else {
        defer.resolve(value);
    }
  });

  return defer.promise
};

/*
 * API - General
 */

Webfaction.prototype.login = function() {
    var defer = q.defer();

    client.methodCall('login', [this.username, this.password], (function (err, value) {
        this.session_id = value[0];
        this.account = value[1];
        if (err) {
            defer.reject(err);
        } else {
            defer.resolve(value);
        }
    }).bind(this));

    return defer.promise;
};

/*
 * API - Domains
 */

Webfaction.prototype.createDomain = function(domain, subdomain) {
  return this.methodCall('create_domain', [domain, subdomain]);
};

Webfaction.prototype.deleteDomain = function(domain, subdomain) {
  return this.methodCall('delete_domain', [], callback);
};

Webfaction.prototype.listDomains = function() {  
  return this.methodCall('list_domains', []);
};

/*
 * API - Applications
 */

Webfaction.prototype.createApp = function(opts) {
  var optionalDefaults = {
    autostart: false,
    extra_info: '',
    open_port: false
  };  
  
  _.defaults(opts, optionalDefaults);
  
  params = [];
  params.push(opts.name);
  params.push(opts.type);

  if (opts.open_port) {
    params.push(opts.autostart);
    params.push(opts.extra_info);
    params.push(opts.open_port);
  } else if (opts.extra_info) {
    params.push(opts.autostart);
    params.push(opts.extra_info);
  } else if (opts.autostart) {
    params.push(opts.autostart);
  }

  return this.methodCall('create_app', params);

};

Webfaction.prototype.deleteApp = function(appName) {
  return this.methodCall('delete_app', [appName]);
};

Webfaction.prototype.listApps = function() {
  return this.methodCall('list_apps', []);
};

Webfaction.prototype.listAppTypes = function() {
  return this.methodCall('list_app_types', []);
};

/*
 * API - Websites
 */

Webfaction.prototype.createWebsite = function(opts) {

  var params = [opts.website_name, opts.ip, opts.https, opts.subdomains];

  opts.site_apps.forEach(function(val) {
    params.push(val);
  });

  return this.methodCall('create_website', params);
};

Webfaction.prototype.updateWebsite = function(opts) {

  var params = [opts.website_name, opts.ip, opts.https, opts.subdomains];

  opts.site_apps.forEach(function(val) {
    params.push(val);
  });

  return this.methodCall('update_website', params);
};

Webfaction.prototype.deleteWebsite = function(opts) {
  var params = [opts.website_name, opts.ip];

  if (opts.https === true) {
    params.push(opts.https);
  }

  return this.methodCall('delete_website', params);
};

Webfaction.prototype.listWebsites = function() {  
  return this.methodCall('list_websites', []);
};

/*
 * API - Cron
 */

Webfaction.prototype.createCronjob = function(line) {  
  return this.methodCall('create_cronjob', [line]);
};

Webfaction.prototype.deleteCronjob = function(line) {  
  return this.methodCall('delete_cronjob', [line]);
};

/*
 * API - Servers
 */

Webfaction.prototype.listIps = function() {  
  return this.methodCall('list_ips', []);
};

Webfaction.prototype.listMachines = function() {  
  return this.methodCall('list_machines', []);
}; 

/*
 * API - Email
 */

/*
 * API - Misc
 */

Webfaction.prototype.system = function() {  
  return this.methodCall('system', []);
}; 

module.exports = Webfaction;
