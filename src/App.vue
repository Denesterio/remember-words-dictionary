<template>
  <main>
    <h3>{{ title }}</h3>
    <div class="tabset">
      <div class="selects_container">
        <div>
          <select
            v-model="currentProfileName"
            class="select_profile"
            name="profileChange"
          >
            <option :value="{}" hidden>Select Profile</option>
            <option v-for="name in profileNames" :key="name" :value="name">
              {{ name }}
            </option>
          </select>
          <label for="profileChange">Выбрать&nbsp;профиль</label>
        </div>
        <div class="select_container_right">
          <label for="langChange">Выбрать&nbsp;языки</label>
          <select v-model="firstLang" class="select_profile" name="langChange">
            <option v-for="lang in profileLangs" :key="lang" :value="lang">
              {{ lang }}
            </option>
          </select>
          <svg
            @click="changeLangs"
            class="change_langs_arrows"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="14"
            height="14"
            viewBox="0 0 172 172"
            style="fill: #000000"
          >
            <g
              fill="none"
              fill-rule="nonzero"
              stroke="none"
              stroke-width="1"
              stroke-linecap="butt"
              stroke-linejoin="miter"
              stroke-miterlimit="10"
              stroke-dasharray=""
              stroke-dashoffset="0"
              font-family="none"
              font-weight="none"
              font-size="none"
              text-anchor="none"
              style="mix-blend-mode: normal"
            >
              <path d="M0,172v-172h172v172z" fill="none"></path>
              <g fill="#ffffff">
                <path
                  d="M142.70625,97.95938c-1.6125,-1.6125 -4.16563,-1.6125 -5.64375,0c-1.6125,1.6125 -1.6125,4.16562 0,5.64375l19.8875,20.02187h-108.575c-2.28438,0 -4.03125,1.74688 -4.03125,4.03125c0,2.28438 1.74687,4.03125 4.03125,4.03125h108.575l-20.02187,20.02187c-1.6125,1.6125 -1.6125,4.16563 0,5.64375c0.80625,0.80625 1.88125,1.20938 2.82187,1.20938c0.94062,0 2.01563,-0.40313 2.82188,-1.20938l26.875,-26.875c1.6125,-1.6125 1.6125,-4.16562 0,-5.64375zM127.79063,47.03125c0,-2.28438 -1.74687,-4.03125 -4.03125,-4.03125h-108.70937l20.02188,-20.02187c1.6125,-1.6125 1.6125,-4.16562 0,-5.64375c-1.6125,-1.6125 -4.16562,-1.6125 -5.64375,0l-26.875,26.875c-1.6125,1.6125 -1.6125,4.16562 0,5.64375l26.875,26.875c0.80625,0.80625 1.88125,1.20938 2.82188,1.20938c0.94063,0 2.01563,-0.40313 2.82187,-1.20938c1.6125,-1.6125 1.6125,-4.16562 0,-5.64375l-20.02188,-20.02188h108.575c2.28437,0 4.16562,-1.74687 4.16562,-4.03125z"
                ></path>
              </g>
            </g>
          </svg>
          <select v-model="secondLang" class="select_profile" name="langChange">
            <option
              v-for="lang in filteredProfileLangs"
              :key="lang"
              :value="lang"
            >
              {{ lang }}
            </option>
          </select>
        </div>
      </div>
      <input
        v-model="currentComponent"
        type="radio"
        name="tabset_1"
        id="tabset_1_teach"
        hidden
        aria-hidden="true"
        checked
        value="DictionaryFormComponent"
      />
      <input
        v-model="currentComponent"
        type="radio"
        name="tabset_1"
        id="tabset_1_add"
        hidden
        aria-hidden="true"
        value="AddWordsFormComponent"
      />
      <ul class="tabs">
        <li
          class="tab"
          :class="{
            tab_active: currentComponent === 'DictionaryFormComponent',
          }"
        >
          <label for="tabset_1_teach">Учить</label>
        </li>
        <li
          class="tab"
          :class="{
            tab_active: currentComponent === 'AddWordsFormComponent',
          }"
        >
          <label for="tabset_1_add">Редактировать</label>
        </li>
      </ul>

      <component
        :is="currentComponent"
        class="content"
        :profileName="currentProfileName"
        :langs="profileLangs"
        :reverseDictName="reverseDictName"
        :dictName="dictName"
        @updateProfile="updateProfile"
      ></component>
    </div>
    <button @click="exportDictionaries" class="download_button">
      Скачать словари файлом
    </button>
  </main>
</template>

<script>
import AddWordsFormComponent from "./components/AddWordsFormComponent.vue";
import DictionaryFormComponent from "./components/DictionaryFormComponent.vue";
import initDB from "./initDB.js";
import { getStore, getPreparedName } from "./handlersDB.js";
import { exportToJson } from "./exportToJson.js";

export default {
  name: "App",
  components: {
    AddWordsFormComponent,
    DictionaryFormComponent,
  },
  data() {
    return {
      currentComponent: "DictionaryFormComponent",
      profiles: [],
      currentProfileName: "Без названия",
      firstLang: "английский",
      secondLang: "русский",
    };
  },

  created() {
    initDB().then(() => {
      getStore(window.PROFILESTORE, (profiles) => {
        this.profiles = profiles.map((p) => {
          return {
            profileName: p.profileName,
            profileLangs: [...p.profileLangs],
          };
        });
      });
    });
    const componentType = new URL(window.location).searchParams.get("type");
    if (componentType === "edit") {
      this.currentComponent = "AddWordsFormComponent";
    }
  },

  mounted() {},

  computed: {
    title() {
      return this.currentComponent === "DictionaryFormComponent"
        ? "Помощник в запоминании слов"
        : "Создание профиля и словарей";
    },
    profileNames() {
      return this.profiles.map((pr) => pr.profileName);
    },
    profileLangs() {
      const currentProfile = this.profiles.find(
        (pr) => pr.profileName === this.currentProfileName
      );
      return currentProfile ? currentProfile.profileLangs : [];
    },
    filteredProfileLangs() {
      if (this.profileLangs) {
        return (
          [...this.profileLangs].filter((lang) => lang !== this.firstLang) ?? []
        );
      }
      return this.profileLangs;
    },
    dictName() {
      return getPreparedName(
        this.currentProfileName + this.firstLang + this.secondLang
      );
    },
    reverseDictName() {
      return getPreparedName(
        this.currentProfileName + this.secondLang + this.firstLang
      );
    },
  },

  methods: {
    changeLangs() {
      let temp = this.firstLang;
      this.firstLang = this.secondLang;
      this.secondLang = temp;
    },

    updateProfile(profile) {
      const dublicate = this.profiles.find(
        (p) => p.profileName === profile.profileName
      );
      if (dublicate) {
        dublicate.profileLangs = profile.profileLangs;
      } else {
        this.profiles = [profile, ...this.profiles];
        this.currentProfileName = profile.profileName;
        this.firstLang = [...profile.profileLangs][0];
      }
    },
    exportDictionaries() {
      exportToJson(window.BASENAME).then((exportObject) => {
        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(JSON.stringify(exportObject));
        const downloadAnchorNode = document.createElement("a");
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute(
          "download",
          "exportedDictionaries" + ".json"
        );
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
      });
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Verdana, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin-top: 60px;
}
</style>
