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
    pageInit: async function () {
      console.log("Page initialized");
      setTimeout(() => {
        start();
      }, 500);
    },
  },
  card: {
    hideNavbarOnOpen: true,
    closeByBackdropClick: true,
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
  // load categories
  let categories = ["Accounting", "Team Communication", "Time Tracking", "Billing", "Web ", "Inventory / Supply Chain", "Customer Database"];
  var result = chunkArray(categories, 4);
  categoryForm.innerHTML = "";
  result.forEach((element) => {
    getCatRow(element, categoryForm);
  });
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
    [...$(".selectedCat")].map((el) => {
      selectedCats.push(el.getAttribute("name"));
    });
    const resultsRow = document.querySelector(".results-row");

    resultsRow.appendChild(getCompRow());
    const inputText = app.form.convertToData("#searchbar-autocomplete").search;
  });
}

function getCatRow(arr, toInsertIn) {
  const newP = cE("p");
  newP.setAttribute("class", "row");
  arr.forEach((catName) => {
    const newDiv = cE("div");
    newDiv.setAttribute("class", "col category button button-small button-outline");
    newDiv.setAttribute("name", catName);
    newDiv.innerHTML = catName;
    newP.appendChild(newDiv);
  });
  toInsertIn.insertBefore(newP, toInsertIn.querySelector(".row"));
}

function cE(el) {
  return document.createElement(el);
}

function chunkArray(myArray, chunk_size) {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    tempArray.push(myArray.slice(index, index + chunk_size));
  }

  return tempArray;
}

function getCompRow() {
  const cardDiv = cE("div");
  const cardContent = cE("div");
  const bgColor = cE("div");
  const cardHeader = cE("div");
  const small1 = cE("small");
  const small2 = cE("small");
  const small3 = cE("small");
  const cardClose = cE("a");
  const cardCloseI = cE("i");
  const cardContentPadding = cE("div");
  const address = cE("p");

  cardDiv.setAttribute("class", "col-30 card card-expandable");
  cardContent.setAttribute("class", "card-content");
  bgColor.setAttribute("class", "bg-color-red");
  bgColor.style = "height: 300px";
  cardHeader.setAttribute("class", "card-header text-color-white display-block");
  small1.setAttribute("style", "opacity: 0.7");
  small2.setAttribute("style", "opacity: 0.7");
  small3.setAttribute("style", "opacity: 0.7");
  cardClose.setAttribute("href", "#");
  cardClose.setAttribute("class", "link card-close card-opened-fade-in color-white");
  cardClose.setAttribute("style", "position: absolute; right: 15px; top: 15px");
  cardCloseI.setAttribute("class", "icon f7-icons");
  cardContentPadding.setAttribute("class", "card-content-padding");
  address.innerHTML = "Technoparkstrasse 2, 8406 Winterthur";
  cardCloseI.innerHTML = "xmark_circle_fill";
  small1.innerHTML = "sklnvsfnvofipvsfmpvmsfop";
  cardContentPadding.appendChild(address);
  cardClose.appendChild(cardCloseI);
  cardHeader.innerHTML = "Framework7";
  cardHeader.innerHTML += "<br />";
  cardHeader.appendChild(small1);
  cardHeader.innerHTML += "<br />";
  cardHeader.appendChild(small2);
  cardHeader.innerHTML += "<br />";
  cardHeader.appendChild(small3);
  cardHeader.innerHTML += "<br />";
  bgColor.appendChild(cardHeader);
  bgColor.appendChild(cardClose);
  cardContent.appendChild(bgColor);
  cardContent.appendChild(cardContentPadding);
  cardDiv.appendChild(cardContent);
  return cardDiv;
}
