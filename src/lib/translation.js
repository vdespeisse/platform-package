import Mustache from 'mustache';

// TODO find a library that does both this things:

// Finds the value at a given dot path in an object
export const findValue = (data, dotPath) => {
  let result = dotPath.split('.').reduce((acc, nextKey) => {
    if (!acc) return; // path not found
    return acc[nextKey]
  }, data);
  return result;
}

// Puts a value at a given dot path in an object
// Note: This is a destructive method as it changes its `data` parameter
export const putValue = (data, dotPath, value) => {
  let position = data;
  let keys = dotPath.split('.');
  keys.forEach((key, i) => {
    if (i === keys.length - 1) { // last key
      position[key] = value;
      return;
    }
    if (position[key] === undefined) {
      position[key] = {};
    }
    position = position[key];
  });
}

export const translatePattern = (lang, translationKey, data, evaluating = []) => {
  let currentEvaluations = [...evaluating, translationKey];
  let {translations = {}} = data;

  // TODO use common format functions instead
  // TODO pass custom formats in options
  let formats = {
    percent: () => (value, render) => {
      let formatter = new Intl.NumberFormat(lang, {
        style: 'percent',
        minimumFractionDigits: 2,
      });
      let evaluation = Mustache.render(value, data);
      if (evaluation.length == 0)
        return value
      let numericValue = parseFloat(evaluation);
      return formatter.format(numericValue);
    },
    date: () => (value, render) => {
      // let options = {
      //   day: "numeric",
      //   month: "long",
      //   year: "numeric",
      // }
      // let formatter = new Intl.DateTimeFormat(lang, options);
      let evaluation = Mustache.render(value, data);
      if (evaluation.length == 0)
        return value
      let dateValue = new Date(evaluation);

      // TODO use a configurable formatting rule
      let ye = new Intl.DateTimeFormat(lang, { year: 'numeric' }).format(dateValue);
      let mo = new Intl.DateTimeFormat(lang, { month: 'long' }).format(dateValue);
      let da = new Intl.DateTimeFormat(lang, { day: 'numeric' }).format(dateValue);
      if (lang === 'de') {
        return `${da}. ${mo} ${ye}`;
      }
      if (lang === 'pt') {
        return `${da} de ${mo} de ${ye}`;
      }
      if (lang === 'fr' && da === '1') {
        da = '1er'
      }
      return `${da} ${mo} ${ye}`;
    },
    year: () => (value, render) => {
      let options = {year: "numeric"}
      let evaluation = Mustache.render(value, data);
      if (evaluation.length == 0)
        return value
      let dateValue = new Date(evaluation);
      return dateValue.getFullYear();
    },
    millions: () => (value, render) => {
      let formatter = new Intl.NumberFormat(lang, {
        maximumFractionDigits: 1,
      });
      let evaluation = Mustache.render(value, data);
      if (evaluation.length == 0)
        return value
      let numericValue = parseFloat(evaluation) / 1000000;
      return formatter.format(numericValue);
    }
  }
  // Expecting a translation structure as
  // {myKey: {en: 'My value', fr: 'Ma valeur'}}
  let patterns = translations[translationKey] || {}

  // If no translation found for the translationKey, consider it wasn't a translation after all
  // or prefer to return the plain translationKey when the language's translation is empty.
  if (!patterns[lang]) {
    return translationKey;
  }

  // now consider the found value as a text pattern
  let pattern = patterns[lang];

  // find variables in that pattern
  let parseTree = Mustache.parse(pattern);

  // This finds all variables in the tree expression of the pattern
  // Note nested iterating variables will be interpreted as a flattened structure.
  // https://github.com/janl/mustache.js/issues/538
  let reduceVariables = (tree) => {
    let variables = [];
    tree.forEach(node => {
      let [type, variable] = node;
      if (type === 'name') {
        variables.push(variable)
      } else if (['^', '#'].includes(type)) {
        variables.push(variable);
        variables = variables.concat(reduceVariables(node[4]))
      }
    });
    return variables;
  }

  let variables = reduceVariables(parseTree);

  // check if variable values are translation keys and evaluate them
  let evaluatedData = {};

  variables.forEach(variable => {
    let value;
    if (variable.startsWith('translations.')) { // accept a translation key as variable
      value = variable.split('.')[1]; // take the first path after 'translations'
    } else {
      value = findValue(data, variable);
    }
    if (value !== undefined) {
      // circular reference detection
      if (currentEvaluations.includes(value)) {
        console.error(`Circular reference found when translating '${value}', evaluation stack:`, currentEvaluations);
      } else { // evaluate the new value
        // either the value is a translation key, in such case interpret it, otherwise keep the value as is.
        value = translatePattern(lang, value, data, currentEvaluations);
      }
      putValue(evaluatedData, variable, value)
    }
  });

  return Mustache.render(pattern, {...evaluatedData, formats});
}

export const evaluatePattern = (pattern, resolveVariable, lang = 'en') => {
  // TODO use common format functions instead
  let formats = {
    percent: () => (value, render) => {
      let formatter = new Intl.NumberFormat(lang, {
        style: 'percent',
        minimumFractionDigits: 2,
      });
      let evaluation = evaluatePattern(value, resolveVariable, lang);
      if (evaluation.length == 0)
        return value
      let numericValue = parseFloat(evaluation);
      return formatter.format(numericValue);
    },
    date: () => (value, render) => {
      let options = {year: "numeric", month: "long", day: "numeric"}
      let formatter = new Intl.DateTimeFormat(lang, options);
      let evaluation = evaluatePattern(value, resolveVariable, lang);
      if (evaluation.length == 0)
        return value
      let dateValue = new Date(evaluation);
      return formatter.format(dateValue);
    },
    year: () => (value, render) => {
      let options = {year: "numeric"}
      let evaluation = evaluatePattern(value, resolveVariable, lang);
      if (evaluation.length == 0)
        return value
      let dateValue = new Date(evaluation);
      return dateValue.getFullYear();
    },
    millions: () => (value, render) => {
      let formatter = new Intl.NumberFormat(lang, {
        maximumFractionDigits: 1,
      });
      let evaluation = evaluatePattern(value, resolveVariable, lang);
      if (evaluation.length == 0)
        return value
      let numericValue = parseFloat(evaluation) / 1000000;
      return formatter.format(numericValue);
    }
  }
  let parse = Mustache.parse(pattern);
  let variables = new Set(parse
    .filter(([type]) => type === 'name')
    .map(([type, variable]) => variable)
  );

  let evaluatedData = {};

  variables.forEach(variable => {
    let value = resolveVariable(variable, lang)
    if (value === undefined) {
      value = `{{${variable}}}`
    }
    putValue(evaluatedData, variable, value)
  });

  return Mustache.render(pattern, {...evaluatedData, formats});
}
