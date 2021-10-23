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
  // let categories = ["Accounting", "Team Communication", "Time Tracking", "Billing", "Web ", "Inventory / Supply Chain", "Customer Database"];
  /*var result = chunkArray(categories, 4);
  categoryForm.innerHTML = "";
  result.forEach((element) => {
    getCatRow(element, categoryForm);
  }); */
  app.request
    .json("http://localhost:5000/api/SupplierSearch/keyWords", null, (data) => {
      var result = chunkArray(data, 4);
      categoryForm.innerHTML = "";
      result.forEach((element) => {
        getCatRow(element, categoryForm);
      });
    })
    .then(() => {
      $(".category").on("click", (e) => {
        if (e.target.classList.contains("button-fill")) {
          e.target.classList.remove("button-fill");
          e.target.classList.remove("selectedCat");
        } else {
          e.target.classList.add("button-fill");
          e.target.classList.add("selectedCat");
        }
      });
    });

  $(".start-search").on("click", (e) => {
    let selectedCats = [];
    [...$(".selectedCat")].map((el) => {
      selectedCats.push(el.getAttribute("name"));
    });
    const resultsRow = document.querySelector(".results-row");

    resultsRow.appendChild(getCompRow());
    resultsRow.appendChild(getCompRow());
    //const inputText = app.form.convertToData("#searchbar-autocomplete").searchQuery.toLowerCase();
    const concatString = selectedCats.reduce((a, b) => a + ";" + b);
    app.request.json("http://localhost:5000/api/SupplierSearch/byKeyWords", "keyWords=" + concatString, (data) => console.log(data));
  });
  $(".searchQuery").keyup((e) => {
    app.request.json("http://localhost:5000/api/SupplierSearch/keyWordsFromFreeText", "freeText=" + e.target.value.toLowerCase(), (data) => console.log(data));
  });
}

function getCatRow(arr, toInsertIn) {
  const newP = cE("p");
  newP.setAttribute("class", "row");
  arr.forEach((catName) => {
    const newDiv = cE("div");
    newDiv.setAttribute("class", "col category button button-outline");
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
  const cardClose = cE("a");
  const cardCloseI = cE("i");
  const cardContentPadding = cE("div");
  const address = cE("p");
  const starIcon = cE("i");
  const imgLogo = cE("img");

  cardDiv.setAttribute("class", "col-30 card card-expandable");
  cardContent.setAttribute("class", "card-content");
  bgColor.setAttribute("class", "bg-color-red");
  bgColor.style = "height: 300px";
  imgLogo.setAttribute("src", "https://www.websamurai.ch/wp-content/uploads/2018/10/WEBSAMURAI-mit-Claim-neg-500x134.png");
  imgLogo.setAttribute("height", "50px");
  imgLogo.setAttribute("style", "padding: 10px 0 5px 10px");
  cardHeader.setAttribute("class", "card-header text-color-white display-block");
  starIcon.setAttribute("class", "icon f7-icons");
  cardClose.setAttribute("href", "#");
  cardClose.setAttribute("class", "link card-close card-opened-fade-in color-white");
  cardClose.setAttribute("style", "position: absolute; right: 15px; top: 15px");
  cardCloseI.setAttribute("class", "icon f7-icons");
  cardContentPadding.setAttribute("class", "card-content-padding");
  address.innerHTML = "Technoparkstrasse 2, 8406 Winterthur";
  cardCloseI.innerHTML = "xmark_circle_fill";
  starIcon.innerHTML = "star_fill";
  cardContentPadding.appendChild(address);
  cardClose.appendChild(cardCloseI);

  cardHeader.innerHTML = "Framework7 ";
  const rating = 6;
  for (let i = 0; i < rating; i++) {
    cardHeader.appendChild(starIcon.cloneNode(true));
  }
  const expertiseTuple = [
    ["technik", "6"],
    ["Acc", "4"],
  ];
  const expertises = getExpertisesElements(expertiseTuple, starIcon);
  expertises.forEach((expertise) => {
    cardHeader.innerHTML += "<br />";
    cardHeader.appendChild(expertise);
  });
  cardHeader.innerHTML += "<br />";
  bgColor.appendChild(imgLogo);
  bgColor.appendChild(cardHeader);
  bgColor.appendChild(cardClose);
  cardContent.appendChild(bgColor);
  cardContent.appendChild(cardContentPadding);
  cardDiv.appendChild(cardContent);
  return cardDiv;
}

function getExpertisesElements(exp, star) {
  const arrayOfRatedExp = [];
  exp.forEach((ex) => {
    const small1 = cE("small");
    small1.setAttribute("style", "opacity: 0.7");
    small1.innerHTML = ex[0] + " ";
    for (let i = 0; i < ex[1] - 0; i++) {
      small1.appendChild(star.cloneNode(true));
    }
    arrayOfRatedExp.push(small1);
  });
  return arrayOfRatedExp;
}
