<template>
  <div>
    <div v-if="response?.title">
      <slot
        :img="response.image"
        :title="response.title"
        :description="response.description"
        :url="url"
      >
        <a :href="url" target="_blank" style="all: inherit">
          <div
            class="link-preview-wrapper"
            :style="{ width: link - previewWidth }"
          >
            <div class="link-preview-img">
              <img :src="response.image" />
            </div>
            <div class="link-preview-info">
              <div class="link-preview-text">
                <h1>{{ response.title }}</h1>
                <p>{{ response.description }}</p>
              </div>
            </div>
          </div>
        </a>
      </slot>
      <br />
    </div>
  </div>
</template>

<script>
export default {
  name: "link-preview",
  props: {
    url: {
      type: String,
      default: "",
    },
    cardWidth: {
      type: String,
      default: "max-content",
    },
    onButtonClick: {
      type: Function,
      default: undefined,
    },
    showButton: {
      type: Boolean,
      default: true,
    },
    apiUrl: {
      type: String,
      default: "https://link-prevue-api-v2.herokuapp.com/preview/",
    },
  },
  watch: {
    url: function () {
      this.response = null;
      this.getLinkPreview();
    },
  },
  created() {
    this.getLinkPreview();
  },
  data: function () {
    return {
      response: null,
      validUrl: false,
    };
  },
  methods: {
    viewMore: function () {
      if (this.onButtonClick !== undefined) {
        this.onButtonClick(this.response);
      } else {
        const win = window.open(this.url, "_blank");
        win.focus();
      }
    },
    isValidUrl: function (url) {
      const regex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
      this.validUrl = regex.test(url);
      return this.validUrl;
    },
    getLinkPreview: function () {
      if (this.isValidUrl(this.url)) {
        this.httpRequest(
          (response) => {
            this.response = JSON.parse(response);
          },
          () => {
            this.response = null;
            this.validUrl = false;
          }
        );
      }
    },
    httpRequest: function (success, error) {
      const http = new XMLHttpRequest();
      const params = "url=" + this.url;
      http.open("POST", this.apiUrl, true);
      http.setRequestHeader(
        "Content-type",
        "application/x-www-form-urlencoded"
      );
      http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
          success(http.responseText);
        }
        if (http.readyState === 4 && http.status === 500) {
          error();
        }
      };
      http.send(params);
    },
  },
};
</script>

<style>
.link-preview-wrapper {
  overflow: hidden;
  border-radius: 7px 7px 7px 7px;
  background-color: hsla(var(--bg-dark), 15%);
  display: flex;
  align-items: center;
  height: 150px;
  width: max-content;
  max-width: 90%;
  cursor: pointer;
  transition: all 0.2s;
}
.link-preview-wrapper:hover {
  background-color: hsla(var(--bg-dark), 17%);
}
.link-preview-wrapper a {
  /* The entire element is wrapped in a link, so we don't want browser styling */
  all: inherit;
}
.link-preview-img {
  width: 30%;
  height: 100%;
}
.link-preview-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
img {
  vertical-align: middle;
  border-style: none;
}
.link-preview-info {
  border-radius: 0 0 7px 7px;
}
.link-preview-text {
  margin-left: 20px;
}
.link-preview-text h1 {
  font-size: 18px;
  margin: 5px 0 5px 0;
}
.link-preview-text p {
  overflow: hidden;
  margin: 0;
  padding-right: 7px;
}
</style>