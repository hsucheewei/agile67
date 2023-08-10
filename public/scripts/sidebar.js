var menuIcon = document.querySelector(".burger-menu");
var sidebar = document.querySelector(".sidebar");
var pageContent = document.querySelector(".page-content")
var pageContent = document.querySelector(".page-content");
var sideMenuIcon = document.querySelector(".sidebar-burger-menu");
var blackOverlay = document.querySelector(".black-overlay");

menuIcon.onclick = function(){
    sidebar.classList.toggle("minimised-sidebar");
    pageContent.classList.toggle("page-no-sidebar");
}

menuIcon.onclick = function () {
  sidebar.classList.toggle("minimised-sidebar");
  pageContent.classList.toggle("page-no-sidebar");
};

sideMenuIcon.onclick = function () {
  sidebar.classList.toggle("minimised-sidebar");
  pageContent.classList.toggle("page-no-sidebar");
  blackOverlay.style.display = "none";
};

menuIcon.addEventListener("click", function () {
  blackOverlay.style.display = "block";
});

blackOverlay.addEventListener("click", function () {
  blackOverlay.style.display = "none";
  sidebar.classList.toggle("minimised-sidebar");
});