const TEMPLATE = '<div>\n' +
    '  <nav class="octotree_sidebar">\n' +
    '    <a class="octotree_toggle btn">\n' +
    '      <div class="loader"></div>\n' +
    '      <span></span>\n' +
    '\n' +
    '      <div class="popup">\n' +
    '        <div class="arrow"></div>\n' +
    '        <div class="content">\n' +
    '          Octotree is enabled on this page. Click this button or press\n' +
    '          <kbd>cmd shift s</kbd> (or <kbd>ctrl shift s</kbd>)\n' +
    '          to show it.\n' +
    '        </div>\n' +
    '      </div>\n' +
    '    </a>\n' +
    '\n' +
    '    <a class="octotree_opts" href="javascript:void(0)">\n' +
    '      <i class="settings"></i>\n' +
    '    </a>\n' +
    '\n' +
    '    <div class="octotree_views">\n' +
    '      <div class="octotree_view octotree_treeview current">\n' +
    '        <div class="octotree_view_header"></div>\n' +
    '        <div class="octotree_view_body"></div>\n' +
    '      </div>\n' +
    '\n' +
    '      <div class="octotree_view octotree_errorview">\n' +
    '        <div class="octotree_view_header"></div>\n' +
    '        <form class="octotree_view_body">\n' +
    '          <div class="message"></div>\n' +
    '          <div>\n' +
    '            <input name="token" type="text" placeholder="Paste access token here" autocomplete="off">\n' +
    '          </div>\n' +
    '          <div>\n' +
    '            <button type="submit" class="btn">Save</button>\n' +
    '            <a href="https://github.com/ovity/octotree#access-token" target="_blank" tabIndex="-1">Why is this required?</a>\n' +
    '          </div>\n' +
    '          <div class="error"></div>\n' +
    '        </form>\n' +
    '      </div>\n' +
    '\n' +
    '      <div class="octotree_view octotree_optsview">\n' +
    '        <div class="octotree_view_header">Settings</div>\n' +
    '        <form class="octotree_view_body">\n' +
    '          <div>\n' +
    '            <label>Site access token</label>\n' +
    '            <a class="octotree_help" href="https://github.com/ovity/octotree#settings" target="_blank" tabIndex="-1">\n' +
    '              <span></span>\n' +
    '            </a>\n' +
    '            <input type="text" data-store="TOKEN" data-perhost="true">\n' +
    '          </div>\n' +
    '\n' +
    '          <div>\n' +
    '            <div>\n' +
    '              <label>Hotkeys</label>\n' +
    '            </div>\n' +
    '            <input type="text" data-store="HOTKEYS">\n' +
    '          </div>\n' +
    '\n' +
    '          <div>\n' +
    '            <label><input type="checkbox" data-store="ICONS"> Show file-specific icons</label>\n' +
    '          </div>\n' +
    '          <div>\n' +
    '            <label><input type="checkbox" data-store="REMEMBER"> Remember sidebar visibility</label>\n' +
    '          </div>\n' +
    '\n' +
    '          <div>\n' +
    '            <label><input type="checkbox" data-store="NONCODE"> Show in non-code pages</label>\n' +
    '          </div>\n' +
    '\n' +
    '          <div class="octotree_github_only">\n' +
    '            <label><input type="checkbox" data-store="LOADALL"> Load entire tree at once</label>\n' +
    '          </div>\n' +
    '\n' +
    '          <div class="octotree_github_only">\n' +
    '            <label>\n' +
    '              <input type="checkbox" data-store="PR">\n' +
    '                Show only pull request changes\n' +
    '              <span class="octotree_opts_disclaimer">Note: maximum of 300 files</span>\n' +
    '            </label>\n' +
    '          </div>\n' +
    '\n' +
    '          <div>\n' +
    '            <button type="submit" class="btn">Save</button>\n' +
    '          </div>\n' +
    '        </form>\n' +
    '      </div>\n' +
    '    </div>\n' +
    '\n' +
    '    <div class="octotree_bottom">\n' +
    '      <a href="https://opencollective.com/octotree" target="_blank">\n' +
    '        <i class="support"></i>Support us\n' +
    '      </a>\n' +
    '      &nbsp;•&nbsp;\n' +
    '      <a href="https://github.com/ovity/octotree/issues/new" target="_blank">\n' +
    '        <i class="github"></i>Feedback?\n' +
    '      </a>\n' +
    '    </div>\n' +
    '  </nav>\n' +
    '</div>\n' +
    ''
// Regexps from https://github.com/shockie/node-iniparser
const INI_SECTION = /^\s*\[\s*([^\]]*)\s*\]\s*$/;
const INI_COMMENT = /^\s*;.*$/;
const INI_PARAM = /^\s*([\w\.\-\_]+)\s*=\s*(.*?)\s*$/;
const SEPARATOR = /\r\n|\r|\n/;

function parseGitmodules(data) {
  if (!data) return;

  const submodules = {};
  const lines = data.split(SEPARATOR);
  let lastPath;

  lines.forEach((line) => {
    let match;
    if (INI_SECTION.test(line) || INI_COMMENT.test(line) || !(match = line.match(INI_PARAM))) {
      return;
    }

    if (match[1] === 'path') lastPath = match[2];
    else if (match[1] === 'url') submodules[lastPath] = match[2];
  });

  return submodules;
}

function parallel(arr, iter, done) {
  var total = arr.length;
  if (total === 0) return done();

  arr.forEach((item) => {
    iter(item, finish);
  });

  function finish() {
    if (--total === 0) done();
  }
}

