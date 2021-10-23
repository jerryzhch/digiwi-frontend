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
  const resultCompanies = $(".result-companies");
  const colorPalette = ["#ff0000", "#ff8700", "#ffd300", "#deff0a", "#a1ff0a", "#0aff99", "#0aefff", "#147df5", "#580aff", "#be0aff"];
  let selectedCounter = 0;
  let selectedCats = [];
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
          selectedCats.splice(selectedCats.indexOf(e.target.getAttribute("name")), 1);
          selectedCounter--;
        } else {
          e.target.classList.add("button-fill");
          e.target.classList.add("selectedCat");
          selectedCats.push(e.target.getAttribute("name"));
          selectedCounter++;
        }
        if (selectedCounter !== 0) {
          $("#searchbar-autocomplete").hide();
          //$(".page-background").css("overflow", "auto");
        } else {
          $("#searchbar-autocomplete").show();
          //$(".page-background").css("overflow", "hidden");
        }
        if (selectedCats.length > 0) {
          const concatString = selectedCats.reduce((a, b) => a + ";" + b);
          app.request.json("http://localhost:5000/api/SupplierSearch/byKeyWords", "keyWords=" + concatString, (data) => {
            data.forEach((d) => resultCompanies.append(getCompRow(d)));
          });
        }
        resultCompanies.empty();
      });
    });
  $(".searchQuery").keyup((e) => {
    if (e.target.value === "") {
      resultCompanies.empty();
      $(".catContainer").show();
    } else {
      $(".catContainer").hide();
      app.request.json("http://localhost:5000/api/SupplierSearch/byKeyWords", "keyWords=" + e.target.value.toLowerCase().replaceAll(" ", ";").replaceAll(".", ";").replaceAll(",", ";"), (data) => {
        resultCompanies.empty();
        data.forEach((d) => resultCompanies.append(getCompRow(d)));
      });
    }
  });
  $(".submit-button").on("click", (e) => {
    const inputText = $(".inputText").val();
    document.querySelector(".inputText").value = "";
    console.log(inputText);
    if (inputText === "") {
    } else {
      app.request.json("http://localhost:5000/api/SupplierSearch/updatePoll", "pollId=100&update=" + inputText, (data) => console.log(data));
    }
  });

  app.request.json("http://localhost:5000/api/SupplierSearch/pollResult", "pollId=100", (data) => {
    let c = 0;
    let datasets = [];
    data.forEach(({ count, description, keyword }) => {
      datasets.push({ label: keyword, value: count, color: colorPalette[c] });
      c++;
    });

    const pieTooltip = app.pieChart.create({
      el: ".pie-chart-2",
      tooltip: true,
      datasets: datasets,
      size: 10,
    });
  });
}

function getCatRow(arr, toInsertIn) {
  const newP = cE("p");
  newP.setAttribute("class", "row");
  arr.forEach((catName) => {
    const newDiv = cE("div");
    newDiv.setAttribute("class", "col category button button-outline");
    newDiv.setAttribute("name", catName.keyword);
    newDiv.innerHTML = catName.keyword;
    newP.appendChild(newDiv);
    app.tooltip.create({ targetEl: newDiv, text: catName.description, offset: 2 });
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

function getCompRow({ name, address, imageUrl, isTool, rating, keywords, url }) {
  const cardDiv = cE("div");
  const cardContent = cE("div");
  const bgColor = cE("div");
  const cardHeader = cE("div");
  const cardClose = cE("a");
  const cardCloseI = cE("i");
  const cardContentPadding = cE("div");
  const addressP = cE("p");
  const websiteP = cE("p");
  const starIcon = cE("i");
  const houseIcon = cE("i");
  const imgLogo = cE("img");
  const linkIcon = cE("i");

  cardDiv.setAttribute("class", "col-30 card card-expandable");
  cardContent.setAttribute("class", "card-content");
  if (isTool) {
    bgColor.setAttribute("class", "bg-color-yellow");
  } else {
    bgColor.setAttribute("class", "bg-color-red");
  }
  bgColor.style = "height: 300px";
  imgLogo.setAttribute("src", imageUrl);
  imgLogo.setAttribute("height", "50px");
  imgLogo.setAttribute("style", "padding: 10px 0 5px 10px");
  cardHeader.setAttribute("class", "card-header text-color-white display-block");
  starIcon.setAttribute("class", "icon f7-icons");
  houseIcon.setAttribute("class", "icon f7-icons");
  linkIcon.setAttribute("class", "icon f7-icons");
  cardClose.setAttribute("href", "#");
  cardClose.setAttribute("class", "link card-close card-opened-fade-in color-white");
  cardClose.setAttribute("style", "position: absolute; right: 15px; top: 15px");
  cardCloseI.setAttribute("class", "icon f7-icons");
  cardContentPadding.setAttribute("class", "card-content-padding");
  cardCloseI.innerHTML = "xmark_circle_fill";
  starIcon.innerHTML = "star_fill";
  houseIcon.innerHTML = "house";
  linkIcon.innerText = "link_circle";
  if (!isTool) {
    addressP.appendChild(houseIcon);
    const newTextNode = document.createTextNode("  " + address);
    addressP.appendChild(newTextNode);
  }
  const newA = cE("a");
  newA.setAttribute("href", url);
  newA.setAttribute("class", "link external");
  newA.innerHTML = url;
  websiteP.appendChild(linkIcon);
  websiteP.appendChild(newA);
  cardContentPadding.appendChild(addressP);
  cardContentPadding.appendChild(websiteP);
  cardClose.appendChild(cardCloseI);

  cardHeader.innerHTML = name + " ";
  for (let i = 0; i < rating; i++) {
    cardHeader.appendChild(starIcon.cloneNode(true));
  }
  const expertises = getExpertisesElements(keywords, starIcon);
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

  cardDiv.addEventListener("click", (e) => {});
  return cardDiv;
}

function getExpertisesElements(exp, star) {
  const arrayOfRatedExp = [];
  exp.forEach((ex) => {
    const small1 = cE("small");
    small1.setAttribute("style", "opacity: 0.7");
    small1.innerHTML = ex[0].capitalize() + " ";
    for (let i = 0; i < ex[1] - 0; i++) {
      small1.appendChild(star.cloneNode(true));
    }
    arrayOfRatedExp.push(small1);
  });
  return arrayOfRatedExp;
}
Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});
