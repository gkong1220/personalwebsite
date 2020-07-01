$(".process-button").click(function() {
  console.log("clicked");
  console.log(document.getElementById("Text1").value);
  document.getElementById("results-body").style.visibility = "visible";
  document.getElementById("txt").textContent = document.getElementById("Text1").value;
})

$(".back").click(function() {
  document.getElementById("results-body").style.visibility = "hidden";
})
