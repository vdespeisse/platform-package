import { translatePattern, evaluatePattern, findValue, putValue} from './translation.js';

let mockupData = {
  a: {
    b: 'b',
    c: {
      d: 'd',
      e: 'e'
    }
  },
  x: 0.55,
  y: "2020-12-31T00:00:00.000Z",
}

let translations = {
  key1: {
    en: "{{data.a.c.d}} and {{data.a.b}}",
    fr: "{{data.a.c.d}} et {{data.a.b}}",
  },
  key2: {
    en: "a percent {{#formats.percent}}{{data.x}}{{/formats.percent}}",
    fr: "un pourcentage {{#formats.percent}}{{data.x}}{{/formats.percent}}",
  },
  key3: {
    en: "nested example: {{translations.key1}}",
    fr: "exemple imbriqué : {{translations.key1}}"
  }
}

describe('translatePattern', () => {
  it('should evaluate a pattern in the specified language', () => {
    expect(translatePattern('en', 'key1', {data: mockupData, translations})).toBe("d and b")
    expect(translatePattern('fr', 'key1', {data: mockupData, translations})).toBe("d et b")
  });

  it('should evaluate a pattern recursivelly', () => {
    expect(translatePattern('en', 'key3', {data: mockupData, translations})).toBe("nested example: d and b")
    expect(translatePattern('fr', 'key3', {data: mockupData, translations})).toBe("exemple imbriqué : d et b")
  });
});

describe('evaluatePattern', () => {
  it('should evaluate a pattern using the given data', () => {
    let pattern = "{{a.c.d}} and {{a.b}}"
    expect(evaluatePattern(pattern, (value) => findValue(mockupData, value), 'en'))
      .toBe("d and b");
  });

  it('should evaluate a pattern with no variables as itself', () => {
    let pattern = "some non variable pattern";
    expect(evaluatePattern(pattern, (value) => findValue(mockupData, value), 'en'))
      .toBe(pattern);
  });

  it('should preserve variables on unfound values', () => {
    let pattern = "{{a.x.d}} and {{a.b}}"
    expect(evaluatePattern(pattern, (value) => findValue(mockupData, value), 'en'))
      .toBe("{{a.x.d}} and b");
  });

  it('should format data values', () => {
    let percentPattern = "{{#formats.percent}}{{x}}{{/formats.percent}}"
    let datePattern =  "{{#formats.date}}{{y}}{{/formats.date}}"
    expect(evaluatePattern(percentPattern, (value) => findValue(mockupData, value), 'en'))
      .toBe("55.00%");

    expect(evaluatePattern(datePattern, (value) => findValue(mockupData, value), 'en'))
      .toBe("December 31, 2020");
  });

  // Not working in node v12
  it.skip('should respect locale for data formatting', () => {
    let percentPattern = "{{#formats.percent}}{{x}}{{/formats.percent}}"
    let datePattern =  "{{#formats.date}}{{y}}{{/formats.date}}"

    expect(evaluatePattern(percentPattern, (value) => findValue(mockupData, value), 'fr'))
      .toBe("55,00 %");

    expect(evaluatePattern(datePattern, (value) => findValue(mockupData, value), 'fr'))
      .toBe("31 décembre 2020");
  });
});

describe('findValue', () => {
  it('should retrieve a value at a specified path within an object', () => {
    expect(findValue(mockupData, 'a.c.d')).toBe('d');
  });
  it('should return undefined if path not found in data', () => {
    expect(findValue(mockupData, 'a.b.x')).toBeUndefined();
  });
})
