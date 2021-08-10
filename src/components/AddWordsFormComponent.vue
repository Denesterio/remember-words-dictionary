<template>
  <div class="add_container">
    <div>
      <label for="addProfile">Новый профиль</label>
      <input
        v-model="newProfile"
        @keyup.enter="addProfile"
        type="text"
        name="addProfile"
      />
      <button @click="addProfile">Добавить</button>
    </div>

    <div>
      <label for="addLang">Новый язык</label>
      <input
        v-model="newLang"
        @keyup.enter="addLang"
        type="text"
        name="addLang"
      />
      <button @click="addLang">Добавить</button>
    </div>
    <div>
      <div></div>
      <div>
        <input
          v-model="isTransliterationConfirmed"
          type="checkbox"
          name="transliterationConfirm"
        />
        <label class="checkLabel" for="transliterationConfirm"
          >Включить автоматическую транслитерацию с английской раскладки на
          русскую для перевода</label
        >
      </div>
      <div></div>
    </div>
    <div>
      <label for="addWord">Новое слово</label>
      <input
        v-model="newWord"
        @keyup.enter.prevent="moveFocusDown"
        type="text"
        name="addWord"
        ref="newWordInput"
      />
      <button @click="addWord">Добавить</button>
    </div>
    <div>
      <label for="addTranslation">Перевод</label>
      <textarea
        v-model="newWordTranslation"
        @keyup.enter="addWord"
        @input="transliterate"
        ref="newWordTranslationInput"
        class="translation_textarea"
      ></textarea>
    </div>
    <base-alert-component v-show="alert.length" :alert="alert" />
  </div>
</template>

<script>
import BaseAlertComponent from "./BaseAlertComponent.vue";
import { putRecord, getRecord, createDefaultDicts } from "../handlersDB.js";
import transliterateInput from "../transliterateKeyboard.js";
import { addTranslations } from "../addTranslations.js";

export default {
  components: { BaseAlertComponent },
  props: {
    profileName: {
      type: String,
      required: true,
    },
    dictName: {
      type: String,
      required: true,
    },
    reverseDictName: {
      type: String,
      required: true,
    },
  },

  data() {
    return {
      newProfile: "",
      newLang: "",
      newWord: "",
      newWordTranslation: "",
      alert: "",
      isTransliterationConfirmed: true,
    };
  },

  computed: {},

  created() {
    const { pathname } = window.location;
    window.history.pushState(null, document.title, `${pathname}?type=edit`);
  },

  beforeUnmount() {
    const { pathname } = window.location;
    window.history.pushState(null, document.title, pathname);
  },

  methods: {
    addProfile() {
      const profile = {
        profileName: this.newProfile,
        profileLangs: ["английский", "русский"],
      };
      putRecord(profile, window.PROFILESTORE);
      createDefaultDicts(profile.profileName);
      this.$emit("updateProfile", profile);
      this.newProfile = "";
    },

    addLang() {
      getRecord(this.profileName, window.PROFILESTORE, (profile) => {
        if (!profile.profileLangs.contains(this.newLang)) {
          profile.profileLangs.push(this.newLang);
          putRecord(profile, window.PROFILESTORE);
        }
        this.newLang = "";
        this.$emit("updateProfile", profile);
      });
    },

    addWord() {
      const translations = this.newWordTranslation
        .split(",")
        .map((tr) => tr.trim());

      getRecord(this.dictName, window.DICTSTORE, (dict) => {
        const dictionary = dict < 0 ? {} : dict;
        if (!dictionary.nameOfDictionaryAsKey) {
          dictionary.nameOfDictionaryAsKey = this.dictName;
        }
        const updatedTranslations = addTranslations(
          dictionary[this.newWord]?.translations,
          translations
        );
        dictionary[this.newWord] = {
          translations: updatedTranslations,
          nextShow: Date.now(),
        };
        this.saveDictionary(dictionary);
      });

      this.fillReverseDict(translations, this.newWord);
      this.$refs.newWordInput.focus();
    },

    fillReverseDict(translations, word) {
      getRecord(this.reverseDictName, window.DICTSTORE, (dict) => {
        const reverseDictionary = dict < 0 ? {} : dict;
        if (!reverseDictionary.nameOfDictionaryAsKey) {
          reverseDictionary.nameOfDictionaryAsKey = this.reverseDictName;
        }
        translations.reduce((acc, current) => {
          const updatedTranslations = addTranslations(
            acc[current]?.translations,
            [word]
          );
          acc[current] = {
            translations: updatedTranslations,
            nextShow: Date.now(),
          };
          return acc;
        }, reverseDictionary);
        this.saveDictionary(reverseDictionary).then(() => {
          this.newWord = "";
          this.newWordTranslation = "";
        });
      });
    },

    saveDictionary(dictionary) {
      return putRecord(dictionary, window.DICTSTORE).then(() => {
        this.alert = "Сохранено!";
        setTimeout(() => (this.alert = ""), 2000);
      });
    },

    moveFocusDown() {
      this.$refs.newWordTranslationInput.focus();
    },

    transliterate() {
      if (this.isTransliterationConfirmed) {
        this.newWordTranslation = transliterateInput(this.newWordTranslation);
      }
    },
  },
};
</script>

<style scoped>
.checkLabel {
  font-size: 0.7rem;
  margin-left: 0.5rem;
}
</style>