const NODE_PREFIX = 'octotree';
const ADDON_CLASS = 'octotree';
const SHOW_CLASS = 'octotree-show';

const STORE = {
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
  GHEURLS: 'octotree.gheurls.shared'
};

const DEFAULTS = {
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
  GHEURLS: ''
};

const EVENT = {
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

class Storage {
  set(key, val, cb) {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      const msg =
        'Octotree cannot save its settings. ' +
        'If the local storage for this domain is full, please clean it up and try again.';
      console.error(msg, e);
    }
    if (cb) cb();
  }

  get(key, cb) {
    var val = parse(localStorage.getItem(key));
    if (cb) cb(val);
    else return val;

    function parse(val) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
  }

  setIfNull(key, val, cb) {
    this.get(key, (existingVal) => {
      this.set(key, existingVal == null ? val : existingVal, cb);
    });
  }
}

/**
 * Class to manage Octotree plugins.
 */
class PluginManager {
  /**
   * @constructor
   */
  constructor() {
    this._plugins = [];
    this._forward({
      activate: null,
      applyOptions: (results) => results.some((shouldReload) => !!shouldReload)
    });
  }

  /**
   * Registers a plugin class.
   * @param {!Plugin} pluginClass.
   */
  register(plugin) {
    this._plugins.push(plugin);
  }

  /**
   * Forwards the specified methods to every plugins.
   * @private {!Object<!String, !function(Array<*>): *} methods
   * @return the value returned by the collector function associated with each
   * method.
   */
  _forward(methods) {
    for (const method of Object.keys(methods)) {
      this[method] = async (...args) => {
        const promises = this._plugins.map((plugin) => plugin[method](...args));
        const results = await Promise.all(promises);
        const resultHandler = methods[method];

        if (!resultHandler) return results;
        else return resultHandler(results);
      };
    }
  }
}

/**
 * Base plugin class.
 */
class Plugin {
  /**
   * Activates the plugin.
   * @param {!{
   *   store: !Storage,
   *   adapter: !Adapter,
   *   $sidebar: !JQuery,
   *   $toggler: !JQuery,
   *   $views: !JQuery,
   *   treeView: !TreeView,
   *   optsView: !OptionsView,
   *   errorView: !ErrorView,
   * }}
   * @return {!Promise<undefined>}
   */
  async activate(opts) {
    return undefined;
  }

  /**
   * Applies the option changes user has made.
   * @param {!Object<!string, [(string|boolean), (string|boolean)]>} changes
   * @return {!Promise<boolean>} iff the tree should be reloaded.
   */
  async applyOptions(changes) {
    return false;
  }
}

const pluginManager = new PluginManager();

