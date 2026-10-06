// CloudFront Functions JavaScript runtime 2.0. DOMAIN is replaced at synthesis.
function handler(event) {
  var request = event.request;
  var domain = '__DOMAIN__';
  if (request.headers.host.value.toLowerCase() === 'www.' + domain) {
    var query = [];
    Object.keys(request.querystring || {}).forEach(function (key) {
      var item = request.querystring[key];
      (item.multiValue || [item]).forEach(function (entry) {
        query.push(key + '=' + entry.value);
      });
    });
    return { statusCode: 301, statusDescription: 'Moved Permanently', headers: {
      location: { value: 'https://' + domain + request.uri + (query.length ? '?' + query.join('&') : '') },
      'cache-control': { value: 'public, max-age=300' },
    } };
  }
  if (request.uri.indexOf('/_releases/') === 0) return { statusCode: 404, statusDescription: 'Not Found' };
  if (request.uri === '/404' || request.uri === '/404/') request.uri = '/404.html';
  else if (request.uri.endsWith('/')) request.uri += 'index.html';
  else if (request.uri.split('/').pop().indexOf('.') === -1) request.uri += '/index.html';
  return request;
}
