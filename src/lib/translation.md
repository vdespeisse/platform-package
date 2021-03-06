# Translation patterns

The pattern translation feature is provided by the `translation` mixin. This makes available the method `translatePattern` in every component.

The function expects a language, the translation key, and a set of data to use for variable interpolation. The data should include the translations object for key --> pattern resolution, plus any other arbitrary keys for custom data.

```js
this.translatePattern(
  this.lang, // "en"...
  key, // the translation key
  {​​​​​​​
    translations, // <-- this is where we expect the key->pattern mapping
    data1, // this is where the data to use as variables in the patterns
    //...
  }​​​​​​​
);
```

The `translations` object has the following structure:
```js
{​​​​​​​
  key1: {
    en: "pattern",
    fr: "pattern",
    //...
    }​​​​​​​,
  key2: {
    ​​​​​//​​...
  }​​​​​​​,
  //...
}​​​​​​​
```
## Patterns

### Simple data interpolation

The patterns are written in [mustache](https://www.npmjs.com/package/mustache) format. Example:
```
"hello {​​​​​​​{​​​​​​​data1.path.to.myVariable}​​​​​​​}​​​​​​​"
```

### Value formatting

We can use some value formatting options. Currently a limited set of formatting options are available (those required for DCI):

Example:
```
"This is formatted as a percent value {​​​​​​​{​​​​​​​#formats.percent}​​​​​​​}​​​​​​​{​​​​​​​{​​​​​​​data.percent_value}​​​​​​​}​​​​​​​{​​​​​​​{​​​​​​​/formats.percent}​​​​​​​}​​​​​​​"
```

Value formatting will respect, when pertinent, the locale defined by the specified language.

Available formats:
- `formats.percent`: `0.0035` --> `0.35%`
- `formats.date`: `2008-07-18T00:00:00.000Z` --> `July 18, 2008`
- `formats.year`: `2008-07-18T00:00:00.000Z` --> `2008`
- `formats.millions`: `1000000` -> `1`

Date values can be any string that can be interpreted by the standard date constructor: `new Date(myDateValue)`.

### Translation pattern reuse

We can reference other translation keys as values, this allows to maintain recurrent patterns at a single place:

Example:

```js
translations:
{​​​​​​​
  "share_class": {​​​​​​​
    "en": "Class {​​​​​​​{​​​​​​​ share_referential.class_identifier }​​​​​​​}​​​​​​​ {​​​​​​​{​​​​​​​ share_referential.instit_ret }​​​​​​​}​​​​​​​ {​​​​​​​{​​​​​​​ share_referential.class_currency }​​​​​​​}​​​​​​​ {​​​​​​​{​​​​​​​ share_referential.acc_distr }​​​​​​​}​​​​​​​",
  },
  "share_dividends_acc": {​​​​​​​
    "en": "{​​​​​​​{​​​​​​​ translations.share_class }​​​​​​​}​​​​​​​ does not pay a dividend."
  }​​​​​​​,
  "share_dividends_distr": {​​​​​​​
    "en": "{​​​​​​​{​​​​​​​ translations.share_class }​​​​​​​}​​​​​​​ pays a dividend annually by January 30 each year."
  }​​​​​​​
}​​​​​​​
```

## Use in templates/computed

You can create a computed function that will bind the generic `translationPattern` function to the data and language of your report:

```js
computed: {​​​​​​​
  translatedText() {​​​​​​​
    return (key) => {​​​​​​​
      let {​​​​​​​
        translations,
        fund_referential,
        share_referential,
        share_performance,
      }​​​​​​​ = this.data;
      return this.translatePattern(
        this.lang,
        key,
        {​​​​​​​
          translations,
          fund_referential,
          share_referential,
          share_performance,
        }​​​​​​​
      );
    }​​​​​​​
  }​​​​​​​,
```

This function can then be used either by using a key extracted from your component's data:

```
pdf-table-fees(
    ...
    :performance_fee="translatedText(data.fund_referential.performance_fee_text)"
)
```

or by directly specifying a translation key:
```
brick(:title="translatedText('performance_title')")
```
