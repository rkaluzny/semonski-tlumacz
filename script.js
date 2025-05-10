let dictionary = {};

fetch("dictionary.json")
  .then((res) => res.json())
  .then((data) => {
    dictionary = data;

    const input = document.getElementById("inputWord");
    input.addEventListener("keyup", (e) => {
      renderSuggestions(e.target.value, dictionary);
    });

    updateSuggestions(dictionary);
    updateStats(dictionary);
  });

function renderChips(container, words) {
  container.innerHTML = "";
  words.forEach((word) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = word;
    container.appendChild(chip);
  });
}

document.getElementById("translateBtn").addEventListener("click", () => {
  const input = document.getElementById("inputWord").value.trim().toLowerCase();
  const outputBox = document.getElementById("output");
  const translationElem = document.getElementById("translation");
  const mineSynonymsElem = document.getElementById("mineSynonyms");

  let found = false;

  for (const [myWord, data] of Object.entries(dictionary)) {
    if (
      data.pl.toLowerCase() === input ||
      (data.synonyms?.pl &&
        data.synonyms.pl.some((s) => s.toLowerCase() === input))
    ) {
      translationElem.textContent = myWord;
      renderChips(mineSynonymsElem, data.synonyms?.mine || []);
      found = true;
      break;
    }
  }

  if (!found) {
    translationElem.textContent = "Nie znaleziono słowa. Spróbuj inaczej.";
    renderChips(mineSynonymsElem, []);
  }

  outputBox.classList.remove("hidden");
});

function updateStats(dict) {
  let totalCount = 0;

  for (const [semoWord, entry] of Object.entries(dict)) {
    totalCount += 1;
    if (entry.synonyms && Array.isArray(entry.synonyms.mine)) {
      totalCount += entry.synonyms.mine.length;
    }
  }

  document.getElementById("wordCount").textContent = totalCount;
}

function updateSuggestions(dict) {
  const suggestionBox = document.getElementById("suggestions");
  const entries = Object.values(dict);
  const randomWords = [];

  while (randomWords.length < 15 && entries.length > 0) {
    const index = Math.floor(Math.random() * entries.length);
    const word = entries.splice(index, 1)[0].pl;
    if (!randomWords.includes(word)) {
      randomWords.push(word);
    }
  }

  suggestionBox.innerHTML = "";
  randomWords.forEach((word) => {
    const chip = document.createElement("span");
    chip.className = "chip-suggestions";
    chip.textContent = word;

    chip.addEventListener("click", () => {
      const input = document.getElementById("inputWord");
      const button = document.getElementById("translateBtn");
      if (input && button) {
        input.value = word;
        button.click();
        input.value = "";
      }
    });

    suggestionBox.appendChild(chip);
  });
}

const input = document.getElementById("inputWord");
const suggestionsList = document.getElementById("suggestionsList");

input.addEventListener("input", () => {
  const query = input.value.trim().toLowerCase();
  if (!query) {
    suggestionsList.classList.add("hidden");
    return;
  }

  renderSuggestions(query, dictionary);
});

function renderSuggestions(inputValue, dictionary) {
  if (!dictionary || typeof dictionary !== "object") return;

  const suggestionsList = document.getElementById("suggestionsList");
  suggestionsList.innerHTML = "";

  if (!inputValue || inputValue.length < 2) {
    suggestionsList.classList.add("hidden");
    return;
  }

  const words = Object.entries(dictionary).map(([myWord, data]) => ({
    pl: data.pl,
    mine: myWord,
  }));

  const normalizedInput = inputValue.toLowerCase();

  const matches = words
    .filter(
      ({ pl, mine }) =>
        pl.toLowerCase().includes(normalizedInput) ||
        mine.toLowerCase().includes(normalizedInput)
    )
    .sort((a, b) => {
      const aScore = getMatchScore(a, normalizedInput);
      const bScore = getMatchScore(b, normalizedInput);
      return bScore - aScore;
    })
    .slice(0, 10);

  if (matches.length === 0) {
    suggestionsList.classList.add("hidden");
    return;
  }

  matches.forEach(({ pl, mine }) => {
    const li = document.createElement("li");
    li.textContent = `${pl} → ${mine}`;
    li.addEventListener("click", () => {
      document.getElementById("inputWord").value = pl;
      suggestionsList.classList.add("hidden");
      document.getElementById("translateBtn").click();
    });
    suggestionsList.appendChild(li);
  });

  suggestionsList.classList.remove("hidden");
}

function getMatchScore(entry, query) {
  let score = 0;
  const pl = entry.pl.toLowerCase();
  const mine = entry.mine.toLowerCase();

  if (pl === query) score += 100;
  else if (pl.startsWith(query)) score += 50;
  else if (pl.includes(query)) score += 10;

  if (mine === query) score += 80;
  else if (mine.startsWith(query)) score += 40;
  else if (mine.includes(query)) score += 5;

  return score;
}
