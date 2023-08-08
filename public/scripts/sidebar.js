var menuIcon = document.querySelector(".burger-menu");
var sidebar = document.querySelector(".sidebar");
var pageContent = document.querySelector(".page-content")

menuIcon.onclick = function(){
    sidebar.classList.toggle("minimised-sidebar");
    pageContent.classList.toggle("page-no-sidebar");
}