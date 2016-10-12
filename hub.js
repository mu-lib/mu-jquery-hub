(function (modules, root, factory) {
  if (typeof define === "function" && define.amd) {
    define(modules, factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory.apply(root, modules.map(require));
  } else {
    root["mu-jquery-hub/hub"] = factory.apply(root, modules.map(function (m) {
      return this[m] || root[m];
    }, {
        "jquery": root.jQuery
      }));
  }
})(["jquery"], this, function ($) {
  var slice = Array.prototype.slice;

  return function () {
    var args = slice.call(arguments);
    var topics = {};
    var proxied = {};

    function subscribe(add) {
      return function () {
        var self = this;

        return add.apply(self, $.map(arguments, function (arg) {
          proxy = $.proxy(arg, self);
          proxied[proxy.guid] = arg;
          return proxy;
        }));
      }
    }

    function unsubscribe(remove) {
      return function () {
        var self = this;

        return remove.apply(self, $.map(arguments, function (arg) {
          return proxied[arg.guid] || arg;
        }));
      }
    }

    return function (id) {
      var callbacks,
        method,
        topic = id && topics[id];

      if (!topic) {
        callbacks = $.Callbacks.apply(null, args);

        topic = {
          publish: callbacks.fire,
          subscribe: subscribe(callbacks.add),
          unsubscribe: unsubscribe(callbacks.remove)
        };
        if (id) {
          topics[id] = topic;
        }
      }
      return topic;
    }
  }
});
