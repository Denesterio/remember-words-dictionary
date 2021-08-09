<template>
  <div class="container">
    <button @click="start" class="start_button" :disabled="gameProcessing">
      начать
    </button>
    <div class="word_container">{{ wordToShow }}</div>
    <div class="translations_container" tabindex="0">
      {{ translationToShow }}
    </div>
    <div class="buttons_container">
      <button
        @click="answerHandler(null)"
        class="button_left"
        :disabled="isButtonsDisabled"
      >
        не запомнил
      </button>
      <button @click="answerHandler('bad')" :disabled="isButtonsDisabled">
        плохо
      </button>
      <button @click="answerHandler('good')" :disabled="isButtonsDisabled">
        хорошо
      </button>
      <button @click="answerHandler('perfect')" :disabled="isButtonsDisabled">
        отлично
      </button>
    </div>
  </div>
</template>

<script>
import { getRecord, putRecord } from "../handlersDB.js";
const getRandom = (max) => {
  // получение случайного числа
  return Math.floor(Math.random() * max);
};
export default {
  props: {
    profileName: {
      type: String,
      required: true,
    },
    dictName: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      dictionary: {},
      gameProcessing: false,
      nextProcessing: false,
      activeWord: [],
    };
  },

  computed: {
    dictToShow() {
      const now = Date.now();
      return Object.entries(this.dictionary).filter(
        (word) => word[1].nextShow < now
      );
    },
    isButtonsDisabled() {
      return !this.gameProcessing && !this.nextProcessing;
    },
    wordToShow() {
      return this.activeWord[0];
    },
    translationToShow() {
      return this.activeWord.length > 0
        ? [...this.activeWord[1].translations].join(" ,")
        : "";
    },
  },

  DELAY_IF_BAD: 32400000,
  DELAY_IF_GOOD: 32400000 * 5,

  mounted() {
    this.getDictionary();
  },

  methods: {
    getDictionary() {
      getRecord(this.dictName, window.DICTSTORE, (dict) => {
        this.dictionary = dict;
      });
    },

    start() {
      this.gameProcessing = true;
      this.next();
    },

    next() {
      if (this.dictToShow.length > 0) {
        const index = getRandom(this.dictToShow.length);
        this.activeWord = this.dictToShow[index];
      } else {
        this.activeWord = [
          "",
          { translations: ["Слова для повторения закончились"] },
        ];
        this.stop();
      }
    },

    stop() {
      this.gameProcessing = false;
    },

    answerHandler(answer) {
      if (!answer) {
        this.next();
        return;
      }
      this.nextProcessing = true;
      delete this.dictionary[this.wordToShow];
      getRecord(this.dictName, window.DICTSTORE, (dict) => {
        switch (answer) {
          case "bad":
            dict[this.wordToShow].nextShow =
              Date.now() + this.$options.DELAY_IF_BAD;
            break;
          case "good":
            dict[this.wordToShow].nextShow =
              Date.now() + this.$options.DELAY_IF_GOOD;
            break;
          case "perfect":
            delete dict[this.wordToShow];
            break;
        }
        putRecord(dict, window.DICTSTORE)
          .then(() => this.next())
          .finally(() => (this.nextProcessing = false));
      });
    },
  },

  watch: {
    dictName() {
      this.gameProcessing = false;
      this.getDictionary();
    },
  },
};
</script>