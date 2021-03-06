import {fetchAndTransform} from './cachedFetch.js';

export default {
  data() {
    return {
      datareports: null,
    }
  },
  created() {
    // TODO comment on why this $watch syntax instead of classic watch key
    this.$watch(() => this.datareportUrls, next => {
      if (!next || next.length === 0) return;

      const download = (url) => {
        return fetchAndTransform(
            url,
            undefined,  // Aparently axios interprets Content-Type: application/json as json
                        // meaning that there is no need for JSON.parse at this point
            {
              fetchOptions: {
                headers: {'Accept': 'application/json'}
              }
            }
          )
          .then(data => {
            return {url, data};
          })
          .catch(error => {
            console.error(error);
            return {url, data: null}
          })
      }

      this.datareports = null

      Promise.all(
        next // for every datareportUrl, map to unique urls to download
          .map(({url, datareport}) => url)
          .unique()
          .map(download) // Fetch data (see above)
        )
        // reformat downloads to have an object {someurl: somedata, ...} instead of [{url: someurl, data:somedata}]
        .then(downloads => {
          return downloads
          .reduce((acc, {url, data}) => {
            acc[url] = data;
            return acc;
          }, {})
        })
        // then for every datareportUrl, construct an object {somedatareport: somedata, ...}
        .then(downloads => {
          return next
          .reduce((acc, {datareport, url}) => {
            acc[datareport] = downloads[url]
            return acc;
          }, {})
        })
        .then(datareports => {
          this.datareports = Object.freeze(datareports)
        })
    }, { deep: true, immediate: true })
  },
}