class Adapter {
  constructor(deps, store) {
    deps.forEach((dep) => window[dep]());
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
  _loadCodeTreeInternal(opts, transform, cb) {
    const folders = {'': []};
    const $dummyDiv = $('<div/>');
    const {path, repo, node} = opts;

    opts.encodedBranch = opts.encodedBranch || encodeURIComponent(decodeURIComponent(repo.branch));

    this._getTree(path, opts, (err, tree) => {
      if (err) return cb(err);

      this._getSubmodules(tree, opts, (err, submodules) => {
        if (err) return cb(err);

        submodules = submodules || {};

        const nextChunk = (iteration = 0) => {
          const CHUNK_SIZE = 300;

          for (let i = 0; i < CHUNK_SIZE; i++) {
            const item = tree[iteration * CHUNK_SIZE + i];

            // We're done
            if (item === undefined) {
              return cb(null, folders['']);
            }

            // Runs transform requested by subclass
            if (transform) {
              transform(item);
            }

            // If lazy load and has parent, prefix with parent path
            if (node && node.path) {
              item.path = node.path + '/' + item.path;
            }

            const path = item.path;
            const type = item.type;
            const index = path.lastIndexOf('/');
            const name = $dummyDiv.text(path.substring(index + 1)).html(); // Sanitizes, closes #9

            item.id = NODE_PREFIX + path;
            item.text = name;

            // Uses `type` as class name for tree node
            item.icon = type;

            if (type === 'blob') {
              if (this.store.get(STORE.ICONS)) {
                const className = FileIcons.getClassWithColor(name);
                item.icon += ' ' + (className || 'file-generic');
              } else {
                item.icon += ' file-generic';
              }
            }
            if (item.patch) {
              let patch_html = '';

              switch (item.patch.action) {
                case 'added':
                  patch_html += '<span class="text-green">added</span>';
                  break;
                case 'renamed':
                  patch_html += `<span class="text-green" title="${item.patch.previous}">renamed</span>`;
                  break;
                case 'removed':
                  patch_html += `<span class="text-red" title="${item.patch.previous}">removed</span>`;
                  break;
                default:
                  break;
              }

              if (item.patch.filesChanged) {
                const fileString = item.patch.filesChanged === 1 ? 'file' : 'files';
                patch_html += `<span>${item.patch.filesChanged} ${fileString}</span>`;
              }

              if (item.patch.additions !== 0) {
                patch_html += `<span class="text-green">+${item.patch.additions}</span>`;
              }
              if (item.patch.deletions !== 0) {
                patch_html += `<span class="text-red">-${item.patch.deletions}</span>`;
              }

              item.text += `<span class="patch">${patch_html}</span>`;
            }

            if (node) {
              folders[''].push(item);
            } else {
              folders[path.substring(0, index)].push(item);
            }

            if (type === 'tree' || type === 'blob') {
              if (type === 'tree') {
                if (node) item.children = true;
                else folders[item.path] = item.children = [];
              }

              // If item is part of a PR, jump to that file's diff
              if (item.patch && typeof item.patch.diffId === 'number') {
                const url = this._getPatchHref(repo, item.patch);
                item.a_attr = {
                  href: url,
                  'data-download-url': item.url,
                  'data-download-filename': name
                };
              } else {
                // Encodes but retains the slashes, see #274
                const encodedPath = path
                  .split('/')
                  .map(encodeURIComponent)
                  .join('/');
                const url = this._getItemHref(repo, type, encodedPath, opts.encodedBranch);
                item.a_attr = {
                  href: url,
                  'data-download-url': url,
                  'data-download-filename': name
                };
              }
            } else if (type === 'commit') {
              let moduleUrl = submodules[item.path];

              if (moduleUrl) {
                // Fixes #105
                // Special handling for submodules hosted in GitHub
                if (~moduleUrl.indexOf('github.com')) {
                  moduleUrl = moduleUrl
                    .replace(/^git(:\/\/|@)/, window.location.protocol + '//')
                    .replace('github.com:', 'github.com/')
                    .replace(/.git$/, '');
                  item.text =
                    `<a href="${moduleUrl}" class="jstree-anchor">${name}</a>` +
                    '<span>@ </span>' +
                    `<a href="${moduleUrl}/tree/${item.sha}" class="jstree-anchor">${item.sha.substr(0, 7)}</a>`;
                }
                item.a_attr = {href: moduleUrl};
              }
            }
          }

          setTimeout(() => nextChunk(iteration + 1));
        };

        nextChunk();
      });
    });
  }

  /**
   * Generic error handler.
   * @api protected
   */
  _handleError(jqXHR, cb) {
    let error, message, needAuth;

    switch (jqXHR.status) {
      case 0:
        error = 'Connection error';
        message = `Cannot connect to website.
          If your network connection to this website is fine, maybe there is an outage of the API.
          Please try again later.`;
        needAuth = false;
        break;
      case 206:
        error = 'Repo too large';
        message = `This repository is too large to loaded in a single request.
          If you frequently work with this repository,
          go to Settings and uncheck the "Load entire tree at once" option.`;
        break;
      case 401:
        error = 'Invalid token';
        message = `The token is invalid.
          Follow <a href="${this.getCreateTokenUrl()}" target="_blank">this link</a>
          to create a new token and paste it below.`;
        needAuth = true;
        break;
      case 409:
        error = 'Empty repository';
        message = 'This repository is empty.';
        break;
      case 404:
        error = 'Private repository';
        message = `Accessing private repositories requires an access token.
          Follow <a href="${this.getCreateTokenUrl()}" target="_blank">this link</a>
          to create one and paste it below.`;
        needAuth = true;
        break;
      case 403:
        if (~jqXHR.getAllResponseHeaders().indexOf('X-RateLimit-Remaining: 0')) {
          // It's kinda specific for GitHub
          error = 'API limit exceeded';
          message = `You have exceeded the GitHub API hourly limit and need GitHub access token
            to make extra requests. Follow <a href="${this.getCreateTokenUrl()}" target="_blank">this link</a>
            to create one and paste it below.`;
          needAuth = true;
          break;
        } else {
          error = 'Forbidden';
          message = `You are not allowed to access the API.
            You might need to provide an access token.
            Follow <a href="${this.getCreateTokenUrl()}" target="_blank">this link</a>
            to create one and paste it below.`;
          needAuth = true;
          break;
        }
      default:
        error = message = jqXHR.statusText;
        needAuth = false;
        break;
    }
    cb({
      error: `Error: ${error}`,
      message: message,
      needAuth: needAuth
    });
  }

  /**
   * Returns the CSS class to be added to the Octotree sidebar.
   * @api protected
   */
  _getCssClass() {
    throw new Error('Not implemented');
  }

  /**
   * Returns the minimum width acceptable for the sidebar.
   * @api protected
   */
  _getMinWidth() {
    return 200;
  }

  /**
   * Inits behaviors after the sidebar is added to the DOM.
   * @api public
   */
  init($sidebar) {
    $sidebar.resizable({handles: 'e', minWidth: this._getMinWidth()}).addClass(this._getCssClass());
  }

  /**
   * Returns whether the adapter is capable of loading the entire tree in
   * a single request. This is usually determined by the underlying the API.
   * @api public
   */
  canLoadEntireTree() {
    return false;
  }

  /**
   * Loads the code tree.
   * @api public
   */
  loadCodeTree(opts, cb) {
    throw new Error('Not implemented');
  }

  /**
   * Returns the URL to create a personal access token.
   * @api public
   */
  getCreateTokenUrl() {
    throw new Error('Not implemented');
  }

  /**
   * Updates the layout based on sidebar visibility and width.
   * @api public
   */
  updateLayout(togglerVisible, sidebarVisible, sidebarWidth) {
    throw new Error('Not implemented');
  }

  /**
   * Returns repo info at the current path.
   * @api public
   */
  getRepoFromPath(token, cb) {
    throw new Error('Not implemented');
  }

  /**
   * Selects the file at a specific path.
   * @api public
   */
  selectFile(path) {
    window.location.href = path;
  }

  /**
   * Selects a submodule.
   * @api public
   */
  selectSubmodule(path) {
    window.location.href = path;
  }

  /**
   * Opens file or submodule in a new tab.
   * @api public
   */
  openInNewTab(path) {
    window.open(path, '_blank').focus();
  }

  /**
   * Downloads a file.
   * @api public
   */
  downloadFile(path, fileName) {
    const downloadUrl = path.replace(/\/blob\/|\/src\//, '/raw/');
    const link = document.createElement('a');

    link.setAttribute('href', downloadUrl);

    // Github will redirect to a different origin (host) for downloading the file.
    // However, the new host hasn't been added in the Content-Security-Policy header from
    // Github so the browser won't save the file, it navigates to the file instead.
    // Using '_blank' as a trick to not being navigated
    // See more about Content Security Policy at
    // https://www.html5rocks.com/en/tutorials/security/content-security-policy/
    link.setAttribute('target', '_blank');

    link.click();
  }

  /**
   * Gets tree at path.
   * @param {Object} opts - {token, repo}
   * @api protected
   */
  _getTree(path, opts, cb) {
    throw new Error('Not implemented');
  }

  /**
   * Gets submodules in the tree.
   * @param {Object} opts - {token, repo, encodedBranch}
   * @api protected
   */
  _getSubmodules(tree, opts, cb) {
    throw new Error('Not implemented');
  }

  /**
   * Returns item's href value.
   * @api protected
   */
  _getItemHref(repo, type, encodedPath, encodedBranch) {
    return `/${repo.username}/${repo.reponame}/${type}/${encodedBranch}/${encodedPath}`;
  }
  /**
   * Returns patch's href value.
   * @api protected
   */
  _getPatchHref(repo, patch) {
    return `/${repo.username}/${repo.reponame}/pull/${repo.pullNumber}/files#diff-${patch.diffId}`;
  }
}

class PjaxAdapter extends Adapter {
  constructor(store) {
    super(['jquery.pjax.js'], store);

    $(document)
      .on('pjax:start', () => $(document).trigger(EVENT.REQ_START))
      .on('pjax:end', () => $(document).trigger(EVENT.REQ_END))
      .on('pjax:timeout', (e) => e.preventDefault());
  }

  // @override
  // @param {Object} opts - {pjaxContainer: the specified pjax container}
  // @api public
  init($sidebar, opts) {
    super.init($sidebar);

    opts = opts || {};
    const pjaxContainer = opts.pjaxContainer;

    if (!window.MutationObserver) return;

    // Some host switch pages using pjax. This observer detects if the pjax container
    // Has been updated with new contents and trigger layout.
    const pageChangeObserver = new window.MutationObserver(() => {
      // Trigger location change, can't just relayout as Octotree might need to
      // Hide/show depending on whether the current page is a code page or not.
      return $(document).trigger(EVENT.LOC_CHANGE);
    });

    if (pjaxContainer) {
      pageChangeObserver.observe(pjaxContainer, {
        childList: true
      });
    } else {
      // Fall back if DOM has been changed
      let firstLoad = true,
        href,
        hash;

      function detectLocChange() {
        if (location.href !== href || location.hash !== hash) {
          href = location.href;
          hash = location.hash;

          // If this is the first time this is called, no need to notify change as
          // Octotree does its own initialization after loading options.
          if (firstLoad) {
            firstLoad = false;
          } else {
            setTimeout(() => {
              $(document).trigger(EVENT.LOC_CHANGE);
            }, 300); // Wait a bit for pjax DOM change
          }
        }
        setTimeout(detectLocChange, 200);
      }

      detectLocChange();
    }
  }

  // @override
  // @param {Object} opts - {$pjax_container: jQuery object}
  // @api public
  selectFile(path, opts) {
    opts = opts || {};

    // Do nothing if file is already selected.
    if (location.pathname === path) return;

    // If we're on the same page and just navigating to a different anchor
    // Don't bother fetching the page with pjax
    const pathWithoutAnchor = path.replace(/#.*$/, '');
    const isSamePage = location.pathname === pathWithoutAnchor;
    const pjaxContainerSel = opts.pjaxContainerSel;
    const loadWithPjax = $(pjaxContainerSel).length && !isSamePage;

    if (loadWithPjax) {
      $.pjax({
        // Needs full path for pjax to work with Firefox as per cross-domain-content setting
        url: location.protocol + '//' + location.host + path,
        container: pjaxContainerSel,
        timeout: 0 // global timeout doesn't seem to work, use this instead
      });
    } else {
      super.selectFile(path);
    }
  }
}

const GH_RESERVED_USER_NAMES = [
  'settings',
  'orgs',
  'organizations',
  'site',
  'blog',
  'about',
  'explore',
  'styleguide',
  'showcases',
  'trending',
  'stars',
  'dashboard',
  'notifications',
  'search',
  'developer',
  'account',
  'pulls',
  'issues',
  'features',
  'contact',
  'security',
  'join',
  'login',
  'watching',
  'new',
  'integrations',
  'gist',
  'business',
  'mirrors',
  'open-source',
  'personal',
  'pricing'
];
const GH_RESERVED_REPO_NAMES = ['followers', 'following', 'repositories'];
const GH_404_SEL = '#parallax_wrapper';
const GH_PJAX_CONTAINER_SEL = '#js-repo-pjax-container, .context-loader-container, [data-pjax-container]';
const GH_CONTAINERS = '.container, .container-lg, .container-responsive';
const GH_HEADER = '.js-header-wrapper > header';
const GH_RAW_CONTENT = 'body > pre';

class GitHub extends PjaxAdapter {
  constructor(store) {
    super(store);
  }

  // @override
  init($sidebar) {
    const pjaxContainer = $(GH_PJAX_CONTAINER_SEL)[0];
    super.init($sidebar, {pjaxContainer: pjaxContainer});

    // Fix #151 by detecting when page layout is updated.
    // In this case, split-diff page has a wider layout, so need to recompute margin.
    // Note that couldn't do this in response to URL change, since new DOM via pjax might not be ready.
    const diffModeObserver = new window.MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
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
  _getCssClass() {
    return 'octotree_github_sidebar';
  }

  // @override
  canLoadEntireTree() {
    return true;
  }

  // @override
  getCreateTokenUrl() {
    return (
      `${location.protocol}//${location.host}/settings/tokens/new?` +
      'scopes=repo&description=Octotree%20browser%20extension'
    );
  }

  // @override
  updateLayout(togglerVisible, sidebarVisible, sidebarWidth) {
    const SPACING = 10;
    const $header = $(GH_HEADER);
    const $containers = $(GH_CONTAINERS);
    const autoMarginLeft = ($(document).width() - $containers.width()) / 2;
    const shouldPushEverything = sidebarVisible && autoMarginLeft <= sidebarWidth + SPACING;

    $('html').css('margin-left', shouldPushEverything ? sidebarWidth : '');
    $containers.css('margin-left', shouldPushEverything ? SPACING : '');

    const headerPadding =
      shouldPushEverything || (!togglerVisible && !sidebarVisible)
        ? '' // Nothing is visible or already pushed, leave as-is
        : !sidebarVisible
        ? 25 // Sidebar is collapsed, move the logo to avoid hiding the toggler
        : sidebarWidth; // Otherwise, move the header from the sidebar
    $header.css('padding-left', headerPadding);
  }

  // @override
  getRepoFromPath(currentRepo, token, cb) {
    // 404 page, skip
    if ($(GH_404_SEL).length) {
      return cb();
    }

    // Skip raw page
    if ($(GH_RAW_CONTENT).length) {
      return cb();
    }

    // (username)/(reponame)[/(type)][/(typeId)]
    const match = window.location.pathname.match(/([^\/]+)\/([^\/]+)(?:\/([^\/]+))?(?:\/([^\/]+))?/);
    if (!match) {
      return cb();
    }

    const username = match[1];
    const reponame = match[2];
    const type = match[3];
    const typeId = match[4];

    // Not a repository, skip
    if (~GH_RESERVED_USER_NAMES.indexOf(username) || ~GH_RESERVED_REPO_NAMES.indexOf(reponame)) {
      return cb();
    }

    // Check if we should show in non-code pages
    const isPR = type === 'pull';
    const isCodePage = !type || isPR || ['tree', 'blob', 'commit'].indexOf(type) >= 0;
    const showInNonCodePage = this.store.get(STORE.NONCODE);
    if (!showInNonCodePage && !isCodePage) {
      return cb();
    }

    // Get branch by inspecting URL or DOM, quite fragile so provide multiple fallbacks.
    // TODO would be great if there's a more robust way to do this
    /**
     * Github renders the branch name in one of below structure depending on the length
     * of branch name
     *
     * Option 1: when the length is short enough
     * <summary title="Switch branches or tags">
     *   <span class="css-truncate-target">feature/1/2/3</span>
     * </summary>
     *
     * Option 2: when the length is too long
     * <summary title="feature/1/2/3/4/5/6/7/8">
     *   <span class="css-truncate-target">feature/1/2/3...</span>
     * </summary>
     */
    const branchDropdownMenuSummary = $('.branch-select-menu summary');
    const branchNameInTitle = branchDropdownMenuSummary.attr('title');
    const branchNameInSpan = branchDropdownMenuSummary.find('span').text();
    const branchFromSummary =
      branchNameInTitle && branchNameInTitle.toLowerCase().startsWith('switch branches')
        ? branchNameInSpan
        : branchNameInTitle;

    const branch =
      // Pick the commit ID as branch name when the code page is listing tree in a particular commit
      (type === 'commit' && typeId) ||
      // Pick the commit ID or branch name from the DOM
      // Note: we can't use URL as it would not work with branches with slashes, e.g. features/hotfix-1
      ($('.overall-summary .numbers-summary .commits a').attr('href') || '').split('/').slice(-1)[0] ||
      branchFromSummary ||
      // Pull requests page
      ($('.commit-ref.base-ref').attr('title') || ':').match(/:(.*)/)[1] ||
      // Reuse last selected branch if exist
      (currentRepo.username === username && currentRepo.reponame === reponame && currentRepo.branch) ||
      // Get default branch from cache
      this._defaultBranch[username + '/' + reponame];

    const showOnlyChangedInPR = this.store.get(STORE.PR);
    const pullNumber = isPR && showOnlyChangedInPR ? typeId : null;
    const repo = {username, reponame, branch, pullNumber};
    if (repo.branch) {
      cb(null, repo);
    } else {
      // Still no luck, get default branch for real
      this._get(null, {repo, token}, (err, data) => {
        if (err) return cb(err);
        repo.branch = this._defaultBranch[username + '/' + reponame] = data.default_branch || 'master';
        cb(null, repo);
      });
    }
  }

  // @override
  selectFile(path) {
    super.selectFile(path, {pjaxContainerSel: GH_PJAX_CONTAINER_SEL});
  }

  // @override
  loadCodeTree(opts, cb) {
    opts.encodedBranch = encodeURIComponent(decodeURIComponent(opts.repo.branch));
    opts.path = (opts.node && (opts.node.sha || opts.encodedBranch)) || opts.encodedBranch + '?recursive=1';
    this._loadCodeTreeInternal(opts, null, cb);
  }

  // @override
  _getTree(path, opts, cb) {
    if (opts.repo.pullNumber) {
      this._getPatch(opts, cb);
    } else {
      this._get(`/git/trees/${path}`, opts, (err, res) => {
        // Console.log('****', res.tree);
        if (err) cb(err);
        else cb(null, res.tree);
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
  _getPatch(opts, cb) {
    const {pullNumber} = opts.repo;

    this._get(`/pulls/${pullNumber}/files?per_page=300`, opts, (err, res) => {
      if (err) cb(err);
      else {
        const diffMap = {};

        res.forEach((file, index) => {
          // Record file patch info
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
          };

          // Record ancestor folders
          const folderPath = file.filename
            .split('/')
            .slice(0, -1)
            .join('/');
          const split = folderPath.split('/');

          // Aggregate metadata for ancestor folders
          split.reduce((path, curr) => {
            if (path.length) path = `${path}/${curr}`;
            else path = `${curr}`;

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

        // Transform to emulate response from get `tree`
        const tree = Object.keys(diffMap).map((fileName) => {
          const patch = diffMap[fileName];
          return {
            patch,
            path: fileName,
            sha: patch.sha,
            type: patch.type,
            url: patch.blob_url
          };
        });

        // Sort by path, needs to be alphabetical order (so parent folders come before children)
        // Note: this is still part of the above transform to mimic the behavior of get tree
        tree.sort((a, b) => a.path.localeCompare(b.path));

        cb(null, tree);
      }
    });
  }

  // @override
  _getSubmodules(tree, opts, cb) {
    const item = tree.filter((item) => /^\.gitmodules$/i.test(item.path))[0];
    if (!item) return cb();

    this._get(`/git/blobs/${item.sha}`, opts, (err, res) => {
      if (err) return cb(err);
      const data = atob(res.content.replace(/\n/g, ''));
      cb(null, parseGitmodules(data));
    });
  }

  _get(path, opts, cb) {
    const host =
      location.protocol + '//' + (location.host === 'github.com' ? 'api.github.com' : location.host + '/api/v3');
    const url = `${host}/repos/${opts.repo.username}/${opts.repo.reponame}${path || ''}`;
    const cfg = {url, method: 'GET', cache: false};

    if (opts.token) {
      cfg.headers = {Authorization: 'token ' + opts.token};
    }

    $.ajax(cfg)
      .done((data) => {
        if (path && path.indexOf('/git/trees') === 0 && data.truncated) {
          this._handleError({status: 206}, cb);
        } else cb(null, data);
      })
      .fail((jqXHR) => this._handleError(jqXHR, cb));
  }
}

class HelpPopup {
  constructor($dom, store) {
    this.$view = $dom.find('.popup');
    this.store = store;
  }

  init() {
    const $view = this.$view;
    const store = this.store;
    const popupShown = store.get(STORE.POPUP);
    const sidebarVisible = $('html').hasClass(SHOW_CLASS);

    if (popupShown || sidebarVisible) {
      return hideAndDestroy();
    }

    $(document).one(EVENT.TOGGLE, hideAndDestroy);

    setTimeout(() => {
      setTimeout(hideAndDestroy, 6000);
      $view.addClass('show').click(hideAndDestroy);
    }, 500);

    function hideAndDestroy() {
      store.set(STORE.POPUP, true);
      if ($view.hasClass('show')) {
        $view.removeClass('show').one('transitionend', () => $view.remove());
      } else {
        $view.remove();
      }
    }
  }
}

class ErrorView {
  constructor($dom, store) {
    this.store = store;
    this.$view = $dom.find('.octotree_errorview').submit(this._saveToken.bind(this));
  }

  show(err) {
    const $token = this.$view.find('input[name="token"]');
    const $submit = this.$view.find('button[type="submit"]');
    const $help = $submit.next();
    const token = this.store.get(STORE.TOKEN);

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

  _saveToken(event) {
    event.preventDefault();

    const $error = this.$view.find('.error').text('');
    const $token = this.$view.find('[name="token"]');
    const oldToken = this.store.get(STORE.TOKEN);
    const newToken = $token.val();

    if (!newToken) return $error.text('Token is required');

    this.store.set(STORE.TOKEN, newToken, () => {
      const changes = {[STORE.TOKEN]: [oldToken, newToken]};
      $(this).trigger(EVENT.OPTS_CHANGE, changes);
      $token.val('');
    });
  }
}

class TreeView {
  constructor($dom, store, adapter) {
    this.store = store;
    this.adapter = adapter;
    this.$view = $dom.find('.octotree_treeview');
    this.$tree = this.$view
      .find('.octotree_view_body')
      .on('click.jstree', '.jstree-open>a', ({target}) => {
        setTimeout(() => {
          this.$jstree.close_node(target)
        }, 0);
      })
      .on('click.jstree', '.jstree-closed>a', ({target}) => {
        setTimeout(() => {
          this.$jstree.open_node(target)
        }, 0);
      })
      .on('click', this._onItemClick.bind(this))
      .jstree({
        core: {multiple: false, worker: false, themes: {responsive: false}},
        plugins: ['wholerow']
      });
  }

  get $jstree() {
    return this.$tree.jstree(true);
  }

  show(repo, token) {
    const $jstree = this.$jstree;

    $jstree.settings.core.data = (node, cb) => {
      const prMode = this.store.get(STORE.PR) && repo.pullNumber;
      const loadAll = this.adapter.canLoadEntireTree() && (prMode || this.store.get(STORE.LOADALL));

      node = !loadAll && (node.id === '#' ? {path: ''} : node.original);

      this.adapter.loadCodeTree({repo, token, node}, (err, treeData) => {
        if (err) {
          $(this).trigger(EVENT.FETCH_ERROR, [err]);
        } else {
          treeData = this._sort(treeData);
          if (loadAll) {
            treeData = this._collapse(treeData);
          }
          cb(treeData);
        }
      });
    };

    this.$tree.one('refresh.jstree', () => {
      this.syncSelection();
      $(this).trigger(EVENT.VIEW_READY);
    });

    this._showHeader(repo);
    $jstree.refresh(true);
  }

  _showHeader(repo) {
    const adapter = this.adapter;

    this.$view
      .find('.octotree_view_header')
      .html(
        `<div class="octotree_header_repo">
           <a href="/${repo.username}">${repo.username}</a>
           /
           <a data-pjax href="/${repo.username}/${repo.reponame}">${repo.reponame}</a>
         </div>
         <div class="octotree_header_branch">
           ${this._deXss(repo.branch.toString())}
         </div>`
      )
      .on('click', 'a[data-pjax]', function(event) {
        event.preventDefault();
        // A.href always return absolute URL, don't want that
        const href = $(this).attr('href');
        const newTab = event.shiftKey || event.ctrlKey || event.metaKey;
        newTab ? adapter.openInNewTab(href) : adapter.selectFile(href);
      });
  }

  _deXss(str) {
    return str && str.replace(/[<>'"&]/g, '-');
  }

  _sort(folder) {
    folder.sort((a, b) => {
      if (a.type === b.type) return a.text === b.text ? 0 : a.text < b.text ? -1 : 1;
      return a.type === 'blob' ? 1 : -1;
    });

    folder.forEach((item) => {
      if (item.type === 'tree' && item.children !== true && item.children.length > 0) {
        this._sort(item.children);
      }
    });

    return folder;
  }

  _collapse(folder) {
    return folder.map((item) => {
      if (item.type === 'tree') {
        item.children = this._collapse(item.children);
        if (item.children.length === 1 && item.children[0].type === 'tree') {
          const onlyChild = item.children[0];
          onlyChild.text = item.text + '/' + onlyChild.text;
          return onlyChild;
        }
      }
      return item;
    });
  }

  _onItemClick(event) {
    let $target = $(event.target);
    let download = false;

    // Handle middle click
    if (event.which === 2) return;

    // Handle icon click, fix #122
    if ($target.is('i.jstree-icon')) {
      $target = $target.parent();
      download = true;
    }

    if (!$target.is('a.jstree-anchor')) return;

    // Refocus after complete so that keyboard navigation works, fix #158
    const refocusAfterCompletion = () => {
      $(document).one('pjax:success page:load', () => {
        this.$jstree.get_container().focus();
      });
    };

    const adapter = this.adapter;
    const newTab = event.shiftKey || event.ctrlKey || event.metaKey;
    const href = $target.attr('href');
    // The 2nd path is for submodule child links
    const $icon = $target.children().length ? $target.children(':first') : $target.siblings(':first');

    if ($icon.hasClass('commit')) {
      refocusAfterCompletion();
      newTab ? adapter.openInNewTab(href) : adapter.selectSubmodule(href);
    } else if ($icon.hasClass('blob')) {
      if (download) {
        const downloadUrl = $target.attr('data-download-url');
        const downloadFileName = $target.attr('data-download-filename');
        adapter.downloadFile(downloadUrl, downloadFileName);
      } else {
        refocusAfterCompletion();
        newTab ? adapter.openInNewTab(href) : adapter.selectFile(href);
      }
    }
  }

  syncSelection() {
    const $jstree = this.$jstree;
    if (!$jstree) return;

    // Convert /username/reponame/object_type/branch/path to path
    const path = decodeURIComponent(location.pathname);
    const match = path.match(/(?:[^\/]+\/){4}(.*)/);
    if (!match) return;

    const currentPath = match[1];
    const loadAll = this.adapter.canLoadEntireTree() && this.store.get(STORE.LOADALL);

    selectPath(loadAll ? [currentPath] : breakPath(currentPath));

    // Convert ['a/b'] to ['a', 'a/b']
    function breakPath(fullPath) {
      return fullPath.split('/').reduce((res, path, idx) => {
        res.push(idx === 0 ? path : `${res[idx - 1]}/${path}`);
        return res;
      }, []);
    }

    function selectPath(paths, index = 0) {
      const nodeId = NODE_PREFIX + paths[index];

      if ($jstree.get_node(nodeId)) {
        $jstree.deselect_all();
        $jstree.select_node(nodeId);
        $jstree.open_node(nodeId, () => {
          if (++index < paths.length) {
            selectPath(paths, index);
          }
        });
      }
    }
  }
}

class OptionsView {
  constructor($dom, store) {
    this.store = store;
    this.$view = $dom.find('.octotree_optsview').submit(this._save.bind(this));
    this.$toggler = $dom.find('.octotree_opts').click(this._toggle.bind(this));
    this.elements = this.$view.find('[data-store]').toArray();

    // Hide options view when sidebar is hidden
    $(document).on(EVENT.TOGGLE, (event, visible) => {
      if (!visible) this._toggle(false);
    });
  }

  _toggle(visibility) {
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

  _load() {
    this._eachOption(
      ($elm, key, value, cb) => {
        if ($elm.is(':checkbox')) $elm.prop('checked', value);
        else $elm.val(value);
        cb();
      },
      () => {
        this.$toggler.addClass('selected');
        $(this).trigger(EVENT.VIEW_READY);
      }
    );
  }

  _save(event) {
    event.preventDefault();

    /*
     * Certainly not a good place to put this logic but Chrome requires
     * permissions to be requested only in response of user input. So...
     */
    return this._saveOptions();
  }

  _saveOptions() {
    const changes = {};
    this._eachOption(
      ($elm, key, value, cb) => {
        const newValue = $elm.is(':checkbox') ? $elm.is(':checked') : $elm.val();
        if (value === newValue) return cb();
        changes[key] = [value, newValue];
        this.store.set(key, newValue, cb);
      },
      () => {
        this._toggle(false);
        if (Object.keys(changes).length) {
          $(this).trigger(EVENT.OPTS_CHANGE, changes);
        }
      }
    );
  }

  _eachOption(processFn, completeFn) {
    parallel(
      this.elements,
      (elm, cb) => {
        const $elm = $(elm);
        const key = STORE[$elm.data('store')];

        this.store.get(key, (value) => {
          processFn($elm, key, value, () => cb());
        });
      },
      completeFn
    );
  }
}

$(document).ready(() => {
  const store = new Storage();

  parallel(Object.keys(STORE), (key, cb) => store.setIfNull(STORE[key], DEFAULTS[key], cb), loadExtension);

  async function loadExtension() {
    const $html = $('html');
    const $document = $(document);
    const $dom = $(TEMPLATE);
    const $sidebar = $dom.find('.octotree_sidebar');
    const $toggler = $sidebar.find('.octotree_toggle');
    const $views = $sidebar.find('.octotree_view');
    const adapter = createAdapter();
    const treeView = new TreeView($dom, store, adapter);
    const optsView = new OptionsView($dom, store);
    const helpPopup = new HelpPopup($dom, store);
    const errorView = new ErrorView($dom, store);
    let currRepo = false;
    let hasError = false;

    $html.addClass(ADDON_CLASS);

    $(window).resize((event) => {
      if (event.target === window) layoutChanged();
    });

    $toggler.click(toggleSidebarAndSave);
    key.filter = () => $toggler.is(':visible');
    key(store.get(STORE.HOTKEYS), toggleSidebarAndSave);

    for (const view of [treeView, errorView, optsView]) {
      $(view)
        .on(EVENT.VIEW_READY, function(event) {
          if (this !== optsView) {
            $document.trigger(EVENT.REQ_END);
          }
          showView(this.$view);
        })
        .on(EVENT.VIEW_CLOSE, () => showView(hasError ? errorView.$view : treeView.$view))
        .on(EVENT.OPTS_CHANGE, optionsChanged)
        .on(EVENT.FETCH_ERROR, (event, err) => showError(err));
    }

    $document
      .on(EVENT.REQ_START, () => $toggler.addClass('octotree_loading'))
      .on(EVENT.REQ_END, () => $toggler.removeClass('octotree_loading'))
      .on(EVENT.LAYOUT_CHANGE, layoutChanged)
      .on(EVENT.TOGGLE, layoutChanged)
      .on(EVENT.LOC_CHANGE, () => tryLoadRepo());

    $sidebar
      .width(parseInt(store.get(STORE.WIDTH)))
      .resize(() => layoutChanged(true))
      .appendTo($('body'));

    adapter.init($sidebar);

    await pluginManager.activate({
      store,
      adapter,
      $document,
      $dom,
      $sidebar,
      $toggler,
      $views,
      treeView,
      optsView,
      errorView
    });

    return tryLoadRepo();

    /**
     * Creates the platform adapter. Currently only support GitHub.
     */
    function createAdapter() {
      const normalizeUrl = (url) => url.replace(/(.*?:\/\/[^/]+)(.*)/, '$1');
      const currentUrl = `${location.protocol}//${location.host}`;
      const githubUrls = store
        .get(STORE.GHEURLS)
        .split(/\n/)
        .map(normalizeUrl)
        .concat('https://github.com');

      if (~githubUrls.indexOf(currentUrl)) {
        return new GitHub(store);
      }
    }

    /**
     * Invoked when the user saves the option changes in the option view.
     * @param {!string} event
     * @param {!Object<!string, [(string|boolean), (string|boolean)]>} changes
     */
    async function optionsChanged(event, changes) {
      let reload = false;

      Object.keys(changes).forEach((storeKey) => {
        const value = changes[storeKey];

        switch (storeKey) {
          case STORE.TOKEN:
          case STORE.LOADALL:
          case STORE.ICONS:
          case STORE.PR:
            reload = true;
            break;
          case STORE.HOTKEYS:
            key.unbind(value[0]);
            key(value[1], toggleSidebar);
            break;
        }
      });

      if (await pluginManager.applyOptions(changes)) {
        reload = true;
      }

      if (reload) {
        tryLoadRepo(true);
      }
    }

    function tryLoadRepo(reload) {
      hasError = false;
      const remember = store.get(STORE.REMEMBER);
      const shown = store.get(STORE.SHOWN);
      const token = store.get(STORE.TOKEN);

      adapter.getRepoFromPath(currRepo, token, (err, repo) => {
        if (err) {
          showError(err);
        } else if (repo) {
          $toggler.show();

          if (remember && shown) {
            toggleSidebar(true);
          }

          if (isSidebarVisible()) {
            const replacer = ['username', 'reponame', 'branch', 'pullNumber'];
            const repoChanged = JSON.stringify(repo, replacer) !== JSON.stringify(currRepo, replacer);
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
      store.set(STORE.SHOWN, !isSidebarVisible(), () => {
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

    function layoutChanged(save = false) {
      const width = $sidebar.outerWidth();
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
