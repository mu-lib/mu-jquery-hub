(function (modules, root, factory) {
  if (typeof define === "function" && define.amd) {
    define(modules, factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory.call(root);
  } else {
    root["mu-jquery-hub/hub"] = factory.call(root);
  }
})([], this, function () {
  var slice = Array.prototype.slice;

  return function () {
    var $ = this;
    var args = slice.call(arguments);
    var topics = {};
    var proxied = {};

    function subscribe(add) {
      return function () {
        var me = this;

        return add.apply(me, $.map(arguments, function (arg) {
          proxy = $.proxy(arg, me);
          proxied[proxy.guid] = arg;
          return proxy;
        }));
      }
    }

    function unsubscribe(remove) {
      return function () {
        return remove.apply(this, $.map(arguments, function (arg) {
          return proxied[arg.guid] || arg;
        }));
      }
    }

    return function (id) {
      var callbacks;
      var method;
      var topic = id && topics[id];

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
