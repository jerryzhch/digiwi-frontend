import $ from "dom7";
import Framework7 from "framework7/bundle";

// Import F7 Styles
import "framework7/framework7-bundle.css";

// Import Icons and App Custom Styles
import "../css/icons.css";
import "../css/app.less";

// Import Routes
import routes from "./routes.js";
// Import Store
import store from "./store.js";

// Import main app component
import App from "../app.f7";

var app = new Framework7({
  name: "My App", // App name
  theme: "auto", // Automatic theme detection
  el: "#app", // App root element
  component: App, // App main component

  on: {
    init: function () {
      console.log("App initialized");
    },
    pageInit: function () {
      console.log("Page initialized");
      start();
    },
  },
  // App store
  store: store,
  // App routes
  routes: routes,
  // Register service worker (only on production build)
  serviceWorker:
    process.env.NODE_ENV === "production"
      ? {
          path: "/service-worker.js",
        }
      : {},
});

function start() {
  const categoryForm = document.getElementById("category-form");
  $(".category").on("click", (e) => {
    if (e.target.classList.contains("button-fill")) {
      e.target.classList.remove("button-fill");
      e.target.classList.remove("selectedCat");
    } else {
      e.target.classList.add("button-fill");
      e.target.classList.add("selectedCat");
    }
  });

  $(".start-search").on("click", (e) => {
    let selectedCats = [];
    [...categoryForm.querySelectorAll(".selectedCat")].map((el) => {
      selectedCats.push(el.getAttribute("name"));
    });
  });
}
