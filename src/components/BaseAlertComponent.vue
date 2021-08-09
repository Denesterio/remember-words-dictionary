<template>
  <div class="alert">
    <p>{{ alert }}</p>
  </div>
</template>

<script>
export default {
  props: {
    alert: {
      type: String,
      required: false,
      default: "",
    },
  },
};
</script>