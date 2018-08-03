'use strict';

var TEMPLATE = '<div>\n' + '  <nav class="octotree_sidebar">\n' + '    <a class="octotree_toggle btn">\n' + '      <div class="loader"></div>\n' + '      <span></span>\n' + '\n' + '      <div class="popup">\n' + '        <div class="arrow"></div>\n' + '        <div class="content">\n' + '          Octotree is enabled on this page. Click this button or press\n' + '          <kbd>cmd shift s</kbd> (or <kbd>ctrl shift s</kbd>)\n' + '          to show it.\n' + '        </div>\n' + '      </div>\n' + '    </a>\n' + '\n' + '    <a class="octotree_opts" href="javascript:void(0)">\n' + '      <span></span>\n' + '    </a>\n' + '\n' + '    <div class="octotree_views">\n' + '      <div class="octotree_view octotree_treeview current">\n' + '        <div class="octotree_view_header"></div>\n' + '        <div class="octotree_view_body"></div>\n' + '      </div>\n' + '\n' + '      <div class="octotree_view octotree_errorview">\n' + '        <div class="octotree_view_header"></div>\n' + '        <form class="octotree_view_body">\n' + '          <div class="message"></div>\n' + '          <div>\n' + '            <input name="token" type="text" placeholder="Paste access token here" autocomplete="off">\n' + '          </div>\n' + '          <div>\n' + '            <button type="submit" class="btn">Save</button>\n' + '            <a href="https://github.com/buunguyen/octotree#access-token" target="_blank" tabIndex="-1">Why is this required?</a>\n' + '          </div>\n' + '          <div class="error"></div>\n' + '        </form>\n' + '      </div>\n' + '\n' + '      <div class="octotree_view octotree_optsview">\n' + '        <div class="octotree_view_header">Settings</div>\n' + '        <form class="octotree_view_body">\n' + '          <div>\n' + '            <label>Site access token</label>\n' + '            <a class="octotree_help" href="https://github.com/buunguyen/octotree#settings" target="_blank" tabIndex="-1">\n' + '              <span></span>\n' + '            </a>\n' + '            <input type="text" data-store="TOKEN" data-perhost="true">\n' + '          </div>\n' + '\n' + '          <div>\n' + '            <div>\n' + '              <label>Hotkeys</label>\n' + '            </div>\n' + '            <input type="text" data-store="HOTKEYS">\n' + '          </div>\n' + '\n' + '          <div>\n' + '            <label><input type="checkbox" data-store="ICONS"> Show file-specific icons</label>\n' + '          </div>\n' + '          <div>\n' + '            <label><input type="checkbox" data-store="REMEMBER"> Remember sidebar visibility</label>\n' + '          </div>\n' + '\n' + '          <div>\n' + '            <label><input type="checkbox" data-store="NONCODE"> Show in non-code pages</label>\n' + '          </div>\n' + '\n' + '          <div class="octotree_github_only">\n' + '            <label><input type="checkbox" data-store="LOADALL"> Load entire tree at once</label>\n' + '          </div>\n' + '\n' + '          <div class="octotree_github_only">\n' + '            <label>\n' + '              <input type="checkbox" data-store="PR">\n' + '                Show only pull request changes\n' + '              <span class="octotree_opts_disclaimer">Note: maximum of 300 files</span>\n' + '            </label>\n' + '          </div>\n' + '\n' + '          <div>\n' + '            <button type="submit" class="btn">Save</button>\n' + '          </div>\n' + '\n' + '          <div class="octotree_opts_backing">\n' + '            <span>Feeling awesome? <a href="https://opencollective.com/octotree" target="_blank">Donate</a> to help us continue working on Octotree.</span>\n' + '          </div>\n' + '        </form>\n' + '      </div>\n' + '    </div>\n' + '  </nav>\n' + '</div>\n' + '';
'use strict';

var NODE_PREFIX = 'octotree';
var ADDON_CLASS = 'octotree';
var SHOW_CLASS = 'octotree-show';

var STORE = {
  TOKEN: 'octotree.access_token',
  REMEMBER: 'octotree.remember',
  NONCODE: 'octotree.noncode_shown',
  PR: 'octotree.pr_shown',
  HOTKEYS: 'octotree.hotkeys',
  ICONS: 'octotree.icons',
  LOADALL: 'octotree.loadall',
  POPUP: 'octotree.popup_shown',
  WIDTH: 'octotree.sidebar_width',
  SHOWN: 'octotree.sidebar_shown',
  GHEURLS: 'octotree.gheurls.shared',
  GLEURLS: 'octotree.gleurls.shared'
};

var DEFAULTS = {
  TOKEN: '',
  REMEMBER: true,
  NONCODE: true,
  PR: true,
  LOADALL: true,
  HOTKEYS: '⌘+⇧+s, ⌃+⇧+s',
  ICONS: true,
  POPUP: false,
  WIDTH: 232,
  SHOWN: false,
  GHEURLS: '',
  GLEURLS: ''
};

