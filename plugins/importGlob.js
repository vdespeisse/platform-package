import { sync } from 'fast-glob'
import * as path from 'path'
const isGlob = source => source.includes('*')
export default function importGlob() {
  const importerMap = {}
  const codeMap = {}
  return {
    name: 'import-glob', // this name will show up in warnings and errors
    resolveId(source, importer) {
      
      if (isGlob(source)) {
        const extension = source.split('.').slice(-1)[0]
        // const id =  source.replace('.' + extension, '')
        importerMap[source] = {
          dirname: path.dirname(importer),
          extension,
        }
        console.log('dirname', path.dirname(importer))
        return source; // this signals that rollup should not ask other plugins or check the file system to find this id
      }
      return null; // other ids should be handled as usually
    },
    load(id) {
      if (isGlob(id)) {
        console.log('ID', id)
        const { dirname, extension } = importerMap[id]
        // const files = sync([path.join(dirname,`${id}.${extension}`)])
        const files = sync([path.join(dirname, id)])
        console.log('files', id.split('glob:')[1], files, )
        const body = files.reduce((acc, filePath) => {
          const relativePath = filePath.replace(dirname, '.')
          acc +=  `'${relativePath}': () => import('${filePath}'),\n`
          return acc
        }, '')
        // return 'export default "This is virtual!"'
        codeMap[id] =  `export default {
          ${body}
        }`
        return `export default {
          ${body}
        }`
      }
      return null
      // if (id === 'virtual-module') {
      //   return 'export default "This is virtual!"'; // the source code for "virtual-module"
      // }
      // return null; // other ids should be handled as usually
    },
    transform(code, id) {
      if (isGlob(id)) {
        console.log('transform', code)
        console.log(codeMap[id])
        // return 'export default "this is virtual"'
        return codeMap[id]
      }
      return null
      // console.log('-----------------')
      // return code
    }
  };
}

// export default function importGlob () {
//   return {
//     name: 'my-example', // this name will show up in warnings and errors
//     resolveId ( source ) {
//       console.log('source',source)
//       if (source === './components/ui/**/*.vue') {
//         console.log('parsing')
//         return 'components/ui/**/*.vue'.split('/').join('--').split('.').join('--'); // this signals that rollup should not ask other plugins or check the file system to find this id
//       }
//       return null; // other ids should be handled as usually
//     },
//     load ( id ) {
//       console.log(id, 'id')
//       if (id === 'components--ui--**--*--vue') {
//         console.log('loading')
//         return 'export default "This is virtual!"'; // the source code for "virtual-module"
//       }
//       return null; // other ids should be handled as usually
//     }
//   };
// }
