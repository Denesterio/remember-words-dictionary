<template>
  <div>
    <button
      @click="exportDictionaries"
      class="download_button"
      :disabled="procesing"
    >
      Скачать словари файлом
    </button>
    <button
      @click="getDictionariesFile"
      class="download_button"
      :disabled="procesing"
    >
      Загрузить словари из файла
    </button>
    <base-alert-component v-show="alert.length" :alert="alert" />
  </div>
</template>

<script>
import { exportToJson, importFromJson } from "../jsonHandlers.js";
import BaseAlertComponent from "./BaseAlertComponent.vue";
export default {
  components: { BaseAlertComponent },
  data() {
    return {
      alert: "",
      procesing: false,
    };
  },

  methods: {
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
    getDictionariesFile() {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", ".json");
      input.setAttribute("hidden", "true");
      input.setAttribute("aria-hidden", "true");
      document.body.appendChild(input);
      input.addEventListener("change", (event) => {
        this.procesing = true;
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.readAsText(file);
        reader.addEventListener("load", () => {
          importFromJson(reader.result)
            .then(() => {
              this.showAlert("Словари успешно загружены");
            })
            .catch(() => {
              this.showAlert("Не удалось загрузить словари");
            })
            .finally(() => {
              this.procesing = false;
              input.remove();
            });
        });
        reader.addEventListener("error", () => {
          this.showAlert("Не удалось прочитать файл");
          this.procesing = false;
          input.remove();
        });
      });
      input.click();
    },

    showAlert(alert) {
      this.alert = alert;
      setTimeout(() => (this.alert = ""), 2000);
    },
  },
};
</script>