var EVENT = {
  TOGGLE: 'octotree:toggle',
  LOC_CHANGE: 'octotree:location',
  LAYOUT_CHANGE: 'octotree:layout',
  REQ_START: 'octotree:start',
  REQ_END: 'octotree:end',
  OPTS_CHANGE: 'octotree:change',
  VIEW_READY: 'octotree:ready',
  VIEW_CLOSE: 'octotree:close',
  FETCH_ERROR: 'octotree:error'
};
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Adapter = function () {
  function Adapter(deps, store) {
    _classCallCheck(this, Adapter);

    deps.forEach(function (dep) {
      return window[dep]();
    });
    this._defaultBranch = {};
    this.store = store;
  }

  /**
   * Loads the code tree of a repository.
   * @param {Object} opts: {
   *                  path: the starting path to load the tree,
   *                  repo: the current repository,
   *                  node (optional): the selected node (null to load entire tree),
   *                  token (optional): the personal access token
   *                 }
   * @param {Function} transform(item)
   * @param {Function} cb(err: error, tree: Array[Array|item])
   * @api protected
   */


  _createClass(Adapter, [{
    key: '_loadCodeTreeInternal',
    value: function _loadCodeTreeInternal(opts, transform, cb) {
      var _this = this;

      var folders = { '': [] };
      var $dummyDiv = $('<div/>');
      var path = opts.path,
          repo = opts.repo,
          node = opts.node;


      opts.encodedBranch = opts.encodedBranch || encodeURIComponent(decodeURIComponent(repo.branch));

      this._getTree(path, opts, function (err, tree) {
        if (err) return cb(err);

        _this._getSubmodules(tree, opts, function (err, submodules) {
          if (err) return cb(err);

          submodules = submodules || {};

          var nextChunk = function nextChunk() {
            var iteration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            var CHUNK_SIZE = 300;

            for (var i = 0; i < CHUNK_SIZE; i++) {
              var item = tree[iteration * CHUNK_SIZE + i];

              // we're done
              if (item === undefined) {
                return cb(null, folders['']);
              }

              // runs transform requested by subclass
              if (transform) {
                transform(item);
              }

              // if lazy load and has parent, prefix with parent path
              if (node && node.path) {
                item.path = node.path + '/' + item.path;
              }

              var _path = item.path;
              var type = item.type;
              var index = _path.lastIndexOf('/');
              var name = $dummyDiv.text(_path.substring(index + 1)).html(); // sanitizes, closes #9

              item.id = NODE_PREFIX + _path;
              item.text = name;

              // uses `type` as class name for tree node
              item.icon = type;

              if (type === 'blob') {
                if (_this.store.get(STORE.ICONS)) {
                  var className = FileIcons.getClassWithColor(name);
                  item.icon += ' ' + (className || 'file-generic');
                } else {
                  item.icon += ' file-generic';
                }
              }
              if (item.patch) {
                var patch_html = '';

                switch (item.patch.action) {
                  case 'added':
                    patch_html += '<span class="text-green">added</span>';
                    break;
                  case 'renamed':
                    patch_html += '<span class="text-green" title="' + item.patch.previous + '">renamed</span>';
                    break;
                  case 'removed':
                    patch_html += '<span class="text-red" title="' + item.patch.previous + '">removed</span>';
                    break;
                  default:
                    break;
                }

                if (item.patch.filesChanged) {
                  var fileString = item.patch.filesChanged === 1 ? 'file' : 'files';
                  patch_html += '<span>' + item.patch.filesChanged + ' ' + fileString + '</span>';
                }

                if (item.patch.additions !== 0) {
                  patch_html += '<span class="text-green">+' + item.patch.additions + '</span>';
                }
                if (item.patch.deletions !== 0) {
                  patch_html += '<span class="text-red">-' + item.patch.deletions + '</span>';
                }

                item.text += '<span class="patch">' + patch_html + '</span>';
              }

              if (node) {
                folders[''].push(item);
              } else {
                folders[_path.substring(0, index)].push(item);
              }

              if (type === 'tree' || type === 'blob') {
                if (type === 'tree') {
                  if (node) item.children = true;else folders[item.path] = item.children = [];
                }

                // if item is part of a PR, jump to that file's diff
                if (item.patch && typeof item.patch.diffId === 'number') {
                  var url = _this._getPatchHref(repo, item.patch);
                  item.a_attr = {
                    href: url,
                    'data-download-url': item.url,
                    'data-download-filename': name
                  };
                } else {
                  // encodes but retains the slashes, see #274
                  var encodedPath = _path.split('/').map(encodeURIComponent).join('/');
                  var _url = _this._getItemHref(repo, type, encodedPath, opts.encodedBranch);
                  item.a_attr = {
                    href: _url,
                    'data-download-url': _url,
                    'data-download-filename': name
                  };
                }
              } else if (type === 'commit') {
                var moduleUrl = submodules[item.path];

                if (moduleUrl) {
                  // fixes #105
                  // special handling for submodules hosted in GitHub
                  if (~moduleUrl.indexOf('github.com')) {
                    moduleUrl = moduleUrl.replace(/^git(:\/\/|@)/, window.location.protocol + '//').replace('github.com:', 'github.com/').replace(/.git$/, '');
                    item.text = '<a href="' + moduleUrl + '" class="jstree-anchor">' + name + '</a>\n                               <span>@ </span>\n                               <a href="' + moduleUrl + '/tree/' + item.sha + '" class="jstree-anchor">' + item.sha.substr(0, 7) + '</a>';
                  }
                  item.a_attr = { href: moduleUrl };
                }
              }
            }

            setTimeout(function () {
              return nextChunk(iteration + 1);
            });
          };

          nextChunk();
        });
      });
    }

    /**
     * Generic error handler.
     * @api protected
     */

  }, {
    key: '_handleError',
    value: function _handleError(jqXHR, cb) {
      var error = void 0,
          message = void 0,
          needAuth = void 0;

      switch (jqXHR.status) {
        case 0:
          error = 'Connection error';
          message = 'Cannot connect to website.\n           If your network connection to this website is fine, maybe there is an outage of the API.\n           Please try again later.';
          needAuth = false;
          break;
        case 206:
          error = 'Repo too large';
          message = 'This repository is too large to be retrieved at once.\n           If you frequently work with this repository, go to Settings and uncheck the "Load entire tree at once" option.';
          break;
        case 401:
          error = 'Invalid token';
          message = 'The token is invalid.\n           Follow <a href="' + this.getCreateTokenUrl() + '" target="_blank">this link</a>\n           to create a new token and paste it below.';
          needAuth = true;
          break;
        case 409:
          error = 'Empty repository';
          message = 'This repository is empty.';
          break;
        case 404:
          error = 'Private repository';
          message = 'Accessing private repositories requires an access token.\n           Follow <a href="' + this.getCreateTokenUrl() + '" target="_blank">this link</a>\n           to create one and paste it below.';
          needAuth = true;
          break;
        case 403:
          if (~jqXHR.getAllResponseHeaders().indexOf('X-RateLimit-Remaining: 0')) {
            // It's kinda specific for GitHub
            error = 'API limit exceeded';
            message = 'You have exceeded the GitHub API hourly limit and need GitHub access token\n             to make extra requests. Follow <a href="' + this.getCreateTokenUrl() + '" target="_blank">this link</a>\n             to create one and paste it below.';
            needAuth = true;
            break;
          } else {
            error = 'Forbidden';
            message = 'You are not allowed to access the API.\n             You might need to provide an access token.\n             Follow <a href="' + this.getCreateTokenUrl() + '" target="_blank">this link</a>\n             to create one and paste it below.';
            needAuth = true;
            break;
          }
        default:
          error = message = jqXHR.statusText;
          needAuth = false;
          break;
      }
      cb({
        error: 'Error: ' + error,
        message: message,
        needAuth: needAuth
      });
    }

    /**
     * Returns the CSS class to be added to the Octotree sidebar.
     * @api protected
     */

  }, {
    key: '_getCssClass',
    value: function _getCssClass() {
      throw new Error('Not implemented');
    }

    /**
     * Returns the minimum width acceptable for the sidebar.
     * @api protected
     */

  }, {
    key: '_getMinWidth',
    value: function _getMinWidth() {
      return 200;
    }

    /**
     * Inits behaviors after the sidebar is added to the DOM.
     * @api public
     */

  }, {
    key: 'init',
    value: function init($sidebar) {
      $sidebar.resizable({ handles: 'e', minWidth: this._getMinWidth() }).addClass(this._getCssClass());
    }

    /**
     * Returns whether the adapter is capable of loading the entire tree in
     * a single request. This is usually determined by the underlying the API.
     * @api public
     */

  }, {
    key: 'canLoadEntireTree',
    value: function canLoadEntireTree() {
      return false;
    }

    /**
     * Loads the code tree.
     * @api public
     */

  }, {
    key: 'loadCodeTree',
    value: function loadCodeTree(opts, cb) {
      throw new Error('Not implemented');
    }

    /**
     * Returns the URL to create a personal access token.
     * @api public
     */

  }, {
    key: 'getCreateTokenUrl',
    value: function getCreateTokenUrl() {
      throw new Error('Not implemented');
    }

    /**
     * Updates the layout based on sidebar visibility and width.
     * @api public
     */

  }, {
    key: 'updateLayout',
    value: function updateLayout(togglerVisible, sidebarVisible, sidebarWidth) {
      throw new Error('Not implemented');
    }

    /**
     * Returns repo info at the current path.
     * @api public
     */

  }, {
    key: 'getRepoFromPath',
    value: function getRepoFromPath(token, cb) {
      throw new Error('Not implemented');
    }

    /**
     * Selects the file at a specific path.
     * @api public
     */

  }, {
    key: 'selectFile',
    value: function selectFile(path) {
      window.location.href = path;
    }

    /**
     * Selects a submodule.
     * @api public
     */

  }, {
    key: 'selectSubmodule',
    value: function selectSubmodule(path) {
      window.location.href = path;
    }

    /**
     * Opens file or submodule in a new tab.
     * @api public
     */

  }, {
    key: 'openInNewTab',
    value: function openInNewTab(path) {
      window.open(path, '_blank').focus();
    }

    /**
     * Downloads a file.
     * @api public
     */

  }, {
    key: 'downloadFile',
    value: function downloadFile(path, fileName) {
      var link = document.createElement('a');
      link.setAttribute('href', path.replace(/\/blob\/|\/src\//, '/raw/'));
      link.setAttribute('download', fileName);
      link.click();
    }

    /**
     * Gets tree at path.
     * @param {Object} opts - {token, repo}
     * @api protected
     */

  }, {
    key: '_getTree',
    value: function _getTree(path, opts, cb) {
      throw new Error('Not implemented');
    }

    /**
     * Gets submodules in the tree.
     * @param {Object} opts - {token, repo, encodedBranch}
     * @api protected
     */

  }, {
    key: '_getSubmodules',
    value: function _getSubmodules(tree, opts, cb) {
      throw new Error('Not implemented');
    }

    /**
     * Returns item's href value.
     * @api protected
     */

  }, {
    key: '_getItemHref',
    value: function _getItemHref(repo, type, encodedPath, encodedBranch) {
      return '/' + repo.username + '/' + repo.reponame + '/' + type + '/' + encodedBranch + '/' + encodedPath;
    }
    /**
     * Returns patch's href value.
     * @api protected
     */

  }, {
    key: '_getPatchHref',
    value: function _getPatchHref(repo, patch) {
      return '/' + repo.username + '/' + repo.reponame + '/pull/' + repo.pullNumber + '/files#diff-' + patch.diffId;
    }
  }]);

  return Adapter;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var PjaxAdapter = function (_Adapter) {
  _inherits(PjaxAdapter, _Adapter);

  function PjaxAdapter(store) {
    _classCallCheck(this, PjaxAdapter);

    var _this = _possibleConstructorReturn(this, (PjaxAdapter.__proto__ || Object.getPrototypeOf(PjaxAdapter)).call(this, ['jquery.pjax.js'], store));

    $(document).on('pjax:start', function () {
      return $(document).trigger(EVENT.REQ_START);
    }).on('pjax:end', function () {
      return $(document).trigger(EVENT.REQ_END);
    }).on('pjax:timeout', function (e) {
      return e.preventDefault();
    });
    return _this;
  }

  // @override
  // @param {Object} opts - {pjaxContainer: the specified pjax container}
  // @api public


  _createClass(PjaxAdapter, [{
    key: 'init',
    value: function init($sidebar, opts) {
      _get(PjaxAdapter.prototype.__proto__ || Object.getPrototypeOf(PjaxAdapter.prototype), 'init', this).call(this, $sidebar);

      opts = opts || {};
      var pjaxContainer = opts.pjaxContainer;

      if (!window.MutationObserver) return;

      // Some host switch pages using pjax. This observer detects if the pjax container
      // has been updated with new contents and trigger layout.
      var pageChangeObserver = new window.MutationObserver(function () {
        // Trigger location change, can't just relayout as Octotree might need to
        // hide/show depending on whether the current page is a code page or not.
        return $(document).trigger(EVENT.LOC_CHANGE);
      });

      if (pjaxContainer) {
        pageChangeObserver.observe(pjaxContainer, {
          childList: true
        });
      } else {
        var _detectLocChange = function _detectLocChange() {
          if (location.href !== href || location.hash !== hash) {
            href = location.href;
            hash = location.hash;

            // If this is the first time this is called, no need to notify change as
            // Octotree does its own initialization after loading options.
            if (firstLoad) {
              firstLoad = false;
            } else {
              setTimeout(function () {
                $(document).trigger(EVENT.LOC_CHANGE);
              }, 300); // Wait a bit for pjax DOM change
            }
          }
          setTimeout(_detectLocChange, 200);
        };

        // Fall back if DOM has been changed
        var firstLoad = true,
            href = void 0,
            hash = void 0;

        _detectLocChange();
      }
    }

    // @override
    // @param {Object} opts - {$pjax_container: jQuery object}
    // @api public

  }, {
    key: 'selectFile',
    value: function selectFile(path, opts) {
      opts = opts || {};
      var $pjaxContainer = opts.$pjaxContainer;

      // if we're on the same page and just navigating to a different anchor
      // don't bother fetching the page with pjax
      var pathWithoutAnchor = path.replace(/#.*$/, '');
      var isSamePage = location.pathname === pathWithoutAnchor;
      var loadWithPjax = $pjaxContainer.length && !isSamePage;

      if (loadWithPjax) {
        $.pjax({
          // needs full path for pjax to work with Firefox as per cross-domain-content setting
          url: location.protocol + '//' + location.host + path,
          container: $pjaxContainer,
          timeout: 0 // global timeout doesn't seem to work, use this instead
        });
      } else {
        _get(PjaxAdapter.prototype.__proto__ || Object.getPrototypeOf(PjaxAdapter.prototype), 'selectFile', this).call(this, path);
      }
    }
  }]);

  return PjaxAdapter;
}(Adapter);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var BB_RESERVED_USER_NAMES = ['account', 'dashboard', 'integrations', 'product', 'repo', 'snippets', 'support', 'whats-new'];
var BB_RESERVED_REPO_NAMES = [];
var BB_RESERVED_TYPES = ['raw'];
var BB_404_SEL = '#error.404';
var BB_PJAX_CONTAINER_SEL = '#source-container';

var Bitbucket = function (_PjaxAdapter) {
  _inherits(Bitbucket, _PjaxAdapter);

  function Bitbucket() {
    _classCallCheck(this, Bitbucket);

    return _possibleConstructorReturn(this, (Bitbucket.__proto__ || Object.getPrototypeOf(Bitbucket)).apply(this, arguments));
  }

  _createClass(Bitbucket, [{
    key: 'init',


    // @override
    value: function init($sidebar) {
      var pjaxContainer = $(BB_PJAX_CONTAINER_SEL)[0];
      _get(Bitbucket.prototype.__proto__ || Object.getPrototypeOf(Bitbucket.prototype), 'init', this).call(this, $sidebar, { 'pjaxContainer': pjaxContainer });
    }

    // @override

  }, {
    key: '_getCssClass',
    value: function _getCssClass() {
      return 'octotree_bitbucket_sidebar';
    }

    // @override

  }, {
    key: 'getCreateTokenUrl',
    value: function getCreateTokenUrl() {
      return location.protocol + '//' + location.host + '/account/admin/app-passwords/new';
    }

    // @override

  }, {
    key: 'updateLayout',
    value: function updateLayout(togglerVisible, sidebarVisible, sidebarWidth) {
      $('.octotree_toggle').css('right', sidebarVisible ? '' : -44);
      $('.aui-header').css('padding-left', sidebarVisible ? '' : 56);
      $('html').css('padding-left', sidebarVisible ? sidebarWidth : '');
      $('#adg3-navigation > div > div:first-child > div').css('left', sidebarVisible ? sidebarWidth : '');
    }

    // @override

  }, {
    key: 'getRepoFromPath',
    value: function getRepoFromPath(currentRepo, token, cb) {
      var _this2 = this;

      // 404 page, skip
      if ($(BB_404_SEL).length) {
        return cb();
      }

      // (username)/(reponame)[/(type)]
      var match = window.location.pathname.match(/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?/);
      if (!match) {
        return cb();
      }

      var username = match[1];
      var reponame = match[2];
      var type = match[3];

      // Not a repository, skip
      if (~BB_RESERVED_USER_NAMES.indexOf(username) || ~BB_RESERVED_REPO_NAMES.indexOf(reponame) || ~BB_RESERVED_TYPES.indexOf(type)) {
        return cb();
      }

      // Skip non-code page unless showInNonCodePage is true
      // with Bitbucket /username/repo is non-code page
      var showInNonCodePage = this.store.get(STORE.NONCODE);
      if (!showInNonCodePage && (!type || type && type !== 'src')) {
        return cb();
      }

      // Get branch by inspecting page, quite fragile so provide multiple fallbacks
      var BB_BRANCH_SEL_1 = '.branch-dialog-trigger';

      var branch =
      // Code page
      $(BB_BRANCH_SEL_1).attr('title') ||
      // Assume same with previously
      currentRepo.username === username && currentRepo.reponame === reponame && currentRepo.branch ||
      // Default from cache
      this._defaultBranch[username + '/' + reponame];

      var repo = { username: username, reponame: reponame, branch: branch };

      if (repo.branch) {
        cb(null, repo);
      } else {
        this._get('/main-branch', { repo: repo, token: token }, function (err, data) {
          if (err) return cb(err);
          repo.branch = _this2._defaultBranch[username + '/' + reponame] = data.name || 'master';
          cb(null, repo);
        });
      }
    }

    // @override

  }, {
    key: 'selectFile',
    value: function selectFile(path) {
      var $pjaxContainer = $(BB_PJAX_CONTAINER_SEL);
      _get(Bitbucket.prototype.__proto__ || Object.getPrototypeOf(Bitbucket.prototype), 'selectFile', this).call(this, path, { '$pjaxContainer': $pjaxContainer });
    }

    // @override

  }, {
    key: 'loadCodeTree',
    value: function loadCodeTree(opts, cb) {
      opts.path = opts.node.path;
      this._loadCodeTreeInternal(opts, function (item) {
        if (!item.type) {
          item.type = 'blob';
        }
      }, cb);
    }

    // @override

  }, {
    key: '_getTree',
    value: function _getTree(path, opts, cb) {
      this._get('/src/' + opts.repo.branch + '/' + path, opts, function (err, res) {
        if (err) return cb(err);
        var directories = res.directories.map(function (dir) {
          return { path: dir, type: 'tree' };
        });
        res.files.forEach(function (file) {
          if (file.path.startsWith(res.path)) {
            file.path = file.path.substring(res.path.length);
          }
        });
        var tree = res.files.concat(directories);
        cb(null, tree);
      });
    }

    // @override

  }, {
    key: '_getSubmodules',
    value: function _getSubmodules(tree, opts, cb) {
      var _this3 = this;

      if (opts.repo.submodules) {
        return this._getSubmodulesInCurrentPath(tree, opts, cb);
      }

      var item = tree.filter(function (item) {
        return (/^\.gitmodules$/i.test(item.path)
        );
      })[0];
      if (!item) return cb();

      this._get('/src/' + opts.encodedBranch + '/' + item.path, opts, function (err, res) {
        if (err) return cb(err);
        // Memoize submodules so that they will be inserted into the tree later.
        opts.repo.submodules = parseGitmodules(res.data);
        _this3._getSubmodulesInCurrentPath(tree, opts, cb);
      });
    }

    // @override

  }, {
    key: '_getSubmodulesInCurrentPath',
    value: function _getSubmodulesInCurrentPath(tree, opts, cb) {
      var currentPath = opts.path;
      var isInCurrentPath = currentPath ? function (path) {
        return path.startsWith(currentPath + '/');
      } : function (path) {
        return path.indexOf('/') === -1;
      };

      var submodules = opts.repo.submodules;
      var submodulesInCurrentPath = {};
      Object.keys(submodules).filter(isInCurrentPath).forEach(function (key) {
        submodulesInCurrentPath[key] = submodules[key];
      });

      // Insert submodules in current path into the tree because submodules can not
      // be retrieved with Bitbucket API but can only by reading .gitmodules.
      Object.keys(submodulesInCurrentPath).forEach(function (path) {
        if (currentPath) {
          // `currentPath` is prefixed to `path`, so delete it.
          path = path.substring(currentPath.length + 1);
        }
        tree.push({ path: path, type: 'commit' });
      });
      cb(null, submodulesInCurrentPath);
    }

    // @override

  }, {
    key: '_get',
    value: function _get(path, opts, cb) {
      var _this4 = this;

      var host = location.protocol + '//' + 'api.bitbucket.org/1.0';
      var url = host + '/repositories/' + opts.repo.username + '/' + opts.repo.reponame + (path || '');
      var cfg = { url: url, method: 'GET', cache: false };

      if (opts.token) {
        // Bitbucket App passwords can be used only for Basic Authentication.
        // Get username of logged-in user.
        var username = null,
            token = null;

        // Or get username by spliting token.
        if (opts.token.includes(':')) {
          var result = opts.token.split(':');
          username = result[0], token = result[1];
        } else {
          var currentUser = JSON.parse($('meta').attr('data-current-user'));
          if (!currentUser || !currentUser.username) {
            return cb({
              error: 'Error: Invalid token',
              message: 'Cannot retrieve your user name from the current page.\n                      Please update the token setting to prepend your user\n                      name to the token, separated by a colon, i.e. USERNAME:TOKEN',
              needAuth: true
            });
          }
          username = currentUser.username, token = opts.token;
        }
        cfg.headers = { Authorization: 'Basic ' + btoa(username + ':' + token) };
      }

      $.ajax(cfg).done(function (data) {
        return cb(null, data);
      }).fail(function (jqXHR) {
        _this4._handleError(jqXHR, cb);
      });
    }

    // @override

  }, {
    key: '_getItemHref',
    value: function _getItemHref(repo, type, encodedPath, encodedBranch) {
      return '/' + repo.username + '/' + repo.reponame + '/src/' + encodedBranch + '/' + encodedPath;
    }
  }]);

  return Bitbucket;
}(PjaxAdapter);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GH_RESERVED_USER_NAMES = ['settings', 'orgs', 'organizations', 'site', 'blog', 'about', 'explore', 'styleguide', 'showcases', 'trending', 'stars', 'dashboard', 'notifications', 'search', 'developer', 'account', 'pulls', 'issues', 'features', 'contact', 'security', 'join', 'login', 'watching', 'new', 'integrations', 'gist', 'business', 'mirrors', 'open-source', 'personal', 'pricing'];
var GH_RESERVED_REPO_NAMES = ['followers', 'following', 'repositories'];
var GH_404_SEL = '#parallax_wrapper';
var GH_PJAX_CONTAINER_SEL = '#js-repo-pjax-container, .context-loader-container, [data-pjax-container]';
var GH_CONTAINERS = '.container, .container-lg, .container-responsive';
var GH_RAW_CONTENT = 'body > pre';

var GitHub = function (_PjaxAdapter) {
  _inherits(GitHub, _PjaxAdapter);

  function GitHub(store) {
    _classCallCheck(this, GitHub);

    return _possibleConstructorReturn(this, (GitHub.__proto__ || Object.getPrototypeOf(GitHub)).call(this, store));
  }

  // @override


  _createClass(GitHub, [{
    key: 'init',
    value: function init($sidebar) {
      var pjaxContainer = $(GH_PJAX_CONTAINER_SEL)[0];
      _get(GitHub.prototype.__proto__ || Object.getPrototypeOf(GitHub.prototype), 'init', this).call(this, $sidebar, { 'pjaxContainer': pjaxContainer });

      // Fix #151 by detecting when page layout is updated.
      // In this case, split-diff page has a wider layout, so need to recompute margin.
      // Note that couldn't do this in response to URL change, since new DOM via pjax might not be ready.
      var diffModeObserver = new window.MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          if (~mutation.oldValue.indexOf('split-diff') || ~mutation.target.className.indexOf('split-diff')) {
            return $(document).trigger(EVENT.LAYOUT_CHANGE);
          }
        });
      });

      diffModeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true
      });
    }

    // @override

  }, {
    key: '_getCssClass',
    value: function _getCssClass() {
      return 'octotree_github_sidebar';
    }

    // @override

  }, {
    key: 'canLoadEntireTree',
    value: function canLoadEntireTree() {
      return true;
    }

    // @override

  }, {
    key: 'getCreateTokenUrl',
    value: function getCreateTokenUrl() {
      return location.protocol + '//' + location.host + '/settings/tokens/new?scopes=repo&description=Octotree%20browser%20extension';
    }

    // @override

  }, {
    key: 'updateLayout',
    value: function updateLayout(togglerVisible, sidebarVisible, sidebarWidth) {
      var SPACING = 10;
      var $containers = $(GH_CONTAINERS);
      var autoMarginLeft = ($(document).width() - $containers.width()) / 2;
      var shouldPushLeft = sidebarVisible && autoMarginLeft <= sidebarWidth + SPACING;

      $('html').css('margin-left', shouldPushLeft ? sidebarWidth : '');
      $containers.css('margin-left', shouldPushLeft ? SPACING : '');
    }

    // @override

  }, {
    key: 'getRepoFromPath',
    value: function getRepoFromPath(currentRepo, token, cb) {
      var _this2 = this;

      var showInNonCodePage = this.store.get(STORE.NONCODE);
      var showOnlyChangedInPR = this.store.get(STORE.PR);

      // 404 page, skip
      if ($(GH_404_SEL).length) {
        return cb();
      }

      // Skip raw page
      if ($(GH_RAW_CONTENT).length) {
        return cb();
      }

      // (username)/(reponame)[/(type)][/(typeId)]
      var match = window.location.pathname.match(/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/);
      if (!match) {
        return cb();
      }

      var username = match[1];
      var reponame = match[2];
      var type = match[3];
      var typeId = match[4];

      // Not a repository, skip
      if (~GH_RESERVED_USER_NAMES.indexOf(username) || ~GH_RESERVED_REPO_NAMES.indexOf(reponame)) {
        return cb();
      }

      // Check if this is a PR and whether we should show changes
      var isPR = type === 'pull';
      var pullNumber = isPR && showOnlyChangedInPR ? typeId : null;

      // Skip non-code page unless showInNonCodePage is true
      if (!showInNonCodePage && type && !~['tree', 'blob'].indexOf(type)) {
        return cb();
      }

      // Get branch by inspecting page, quite fragile so provide multiple fallbacks
      var branch =
      // Code page
      $('.branch-select-menu .select-menu-item.selected').data('name') ||
      // Pull requests page
      ($('.commit-ref.base-ref').attr('title') || ':').match(/:(.*)/)[1] ||
      // Reuse last selected branch if exist
      currentRepo.username === username && currentRepo.reponame === reponame && currentRepo.branch ||
      // Get default branch from cache
      this._defaultBranch[username + '/' + reponame];

      // Still no luck, get default branch for real
      var repo = { username: username, reponame: reponame, branch: branch, pullNumber: pullNumber };
      if (repo.branch) {
        cb(null, repo);
      } else {
        this._get(null, { repo: repo, token: token }, function (err, data) {
          if (err) return cb(err);
          repo.branch = _this2._defaultBranch[username + '/' + reponame] = data.default_branch || 'master';
          cb(null, repo);
        });
      }
    }

    // @override

  }, {
    key: 'selectFile',
    value: function selectFile(path) {
      var $pjaxContainer = $(GH_PJAX_CONTAINER_SEL);
      _get(GitHub.prototype.__proto__ || Object.getPrototypeOf(GitHub.prototype), 'selectFile', this).call(this, path, { '$pjaxContainer': $pjaxContainer });
    }

    // @override

  }, {
    key: 'loadCodeTree',
    value: function loadCodeTree(opts, cb) {
      opts.encodedBranch = encodeURIComponent(decodeURIComponent(opts.repo.branch));
      opts.path = opts.node && (opts.node.sha || opts.encodedBranch) || opts.encodedBranch + '?recursive=1';
      this._loadCodeTreeInternal(opts, null, cb);
    }

    // @override

  }, {
    key: '_getTree',
    value: function _getTree(path, opts, cb) {
      if (opts.repo.pullNumber) {
        this._getPatch(opts, cb);
      } else {
        this._get('/git/trees/' + path, opts, function (err, res) {
          // console.log('****', res.tree);
          if (err) cb(err);else cb(null, res.tree);
        });
      }
    }

    /**
     * Get files that were patched in Pull Request.
     * The diff map that is returned contains changed files, as well as the parents of the changed files.
     * This allows the tree to be filtered for only folders that contain files with diffs.
     * @param {Object} opts: {
     *                  path: the starting path to load the tree,
     *                  repo: the current repository,
     *                  node (optional): the selected node (null to load entire tree),
     *                  token (optional): the personal access token
     *                 }
     * @param {Function} cb(err: error, diffMap: Object)
     */

  }, {
    key: '_getPatch',
    value: function _getPatch(opts, cb) {
      var pullNumber = opts.repo.pullNumber;


      this._get('/pulls/' + pullNumber + '/files?per_page=300', opts, function (err, res) {
        if (err) cb(err);else {
          var diffMap = {};

          res.forEach(function (file, index) {

            // record file patch info
            diffMap[file.filename] = {
              type: 'blob',
              diffId: index,
              action: file.status,
              additions: file.additions,
              blob_url: file.blob_url,
              deletions: file.deletions,
              filename: file.filename,
              path: file.path,
              sha: file.sha

              // record ancestor folders
            };var folderPath = file.filename.split('/').slice(0, -1).join('/');
            var split = folderPath.split('/');

            // aggregate metadata for ancestor folders
            split.reduce(function (path, curr) {
              if (path.length) path = path + '/' + curr;else path = '' + curr;

              if (diffMap[path] == null) {
                diffMap[path] = {
                  type: 'tree',
                  filename: path,
                  filesChanged: 1,
                  additions: file.additions,
                  deletions: file.deletions
                };
              } else {
                diffMap[path].additions += file.additions;
                diffMap[path].deletions += file.deletions;
                diffMap[path].filesChanged++;
              }
              return path;
            }, '');
          });

          // transform to emulate response from get `tree`
          var tree = Object.keys(diffMap).map(function (fileName) {
            var patch = diffMap[fileName];
            return {
              patch: patch,
              path: fileName,
              sha: patch.sha,
              type: patch.type,
              url: patch.blob_url
            };
          });

          // sort by path, needs to be alphabetical order (so parent folders come before children)
          // note: this is still part of the above transform to mimic the behavior of get tree
          tree.sort(function (a, b) {
            return a.path.localeCompare(b.path);
          });

          cb(null, tree);
        }
      });
    }

    // @override

  }, {
    key: '_getSubmodules',
    value: function _getSubmodules(tree, opts, cb) {
      var item = tree.filter(function (item) {
        return (/^\.gitmodules$/i.test(item.path)
        );
      })[0];
      if (!item) return cb();

      this._get('/git/blobs/' + item.sha, opts, function (err, res) {
        if (err) return cb(err);
        var data = atob(res.content.replace(/\n/g, ''));
        cb(null, parseGitmodules(data));
      });
    }
  }, {
    key: '_get',
    value: function _get(path, opts, cb) {
      var _this3 = this;

      var host = location.protocol + '//' + (location.host === 'github.com' ? 'api.github.com' : location.host + '/api/v3');
      var url = host + '/repos/' + opts.repo.username + '/' + opts.repo.reponame + (path || '');
      var cfg = { url: url, method: 'GET', cache: false };

      if (opts.token) {
        cfg.headers = { Authorization: 'token ' + opts.token };
      }

      $.ajax(cfg).done(function (data) {
        if (path && path.indexOf('/git/trees') === 0 && data.truncated) {
          _this3._handleError({ status: 206 }, cb);
        } else cb(null, data);
      }).fail(function (jqXHR) {
        return _this3._handleError(jqXHR, cb);
      });
    }
  }]);

  return GitHub;
}(PjaxAdapter);
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HelpPopup = function () {
  function HelpPopup($dom, store) {
    _classCallCheck(this, HelpPopup);

    this.$view = $dom.find('.popup');
    this.store = store;
  }

  _createClass(HelpPopup, [{
    key: 'init',
    value: function init() {
      var $view = this.$view;
      var store = this.store;
      var popupShown = store.get(STORE.POPUP);
      var sidebarVisible = $('html').hasClass(SHOW_CLASS);

      if (popupShown || sidebarVisible) {
        return hideAndDestroy();
      }

      $(document).one(EVENT.TOGGLE, hideAndDestroy);

      setTimeout(function () {
        setTimeout(hideAndDestroy, 6000);
        $view.addClass('show').click(hideAndDestroy);
      }, 500);

      function hideAndDestroy() {
        store.set(STORE.POPUP, true);
        if ($view.hasClass('show')) {
          $view.removeClass('show').one('transitionend', function () {
            return $view.remove();
          });
        } else {
          $view.remove();
        }
      }
    }
  }]);

  return HelpPopup;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ErrorView = function () {
  function ErrorView($dom, store) {
    _classCallCheck(this, ErrorView);

    this.store = store;
    this.$view = $dom.find('.octotree_errorview').submit(this._saveToken.bind(this));
  }

  _createClass(ErrorView, [{
    key: 'show',
    value: function show(err) {
      var $token = this.$view.find('input[name="token"]');
      var $submit = this.$view.find('button[type="submit"]');
      var $help = $submit.next();
      var token = this.store.get(STORE.TOKEN);

      this.$view.find('.octotree_view_header').html(err.error);
      this.$view.find('.message').html(err.message);

      if (err.needAuth) {
        $submit.show();
        $token.show();
        $help.show();
        if (token) $token.val(token);
      } else {
        $submit.hide();
        $token.hide();
        $help.hide();
      }

      $(this).trigger(EVENT.VIEW_READY);
    }
  }, {
    key: '_saveToken',
    value: function _saveToken(event) {
      var _this = this;

      event.preventDefault();

      var $error = this.$view.find('.error').text('');
      var $token = this.$view.find('[name="token"]');
      var oldToken = this.store.get(STORE.TOKEN);
      var newToken = $token.val();

      if (!newToken) return $error.text('Token is required');

      this.store.set(STORE.TOKEN, newToken, function () {
        var changes = _defineProperty({}, STORE.TOKEN, [oldToken, newToken]);
        $(_this).trigger(EVENT.OPTS_CHANGE, changes);
        $token.val('');
      });
    }
  }]);

  return ErrorView;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TreeView = function () {
  function TreeView($dom, store, adapter) {
    var _this = this;

    _classCallCheck(this, TreeView);

    this.store = store;
    this.adapter = adapter;
    this.$view = $dom.find('.octotree_treeview');
    this.$tree = this.$view.find('.octotree_view_body').on('click.jstree', '.jstree-open>a', function (_ref) {
      var target = _ref.target;
      return _this.$jstree.close_node(target);
    }).on('click.jstree', '.jstree-closed>a', function (_ref2) {
      var target = _ref2.target;
      return _this.$jstree.open_node(target);
    }).on('click', this._onItemClick.bind(this)).jstree({
      core: { multiple: false, worker: false, themes: { responsive: false } },
      plugins: ['wholerow']
    });
  }

  _createClass(TreeView, [{
    key: 'show',
    value: function show(repo, token) {
      var _this2 = this;

      var $jstree = this.$jstree;

      $jstree.settings.core.data = function (node, cb) {
        var prMode = _this2.store.get(STORE.PR) && repo.pullNumber;
        var loadAll = _this2.adapter.canLoadEntireTree() && (prMode || _this2.store.get(STORE.LOADALL));

        node = !loadAll && (node.id === '#' ? { path: '' } : node.original);

        _this2.adapter.loadCodeTree({ repo: repo, token: token, node: node }, function (err, treeData) {
          if (err) {
            $(_this2).trigger(EVENT.FETCH_ERROR, [err]);
          } else {
            treeData = _this2._sort(treeData);
            if (loadAll) {
              treeData = _this2._collapse(treeData);
            }
            cb(treeData);
          }
        });
      };

      this.$tree.one('refresh.jstree', function () {
        _this2.syncSelection();
        $(_this2).trigger(EVENT.VIEW_READY);
      });

      this._showHeader(repo);
      $jstree.refresh(true);
    }
  }, {
    key: '_showHeader',
    value: function _showHeader(repo) {
      var adapter = this.adapter;

      this.$view.find('.octotree_view_header').html('<div class="octotree_header_repo">' + '<a href="/' + repo.username + '">' + repo.username + '</a>' + ' / ' + '<a data-pjax href="/' + repo.username + '/' + repo.reponame + '">' + repo.reponame + '</a>' + '</div>' + '<div class="octotree_header_branch">' + this._deXss(repo.branch.toString()) + '</div>').on('click', 'a[data-pjax]', function (event) {
        event.preventDefault();
        var href = $(this).attr('href'); /* a.href always return absolute URL, don't want that */
        var newTab = event.shiftKey || event.ctrlKey || event.metaKey;
        newTab ? adapter.openInNewTab(href) : adapter.selectFile(href);
      });
    }
  }, {
    key: '_deXss',
    value: function _deXss(str) {
      return str && str.replace(/[<>'"&]/g, '-');
    }
  }, {
    key: '_sort',
    value: function _sort(folder) {
      var _this3 = this;

      folder.sort(function (a, b) {
        if (a.type === b.type) return a.text === b.text ? 0 : a.text < b.text ? -1 : 1;
        return a.type === 'blob' ? 1 : -1;
      });

      folder.forEach(function (item) {
        if (item.type === 'tree' && item.children !== true && item.children.length > 0) {
          _this3._sort(item.children);
        }
      });

      return folder;
    }
  }, {
    key: '_collapse',
    value: function _collapse(folder) {
      var _this4 = this;

      return folder.map(function (item) {
        if (item.type === 'tree') {
          item.children = _this4._collapse(item.children);
          if (item.children.length === 1 && item.children[0].type === 'tree') {
            var onlyChild = item.children[0];
            onlyChild.text = item.text + '/' + onlyChild.text;
            return onlyChild;
          }
        }
        return item;
      });
    }
  }, {
    key: '_onItemClick',
    value: function _onItemClick(event) {
      var _this5 = this;

      var $target = $(event.target);
      var download = false;

      // handle middle click
      if (event.which === 2) return;

      // handle icon click, fix #122
      if ($target.is('i.jstree-icon')) {
        $target = $target.parent();
        download = true;
      }

      if (!$target.is('a.jstree-anchor')) return;

      // refocus after complete so that keyboard navigation works, fix #158
      var refocusAfterCompletion = function refocusAfterCompletion() {
        $(document).one('pjax:success page:load', function () {
          _this5.$jstree.get_container().focus();
        });
      };

      var adapter = this.adapter;
      var newTab = event.shiftKey || event.ctrlKey || event.metaKey;
      var href = $target.attr('href');
      var $icon = $target.children().length ? $target.children(':first') : $target.siblings(':first'); // handles child links in submodule

      if ($icon.hasClass('commit')) {
        refocusAfterCompletion();
        newTab ? adapter.openInNewTab(href) : adapter.selectSubmodule(href);
      } else if ($icon.hasClass('blob')) {
        if (download) {
          var downloadUrl = $target.attr('data-download-url');
          var downloadFileName = $target.attr('data-download-filename');
          adapter.downloadFile(downloadUrl, downloadFileName);
        } else {
          refocusAfterCompletion();
          newTab ? adapter.openInNewTab(href) : adapter.selectFile(href);
        }
      }
    }
  }, {
    key: 'syncSelection',
    value: function syncSelection() {
      var $jstree = this.$jstree;
      if (!$jstree) return;

      // converts /username/reponame/object_type/branch/path to path
      var path = decodeURIComponent(location.pathname);
      var match = path.match(/(?:[^\/]+\/){4}(.*)/);
      if (!match) return;

      var currentPath = match[1];
      var loadAll = this.adapter.canLoadEntireTree() && this.store.get(STORE.LOADALL);

      selectPath(loadAll ? [currentPath] : breakPath(currentPath));

      // converts ['a/b'] to ['a', 'a/b']
      function breakPath(fullPath) {
        return fullPath.split('/').reduce(function (res, path, idx) {
          res.push(idx === 0 ? path : res[idx - 1] + '/' + path);
          return res;
        }, []);
      }

      function selectPath(paths) {
        var index = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        var nodeId = NODE_PREFIX + paths[index];

        if ($jstree.get_node(nodeId)) {
          $jstree.deselect_all();
          $jstree.select_node(nodeId);
          $jstree.open_node(nodeId, function () {
            if (++index < paths.length) {
              selectPath(paths, index);
            }
          });
        }
      }
    }
  }, {
    key: '$jstree',
    get: function get() {
      return this.$tree.jstree(true);
    }
  }]);

  return TreeView;
}();
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OptionsView = function () {
  function OptionsView($dom, store) {
    var _this = this;

    _classCallCheck(this, OptionsView);

    this.store = store;
    this.$view = $dom.find('.octotree_optsview').submit(this._save.bind(this));
    this.$toggler = $dom.find('.octotree_opts').click(this._toggle.bind(this));
    this.elements = this.$view.find('[data-store]').toArray();

    // hide options view when sidebar is hidden
    $(document).on(EVENT.TOGGLE, function (event, visible) {
      if (!visible) _this._toggle(false);
    });
  }

  _createClass(OptionsView, [{
    key: '_toggle',
    value: function _toggle(visibility) {
      if (visibility !== undefined) {
        if (this.$view.hasClass('current') === visibility) return;
        return this._toggle();
      }

      if (this.$toggler.hasClass('selected')) {
        this.$toggler.removeClass('selected');
        $(this).trigger(EVENT.VIEW_CLOSE);
      } else {
        this._load();
      }
    }
  }, {
    key: '_load',
    value: function _load() {
      var _this2 = this;

      this._eachOption(function ($elm, key, value, cb) {
        if ($elm.is(':checkbox')) $elm.prop('checked', value);else $elm.val(value);
        cb();
      }, function () {
        _this2.$toggler.addClass('selected');
        $(_this2).trigger(EVENT.VIEW_READY);
      });
    }
  }, {
    key: '_save',
    value: function _save(event) {
      var _this3 = this;

      event.preventDefault();

      /*
       * Certainly not a good place to put this logic but Chrome requires
       * permissions to be requested only in response of user input. So...
       */
      return this._saveOptions();
    }
  }, {
    key: '_saveOptions',
    value: function _saveOptions() {
      var _this4 = this;

      var changes = {};
      this._eachOption(function ($elm, key, value, cb) {
        var newValue = $elm.is(':checkbox') ? $elm.is(':checked') : $elm.val();
        if (value === newValue) return cb();
        changes[key] = [value, newValue];
        _this4.store.set(key, newValue, cb);
      }, function () {
        _this4._toggle(false);
        if (Object.keys(changes).length) {
          $(_this4).trigger(EVENT.OPTS_CHANGE, changes);
        }
      });
    }
  }, {
    key: '_eachOption',
    value: function _eachOption(processFn, completeFn) {
      var _this5 = this;

      parallel(this.elements, function (elm, cb) {
        var $elm = $(elm);
        var key = STORE[$elm.data('store')];

        _this5.store.get(key, function (value) {
          processFn($elm, key, value, function () {
            return cb();
          });
        });
      }, completeFn);
    }
  }]);

  return OptionsView;
}();
'use strict';

// regexps from https://github.com/shockie/node-iniparser
var INI_SECTION = /^\s*\[\s*([^\]]*)\s*\]\s*$/;
var INI_COMMENT = /^\s*;.*$/;
var INI_PARAM = /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/;
var SEPARATOR = /\r\n|\r|\n/;

function parseGitmodules(data) {
  if (!data) return;

  var submodules = {};
  var lines = data.split(SEPARATOR);
  var lastPath = void 0;

  lines.forEach(function (line) {
    var match = void 0;
    if (INI_SECTION.test(line) || INI_COMMENT.test(line) || !(match = line.match(INI_PARAM))) {
      return;
    }

    if (match[1] === 'path') lastPath = match[2];else if (match[1] === 'url') submodules[lastPath] = match[2];
  });

  return submodules;
}
"use strict";

function parallel(arr, iter, done) {
  var total = arr.length;
  if (total === 0) return done();

  arr.forEach(function (item) {
    iter(item, finish);
  });

  function finish() {
    if (--total === 0) done();
  }
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Storage = function () {
  function Storage() {
    _classCallCheck(this, Storage);
  }

  _createClass(Storage, [{
    key: 'set',
    value: function set(key, val, cb) {
      try {
        localStorage.setItem(key, JSON.stringify(val));
      } catch (e) {
        var msg = 'Octotree cannot save its settings. ' + 'If the local storage for this domain is full, please clean it up and try again.';
        console.error(msg, e);
      }
      if (cb) cb();
    }
  }, {
    key: 'get',
    value: function get(key, cb) {
      var val = parse(localStorage.getItem(key));
      if (cb) cb(val);else return val;

      function parse(val) {
        try {
          return JSON.parse(val);
        } catch (e) {
          return val;
        }
      }
    }
  }]);

  return Storage;
}();
'use strict';

$(document).ready(function () {
  var store = new Storage();

  parallel(Object.keys(STORE), setDefault, loadExtension);

  function setDefault(key, cb) {
    var storeKey = STORE[key];
    store.get(storeKey, function (val) {
      store.set(storeKey, val == null ? DEFAULTS[key] : val, cb);
    });
  }

  function createAdapter() {
    var normalizeUrl = function normalizeUrl(url) {
      return url.replace(/(.*?:\/\/[^/]+)(.*)/, '$1');
    };

    var githubUrls = store.get(STORE.GHEURLS).split(/\n/).map(normalizeUrl).concat('https://github.com');

    var bitbucketUrls = ['https://bitbucket.org'];
    var currentUrl = location.protocol + '//' + location.host;

    if (~githubUrls.indexOf(currentUrl)) {
      return new GitHub(store);
    } else if (~bitbucketUrls.indexOf(currentUrl)) {
      return new Bitbucket(store);
    }
  }

  function loadExtension() {
    var $html = $('html');
    var $document = $(document);
    var $dom = $(TEMPLATE);
    var $sidebar = $dom.find('.octotree_sidebar');
    var $toggler = $sidebar.find('.octotree_toggle');
    var $views = $sidebar.find('.octotree_view');
    var adapter = createAdapter();
    var treeView = new TreeView($dom, store, adapter);
    var optsView = new OptionsView($dom, store);
    var helpPopup = new HelpPopup($dom, store);
    var errorView = new ErrorView($dom, store);
    var currRepo = false;
    var hasError = false;

    $html.addClass(ADDON_CLASS);

    $(window).resize(function (event) {
      if (event.target === window) layoutChanged();
    });

    $toggler.click(toggleSidebarAndSave);
    key.filter = function () {
      return $toggler.is(':visible');
    };
    key(store.get(STORE.HOTKEYS), toggleSidebarAndSave);

    var views = [treeView, errorView, optsView];
    views.forEach(function (view) {
      $(view).on(EVENT.VIEW_READY, function (event) {
        if (this !== optsView) {
          $document.trigger(EVENT.REQ_END);
        }
        showView(this.$view);
      }).on(EVENT.VIEW_CLOSE, function () {
        return showView(hasError ? errorView.$view : treeView.$view);
      }).on(EVENT.OPTS_CHANGE, optionsChanged).on(EVENT.FETCH_ERROR, function (event, err) {
        return showError(err);
      });
    });

    $document.on(EVENT.REQ_START, function () {
      return $toggler.addClass('octotree_loading');
    }).on(EVENT.REQ_END, function () {
      return $toggler.removeClass('octotree_loading');
    }).on(EVENT.LAYOUT_CHANGE, layoutChanged).on(EVENT.TOGGLE, layoutChanged).on(EVENT.LOC_CHANGE, function () {
      return tryLoadRepo();
    });

    $sidebar.width(parseInt(store.get(STORE.WIDTH))).resize(function () {
      return layoutChanged(true);
    }).appendTo($('body'));

    adapter.init($sidebar);
    return tryLoadRepo();

    function optionsChanged(event, changes) {
      var reload = false;

      Object.keys(changes).forEach(function (storeKey) {
        var value = changes[storeKey];

        switch (storeKey) {
          case STORE.TOKEN:
          case STORE.LOADALL:
          case STORE.ICONS:
            reload = true;
            break;
          case STORE.HOTKEYS:
            key.unbind(value[0]);
            key(value[1], toggleSidebar);
            break;
        }
      });

      if (reload) {
        tryLoadRepo(true);
      }
    }

    function tryLoadRepo(reload) {
      hasError = false;
      var remember = store.get(STORE.REMEMBER);
      var shown = store.get(STORE.SHOWN);
      var token = store.get(STORE.TOKEN);

      adapter.getRepoFromPath(currRepo, token, function (err, repo) {
        if (err) {
          showError(err);
        } else if (repo) {
          $toggler.show();

          if (remember && shown) {
            toggleSidebar(true);
          }

          if (isSidebarVisible()) {
            var replacer = ['username', 'reponame', 'branch', 'pullNumber'];
            var repoChanged = JSON.stringify(repo, replacer) !== JSON.stringify(currRepo, replacer);
            if (repoChanged || reload === true) {
              $document.trigger(EVENT.REQ_START);
              currRepo = repo;
              treeView.show(repo, token);
            } else {
              treeView.syncSelection();
            }
          }
        } else {
          $toggler.hide();
          toggleSidebar(false);
        }
        helpPopup.init();
        layoutChanged();
      });
    }

    function showView(view) {
      $views.removeClass('current');
      view.addClass('current');
    }

    function showError(err) {
      hasError = true;
      errorView.show(err);
    }

    function toggleSidebarAndSave() {
      store.set(STORE.SHOWN, !isSidebarVisible(), function () {
        toggleSidebar();
        if (isSidebarVisible()) {
          tryLoadRepo();
        }
      });
    }

    function toggleSidebar(visibility) {
      if (visibility !== undefined) {
        if (isSidebarVisible() === visibility) return;
        toggleSidebar();
      } else {
        $html.toggleClass(SHOW_CLASS);
        $document.trigger(EVENT.TOGGLE, isSidebarVisible());
      }
    }

    function layoutChanged() {
      var save = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      var width = $sidebar.outerWidth();
      adapter.updateLayout(isTogglerVisible(), isSidebarVisible(), width);
      if (save === true) {
        store.set(STORE.WIDTH, width);
      }
    }

    function isSidebarVisible() {
      return $html.hasClass(SHOW_CLASS);
    }

    function isTogglerVisible() {
      return $toggler.is(':visible');
    }
  }
});