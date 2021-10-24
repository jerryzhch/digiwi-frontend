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

let pollId = 0;
const baseUrl = "http://localhost:5000";
//const baseUrl = "https://localhost:5001";

var app = new Framework7({
  name: "WiDigi", // App name
  theme: "auto", // Automatic theme detection
  el: "#app", // App root element
  component: App, // App main component

  on: {
    init: function () {
      console.log("App initialized");
      setTimeout(() => {
        start();
      }, 500);
    },
    pageInit: function (e) {
      console.log("Page initialized");
      console.log(e.route.query.pollId);
      pollId = e.route.query.pollId;
    },
  },
  card: {
    hideNavbarOnOpen: true,
    backdrop: false,
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
  $(".tab-link").on("click", (e) => {
    console.log(e.target);
    localStorage.setItem("currentPath", e.target.value);
  });
  const categoryForm = document.getElementById("category-form");
  const resultCompanies = $(".result-companies");
  //const colorPalette = ["#ff0000", "#ff8700", "#ffd300", "#deff0a", "#a1ff0a", "#0aff99", "#0aefff", "#147df5", "#580aff", "#be0aff"];
  //const colorPalette = ["#4A235A", "#A569BD", "#1A5276", "#5499C7", "#0E6251", "#48C9B0", "#145A32", "#58D68D", "#283747", "#808B96"];
  //const colorPalette = ["#154360", "#1F618D", "#2980B9", "#5499C7", "#7FB3D5", "#85929E", "#34495E", "#283747", "#1B2631", "#512E5F"];
  const colorPalette = ["#0E6251", "#148F77", "#1ABC9C", "#76D7C4", "#D1F2EB", "#73C6B6", "#16A085", "#117A65", "#0B5345"];
  let selectedCounter = 0;
  let selectedCats = [];
  app.request
    .json(baseUrl + "/api/SupplierSearch/keyWords", null, (data) => {
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
        } else {
          $("#searchbar-autocomplete").show();
        }
        if (selectedCats.length > 0) {
          const concatString = selectedCats.reduce((a, b) => a + ";" + b);
          app.request.json(baseUrl + "/api/SupplierSearch/byKeyWords", "keyWords=" + concatString, (data) => {
            resultCompanies.empty();
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
      app.request.json(baseUrl + "/api/SupplierSearch/byKeyWords", "keyWords=" + e.target.value.toLowerCase().replaceAll(" ", ";").replaceAll(".", ";").replaceAll(",", ";"), (data) => {
        resultCompanies.empty();
        data.forEach((d) => resultCompanies.append(getCompRow(d)));
      });
    }
  });
  const pieTooltip = app.pieChart.create({
    el: ".pie-chart-2",
    tooltip: true,
    size: 100,
    formatTooltip(data) {
      const { value, label, color } = data;
      return `You have <span style="color: ${color}">${value}</span> people voted on for ${label}`;
    },
  });

  let pollStatsData = [];
  app.request.json(baseUrl + "/api/SupplierSearch/pollResult", "pollId=" + pollId, (data) => {
    let c = 0;
    data.forEach(({ count, description, keyword }) => {
      pollStatsData.push({ label: keyword, value: count, color: colorPalette[c % colorPalette.length], description });
      c++;
    });
    updateStatsView(pieTooltip, pollStatsData);
  });
  $(".submit-button").on("click", (e) => {
    const inputText = $(".inputText").val();
    document.querySelector(".inputText").value = "";
    if (inputText === "") {
    } else {
      pollStatsData = [];
      app.request.json(baseUrl + "/api/SupplierSearch/updatePoll", "pollId=" + pollId + "&update=" + inputText.replaceAll(/(\r\n|\n|\r)/gm, " "), (data) => {
        let c = 0;
        console.log(data);
        data.forEach(({ count, description, keyword }) => {
          pollStatsData.push({ label: keyword, value: count, color: colorPalette[c % colorPalette.length], description });
          console.log(pollStatsData);
          c++;
        });
        updateStatsView(pieTooltip, pollStatsData);
      });
    }
  });
  $(".loadCatToMain").on("click", (e) => {
    let arr = [];
    $(".data-table-row-selected").forEach((sel) => {
      arr.push(sel.getAttribute("value"));
    });
    const queryString = arr.reduce((a, b) => a.capitalize() + " " + b.capitalize());
    $(".view-home").click();
    arr.map((el) => {
      $(`.category[name=${el}]`).click();
    });
  });
}

function getCatRow(arr, toInsertIn) {
  const newP = cE("p");
  newP.setAttribute("class", "row");
  arr.forEach((catName) => {
    const newDiv = cE("div");
    newDiv.setAttribute("class", "col category button button-large button-outline");
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
  const matchButton = cE("div");

  cardDiv.setAttribute("class", "col-30 card card-expandable");
  cardContent.setAttribute("class", "card-content");
  if (isTool) {
    bgColor.setAttribute("class", "bg-color-cadetblue-dark");
  } else {
    bgColor.setAttribute("class", "bg-color-cadetblue");
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
  matchButton.setAttribute("class", "card-close link button button-fill");
  matchButton.setAttribute("value", name);
  cardContentPadding.setAttribute("class", "card-content-padding");
  cardCloseI.innerHTML = "xmark_circle_fill";
  starIcon.innerHTML = "star_fill";
  houseIcon.innerHTML = "house";
  linkIcon.innerText = "link_circle";
  matchButton.innerHTML = "Match with " + name + "?";
  if (!isTool) {
    addressP.appendChild(houseIcon);
    const newTextNode = document.createTextNode("  " + address);
    addressP.appendChild(newTextNode);
  }
  matchButton.addEventListener("click", (e) => {
    app.dialog.confirm("Confirm Match with " + e.target.getAttribute("value"), function () {
      app.dialog.alert("Great! Somebody at " + e.target.getAttribute("value") + " will contact you. Thank You for using WiDigi");
    });
  });
  const newA = cE("a");
  newA.setAttribute("href", url);
  newA.setAttribute("class", "link external");
  newA.innerHTML = url;
  websiteP.appendChild(linkIcon);
  websiteP.appendChild(newA);
  cardContentPadding.appendChild(addressP);
  cardContentPadding.appendChild(websiteP);
  if (!isTool) cardContentPadding.appendChild(matchButton);
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

function getTableLine(key, val) {
  const newTr = cE("tr");
  const newTh1 = cE("td");
  const newLabel = cE("label");
  const newInput = cE("input");
  const newi = cE("i");
  const newTh2 = cE("td");
  const newTh3 = cE("td");

  newTh1.setAttribute("class", "checkbox-cell");
  newLabel.setAttribute("class", "checkbox");
  newInput.setAttribute("type", "checkbox");
  newi.setAttribute("class", "icon-checkbox");
  newTh2.setAttribute("class", "label-cell");
  newTh3.setAttribute("class", "numeric-cell");
  newTr.setAttribute("value", key);

  newTh2.innerHTML = key;
  newTh3.innerHTML = val;

  newLabel.appendChild(newInput);
  newLabel.appendChild(newi);
  newTh1.appendChild(newLabel);
  newTr.appendChild(newTh1);
  newTr.appendChild(newTh2);
  newTr.appendChild(newTh3);
  return newTr;
}

function updateStatsView(pieTooltip, dataSet) {
  pieTooltip.update({
    el: ".pie-chart-2",
    tooltip: true,
    datasets: dataSet,
    size: 100,
    formatTooltip(data) {
      const { value, label, color } = data;
      return `You have <span style="color: ${color}">${value}</span> people voted on for ${label}`;
    },
  });
  $(".pie-chart-table").empty();
  dataSet.forEach(({ label, value, description }) => {
    $(".pie-chart-table").append(getTableLine(label, value));
  });
}

Object.defineProperty(String.prototype, "capitalize", {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});
