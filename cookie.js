/**
 * Example from shipit.resultadosdigitais.com.br/blog/compartilhando-cookies-entre-dominios/
 */
var CookieHandler = (function () {
  var url = 'https://murmuring-fortress-96812.herokuapp.com/cookies'
  var cookieName = '_client.cookie'

  var init = function () {
    let cookie = getCookieSend()
    makeRequest(cookie)
  };

  const makeRequest = function(cookie) {
    httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = onRequestComplete;
    httpRequest.open('POST', url, true);
    httpRequest.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    httpRequest.withCredentials = true;
    httpRequest.send('data=' + JSON.stringify(cookie));
  }

  const post = function(email) {
    let cookie = getCookieSend()
    cookie.email = email
    makeRequest(cookie)
  }

  var onRequestComplete = function() {
    var COMPLETE = 4
    var OK = 200;

    if (this.readyState === COMPLETE && this.status == OK) {
      createCookie(this.response);
      console.log('From server -> ', this.response)
    }
  };

  var createCookie = function(data) {
    document.cookie = "_client.cookie=" + data;
  };

  const getCookieSend = () => {
    let host = window.location.host
    let path = window.location.pathname
    let cookie = getCookie()
    if(cookie === undefined) {
      cookie = getNewCookie(host)
    }
    cookie.trackPage(path)
    return cookie
  }

  var getCookie = function() {
    if(document.cookie === undefined) {
      return
    }
    var re = new RegExp(cookieName + "=([^;]+)");
    var value = re.exec(document.cookie);
    let cookie = (value != null) ? JSON.parse(unescape(value[1])) : null
    if(cookie !== null && cookie !== undefined) {
      let existingCookie = getCookieBase()
      existingCookie._id = cookie._id
      existingCookie.__v = cookie.__v
      existingCookie.uuid = cookie.uuid
      existingCookie.email = cookie.email
      existingCookie.host = cookie.host
      existingCookie.created_datetime = cookie.created_datetime
      existingCookie.pages = cookie.pages
      return existingCookie
    }
    return
  }

  const getNewCookie = (host) => {
    let newCookie = getCookieBase()
    newCookie.host = host
    newCookie.created_datetime = new Date()
    newCookie.pages = []
    return newCookie
  }

  const getCookieBase = () => {
    return {
      host: '',
      created_datetime: null,
      pages: [],
      trackPage (path) {
        let page = this.findPage(path)
        if(page === undefined) {
          page = this.createPage(path)
          page.logs.push(this.createLog())
          return this.pages.push(page)
        }
        page.logs.push(this.createLog())
      },
      createPage (path) {
        return {path, logs: []}
      },
      findPage (path) {
        let pagesResult = this.pages.filter(page => page.path === path)
        if(pagesResult.length > 0) {
          return pagesResult[0]
        }
        return
      },
      createLog () {
        return {client_datetime: new Date()}
      }
    }
  }

  return {
    init: init,
    post: post
  };
})();

window.addEventListener("load", CookieHandler.init);