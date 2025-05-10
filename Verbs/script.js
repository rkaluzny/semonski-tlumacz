let dictionary = {};

document.addEventListener("DOMContentLoaded", function () {
  const showBtn = document.getElementById("showBtn");

  if (showBtn) {
    showBtn.addEventListener("click", function () {
      const verbInput = document
        .getElementById("verbInput")
        .value.trim()
        .toLowerCase();
      const resultBox = document.getElementById("resultBox");
      const semoVerb = document.getElementById("semoVerb");
      const polVerb = document.getElementById("polVerb");
      const conjugationBox = document.getElementById("conjugationBox");
      const conjugations = document.getElementById("conjugations");

      const verbData = dictionary[verbInput];

      if (verbData && verbData.conjugations) {
        semoVerb.textContent = verbData.semo || "(Nie znaleziono)";
        polVerb.textContent = verbInput;

        let conjugationsHTML = "";

        const pronouns = {
          "(Ja)": "Basp",
          "(Ty)": "Rem",
          "(On)": "Tu",
          "(Ona)": "Tum",
          "(My)": "Wero",
          "(Wy)": "Tumos",
          "(Oni)": "Meso",
        };

        function buildSection(timeName, timeData) {
          let html = `<h3>${timeName}:</h3>`;

          for (const form in timeData) {
            html += `<h4>${form}:</h4><ul>`;

            for (const person in timeData[form]) {
              const showPronoun = !["chal-perven", "perven"].includes(form);
              const prefix = showPronoun ? `${pronouns[person]} ` : "";
              html += `<li>${person}: ${prefix}${timeData[form][person]}</li>`;
            }

            html += "</ul>";
          }

          return html;
        }

        conjugationsHTML += buildSection(
          "Teraźniejszość(tufisi)",
          verbData.conjugations.present,
          true
        );
        conjugationsHTML += buildSection(
          "Przeszłość(jutufisi)",
          verbData.conjugations.past,
          true
        );
        conjugationsHTML += buildSection(
          "Przyszłość(fatufisi)",
          verbData.conjugations.future,
          true
        );

        conjugationBox.innerHTML = conjugationsHTML;
        conjugations.classList.remove("hidden");
        resultBox.classList.remove("hidden");
      } else {
        semoVerb.textContent = "Nie znaleziono czasownika.";
        polVerb.textContent = "";
        conjugations.classList.add("hidden");
        resultBox.classList.remove("hidden");
      }
    });
  }

  // Daten laden
  fetch("dictionary.json")
    .then((res) => res.json())
    .then((data) => {
      dictionary = data;
      suggestVerbs(dictionary, 10);
    })
    .catch((error) => console.error("Fehler beim Laden der Daten:", error));
});

function suggestVerbs(dictionary, count = 3) {
  const verbChipsContainer = document.getElementById("verbChips");
  if (!verbChipsContainer) return;

  verbChipsContainer.innerHTML = "";

  const verbEntries = Object.entries(dictionary).filter(([key, value]) =>
    value.hasOwnProperty("conjugations")
  );

  const shuffled = verbEntries.sort(() => 0.5 - Math.random());
  const selected = shuffled.slice(0, count);

  selected.forEach(([plVerb, data]) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `<strong>${data.semo}</strong> <span class="pl-verb">(${plVerb})</span>`;

    chip.addEventListener("click", () => {
      const input = document.getElementById("verbInput");
      const button = document.getElementById("showBtn");
      if (input && button) {
        input.value = plVerb;
        button.click();
      }
    });

    verbChipsContainer.appendChild(chip);
  });
}
