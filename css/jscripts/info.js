var showInfo = false;

window.addEventListener("click", function(event) {
   console.log(showInfo);
   if (!(document.getElementById("info-box").contains(event.target)) && !document.getElementById("quest-icon").contains(event.target)) {
      document.getElementById("info-box").classList.remove("info-visible");
   }
})


$(function () {
   $(".info-button").click(function() {
      $(".info-body").toggleClass("info-visible");
      showInfo = $(".info-body").hasClass("info-visible");
   }); 
});