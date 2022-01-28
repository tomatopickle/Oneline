<template>
  <div class="link-preview-parent">
    <div v-if="response?.title">
      <slot
        :img="response.image"
        :title="response.title"
        :description="response.description"
        :url="url"
      >
        <a
          :href="url"
          target="_blank"
          style="text-decoration: none; color: inherit"
          class="link-preview-a-element"
        >
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
import axios from "axios";
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
      default:
        "https://api.linkpreview.net/?key=d0ecbf9c55d1f93cb6f40cb5f0bd3663&q=",
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
    getLinkPreview: async function () {
      if (this.isValidUrl(this.url)) {
        axios.get(this.apiUrl + this.url, {}).then((response) => {
          this.response = response.data;
        });
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
.link-preview-parent {
  width: 60% !important;
  margin-right: 7px;
  margin-top: 7px;
}
.link-preview-wrapper {
  overflow: hidden;
  border-radius: 7px 7px 7px 7px;
  background-color: hsla(var(--bg-dark), 15%);
  display: flex;
  align-items: center;
  height: 150px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: break-spaces;
}
.link-preview-wrapper:hover {
  background-color: hsla(var(--bg-dark), 17%);
}
html:not(.dark) .link-preview-wrapper{
  background-color: hsla(var(--bg), 100%);
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px;
}
html:not(.dark) .link-preview-wrapper:hover{
  background-color: hsla(var(--bg), 95%);
}
.link-preview-wrapper a {
  /* The entire element is wrapped in a link, so we don't want browser styling */
  all: inherit;
}
.link-preview-img {
  width: 100%;
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
  /* A little spacing */
  height: 90%;
}
.link-preview-text {
  margin-left: 20px;
}
.link-preview-text h1 {
  font-size: 18px;
  margin: 5px 0 5px 0;
}
.link-preview-text p {
  margin: 0;
  padding-right: 7px;
  text-overflow: ellipsis;
  overflow: hidden;
}
</style>