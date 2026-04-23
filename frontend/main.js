const demoBtn = document.getElementById("demoBtn");
const demoText = document.getElementById("demoText");

if (demoBtn && demoText) {
  demoBtn.addEventListener("click", () => {
    demoText.textContent = "JavaScript is working.";
  });
}
