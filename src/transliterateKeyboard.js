export default str => {
  const replacer = {
    q: 'й',
    w: 'ц',
    e: 'у',
    r: 'к',
    t: 'е',
    y: 'н',
    u: 'г',
    i: 'ш',
    o: 'щ',
    p: 'з',
    '[': 'х',
    ']': 'ъ',
    a: 'ф',
    s: 'ы',
    d: 'в',
    f: 'а',
    g: 'п',
    h: 'р',
    j: 'о',
    k: 'л',
    l: 'д',
    ';': 'ж',
    "'": 'э',
    z: 'я',
    x: 'ч',
    c: 'с',
    v: 'м',
    b: 'и',
    n: 'т',
    m: 'ь',
    ',': 'б',
    '.': 'ю',
    '/': '.',
    '?': ','
  };

  const first = str.substr(0, str.length - 1);
  const last = str[str.length - 1];

  if (last.toLowerCase() === last) {
    return first + (replacer[last] || last);
  }
  return first + (replacer[last.toLowerCase()]?.toUpperCase() || last);
};
