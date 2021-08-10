const addTranslations = (words, newWords) => {
  if (!words & (newWords.length === 1)) {
    return newWords[0];
  }
  const trls = words ? words.split(',') : [];
  for (const word of newWords) {
    if (!trls.includes(word)) {
      trls.push(word);
    }
  }
  return trls.join(', ');
};

export { addTranslations };
