<template>
  <div class="container">
    <button @click="start" class="base_button" :disabled="gameProcessing">
      начать
    </button>
    <div class="word_container">{{ wordToShow }}</div>
    <div @click="showTranslation" class="translations_container">
      {{ translationToShow }}
    </div>
    <div class="buttons_container">
      <button
        @click="answerHandler(null)"
        class="buttons_container_button_left"
        :disabled="isButtonsDisabled"
      >
        ужасно
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
      dictionary: [],
      gameProcessing: false,
      nextProcessing: false,
      isTranslationVisible: false,
      activeWord: [],
    };
  },

  computed: {
    isButtonsDisabled() {
      return !this.gameProcessing && !this.nextProcessing;
    },
    wordToShow() {
      return this.activeWord[0];
    },
    translationToShow() {
      return this.isTranslationVisible ? this.activeWord[1]?.translations : "";
    },
  },

  DELAY_IF_BAD: 32400000,
  DELAY_IF_GOOD: 32400000 * 5,

  mounted() {
    this.getDictionary();
  },

  beforeUnmount() {
    document.body.removeEventListener("keydown", this.keyHandler);
  },

  methods: {
    getDictionary() {
      getRecord(this.dictName, window.DICTSTORE, (dict) => {
        const now = Date.now();
        this.dictionary = Object.entries(dict).filter(
          (word) => word[1].nextShow < now
        );
      });
    },

    start() {
      this.gameProcessing = true;
      document.body.addEventListener("keydown", this.keyHandler);
      this.next();
    },

    next() {
      if (this.dictionary.length > 0) {
        this.isTranslationVisible = false;
        const index = getRandom(this.dictionary.length);
        this.activeWord = this.dictionary[index];
      } else {
        this.stop();
        this.isTranslationVisible = true;
        this.activeWord = [
          "",
          { translations: "Слова для повторения закончились" },
        ];
      }
    },

    stop() {
      this.gameProcessing = false;
      this.activeWord = [];
      document.body.removeEventListener("keydown", this.keyHandler);
    },

    showTranslation() {
      if (this.gameProcessing) {
        this.isTranslationVisible = true;
      }
    },

    answerHandler(answer) {
      if (!answer) {
        this.next();
        return;
      }
      this.nextProcessing = true;
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
      const id = this.dictionary.findIndex(
        ([word]) => word === this.wordToShow
      );
      this.dictionary.splice(id, 1);
    },

    keyHandler(event) {
      switch (event.code) {
        case "KeyB":
          event.preventDefault();
          this.answerHandler("bad");
          break;
        case "KeyG":
          event.preventDefault();
          this.answerHandler("good");
          break;
        case "Backspace":
          event.preventDefault();
          this.answerHandler(null);
          break;
        case "Enter":
          event.preventDefault();
          this.answerHandler("perfect");
          break;
        case "Space":
          event.preventDefault();
          this.showTranslation();
          break;
        case "Escape":
          this.stop();
          break;
        default:
          return;
      }
    },
  },

  watch: {
    dictName() {
      this.stop();
      this.getDictionary();
    },
  },
};
</script>