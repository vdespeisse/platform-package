// TODO this should use a direct import
// import axios from '../axios.js';

export const fetchAndTransform = (url, transform = x => x, options = {}) => {
  // TODO prefer an explicit cache database instead of relying on `global.js` `window.idb`
  let defaultOptions = {cache: true};
  let resolvedOptions = {...defaultOptions, ...options};
  return idb.get(['xcache', url].join('.'))
  .then(result => {
    if (result && location.origin != "http://127.0.0.1:1100") return result;
    // no cached data found, perform fetch and transform
    // TODO prefer explicit import instead of relying on `global.js` `window.axios = axios`
    let { fetchOptions } = resolvedOptions;
    return axios.get(url, fetchOptions)
      .then(response => response.data) // TODO manage response errors
      .then(data => {
        let transformedData = transform(data);
        if (resolvedOptions.cache) {
          idb.set(['xcache', url].join('.'), transformedData);
        }
        return transformedData;
      });
  })
  .catch(error => {
    // TODO log error? return null or undefined?
    // For the moment don't handle any error here
    console.error(error);
    throw error;
  });
};
