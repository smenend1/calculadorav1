"use strict";

/*
  Calculadora Científica Educativa
  --------------------------------
  Objectiu:
  - Resoldre càlculs habituals de l'ESO.
  - Mostrar el procediment lògic, no només el resultat.
  - Evitar llibreries externes per millorar rendiment i compatibilitat.
*/

const tabs = document.querySelectorAll(".tab");
const forms = document.querySelectorAll(".calculator-form");
const resultBox = document.getElementById("result-box");
const statusPill = document.getElementById("status-pill");
const geometryType = document.getElementById("geometry-type");
const geometryInputs = document.getElementById("geometry-inputs");

const formatter = new Intl.NumberFormat("ca-ES", { maximumFractionDigits: 4 });

function formatNumber(value) {
  if (!Number.isFinite(value)) return "No definit";
  return formatter.format(value);
}

function getNumber(id) {
  const value = Number(document.getElementById(id).value);
  if (!Number.isFinite(value)) throw new Error("Introdueix valors numèrics vàlids.");
  return value;
}

function setStatus(text, type = "") {
  statusPill.textContent = text;
  statusPill.className = `status-pill ${type}`;
}

function renderResult({ title, summary, steps, type = "ok" }) {
  const stepItems = steps.map(step => `<li>${step}</li>`).join("");
  resultBox.innerHTML = `
    <article class="result-card ${type === "error" ? "error-message" : ""} ${type === "warning" ? "warning-message" : ""} ${type === "ok" ? "success-message" : ""}">
      <h3>${title}</h3>
      <p>${summary}</p>
      <h4>Procediment</h4>
      <ol class="steps">${stepItems}</ol>
    </article>
  `;

  if (type === "error") setStatus("Cal revisar dades", "error");
  else if (type === "warning") setStatus("Atenció", "warning");
  else setStatus("Resultat obtingut", "ok");
}

function renderError(message, explanation) {
  renderResult({
    title: "No es pot completar el càlcul",
    summary: message,
    type: "error",
    steps: [
      explanation,
      "Corregeix les dades d'entrada i torna-ho a intentar.",
      "Recorda: en matemàtiques, comprovar les condicions inicials forma part del procediment."
    ]
  });
}

tabs.forEach(tab => {
  tab.addEventListener("click", () => {
    const selectedModule = tab.dataset.module;
    tabs.forEach(item => {
      item.classList.remove("active");
      item.setAttribute("aria-selected", "false");
    });
    tab.classList.add("active");
    tab.setAttribute("aria-selected", "true");
    forms.forEach(form => form.classList.toggle("active", form.dataset.form === selectedModule));
    setStatus("Esperant dades");
    resultBox.innerHTML = `<p>Introdueix les dades d'un mòdul i prem el botó de càlcul. Aquí apareixeran el resultat i l'explicació raonada.</p>`;
  });
});

/*
  Equació lineal: ax + b = 0
  ax + b = 0 -> ax = -b -> x = -b / a
  Condició: a no pot ser 0 si volem una solució única.
*/
document.getElementById("linear-form").addEventListener("submit", event => {
  event.preventDefault();
  try {
    const a = getNumber("linear-a");
    const b = getNumber("linear-b");

    if (a === 0 && b === 0) {
      renderResult({
        title: "Identitat: infinites solucions",
        type: "warning",
        summary: "L'expressió queda 0x + 0 = 0, que és certa per a qualsevol valor de x.",
        steps: [
          `Substituïm els valors: <span class="math">0x + 0 = 0</span>.`,
          "Com que els dos costats són iguals sempre, qualsevol nombre real compleix la igualtat.",
          "Per això no hi ha una única solució, sinó infinites solucions."
        ]
      });
      return;
    }

    if (a === 0 && b !== 0) {
      renderResult({
        title: "Equació incompatible",
        type: "error",
        summary: "No existeix cap valor de x que faci certa la igualtat.",
        steps: [
          `Substituïm els valors: <span class="math">0x + ${formatNumber(b)} = 0</span>.`,
          `Com que <span class="math">0x</span> sempre val 0, l'equació queda <span class="math">${formatNumber(b)} = 0</span>.`,
          "Aquesta igualtat és falsa; per tant, l'equació no té solució."
        ]
      });
      return;
    }

    const x = -b / a;
    renderResult({
      title: "Solució de l'equació lineal",
      summary: `La solució és <strong>x = ${formatNumber(x)}</strong>.`,
      steps: [
        `Partim de l'equació <span class="math">${formatNumber(a)}x + ${formatNumber(b)} = 0</span>.`,
        `Restem <span class="math">${formatNumber(b)}</span> als dos costats: <span class="math">${formatNumber(a)}x = ${formatNumber(-b)}</span>.`,
        `Dividim entre <span class="math">${formatNumber(a)}</span>: <span class="math">x = ${formatNumber(-b)} / ${formatNumber(a)}</span>.`,
        `Calculem: <span class="math">x = ${formatNumber(x)}</span>.`,
        "Comprovació recomanada: substitueix x a l'equació inicial i verifica que el resultat sigui 0."
      ]
    });
  } catch (error) {
    renderError("Hi ha alguna dada que no és vàlida.", error.message);
  }
});

/*
  Equació quadràtica: ax² + bx + c = 0
  Fórmula general: x = (-b ± √Δ) / 2a
  Discriminant: Δ = b² - 4ac
*/
document.getElementById("quadratic-form").addEventListener("submit", event => {
  event.preventDefault();
  try {
    const a = getNumber("quad-a");
    const b = getNumber("quad-b");
    const c = getNumber("quad-c");

    if (a === 0) {
      renderResult({
        title: "No és una equació quadràtica",
        type: "warning",
        summary: "Si a = 0, el terme ax² desapareix i l'equació passa a ser lineal.",
        steps: [
          `Amb <span class="math">a = 0</span>, l'expressió queda <span class="math">${formatNumber(b)}x + ${formatNumber(c)} = 0</span>.`,
          "Per resoldre-la correctament, fes servir el mòdul d'equacions lineals.",
          "Una equació quadràtica necessita que el coeficient de x² sigui diferent de 0."
        ]
      });
      return;
    }

    const discriminant = b ** 2 - 4 * a * c;

    if (discriminant < 0) {
      renderResult({
        title: "No hi ha solucions reals",
        type: "warning",
        summary: `El discriminant és negatiu: Δ = ${formatNumber(discriminant)}.`,
        steps: [
          `Calculem el discriminant: <span class="math">Δ = b² - 4ac</span>.`,
          `Substituïm: <span class="math">Δ = (${formatNumber(b)})² - 4 · ${formatNumber(a)} · ${formatNumber(c)}</span>.`,
          `Resultat: <span class="math">Δ = ${formatNumber(discriminant)}</span>.`,
          "Com que Δ és menor que 0, apareixeria l'arrel quadrada d'un nombre negatiu.",
          "Dins dels nombres reals no hi ha solució. En cursos posteriors es poden estudiar les solucions complexes."
        ]
      });
      return;
    }

    const sqrtDiscriminant = Math.sqrt(discriminant);
    const denominator = 2 * a;
    const x1 = (-b + sqrtDiscriminant) / denominator;
    const x2 = (-b - sqrtDiscriminant) / denominator;

    if (discriminant === 0) {
      renderResult({
        title: "Una solució real doble",
        summary: `La solució és <strong>x = ${formatNumber(x1)}</strong>.`,
        steps: [
          `Calculem el discriminant: <span class="math">Δ = (${formatNumber(b)})² - 4 · ${formatNumber(a)} · ${formatNumber(c)}</span>.`,
          `Resultat: <span class="math">Δ = 0</span>.`,
          "Quan el discriminant és 0, l'arrel quadrada també és 0.",
          `Apliquem la fórmula: <span class="math">x = (-b ± √Δ) / 2a</span>.`,
          `Substituïm: <span class="math">x = (${formatNumber(-b)} ± 0) / ${formatNumber(denominator)}</span>.`,
          `Resultat: <span class="math">x = ${formatNumber(x1)}</span>.`,
          "S'anomena solució doble perquè les dues branques de la fórmula donen el mateix valor."
        ]
      });
      return;
    }

    renderResult({
      title: "Dues solucions reals",
      summary: `Les solucions són <strong>x₁ = ${formatNumber(x1)}</strong> i <strong>x₂ = ${formatNumber(x2)}</strong>.`,
      steps: [
        `Calculem el discriminant: <span class="math">Δ = b² - 4ac</span>.`,
        `Substituïm: <span class="math">Δ = (${formatNumber(b)})² - 4 · ${formatNumber(a)} · ${formatNumber(c)}</span>.`,
        `Resultat: <span class="math">Δ = ${formatNumber(discriminant)}</span>.`,
        "Com que Δ és més gran que 0, existeixen dues solucions reals.",
        `Calculem l'arrel: <span class="math">√Δ = ${formatNumber(sqrtDiscriminant)}</span>.`,
        `Primera solució: <span class="math">x₁ = (${formatNumber(-b)} + ${formatNumber(sqrtDiscriminant)}) / ${formatNumber(denominator)} = ${formatNumber(x1)}</span>.`,
        `Segona solució: <span class="math">x₂ = (${formatNumber(-b)} - ${formatNumber(sqrtDiscriminant)}) / ${formatNumber(denominator)} = ${formatNumber(x2)}</span>.`,
        "Pots comprovar totes dues solucions substituint-les a l'equació original."
      ]
    });
  } catch (error) {
    renderError("Hi ha alguna dada que no és vàlida.", error.message);
  }
});

const geometryTemplates = {
  "regular-polygon-area": `
    <div class="formula-card"><strong>Fórmula:</strong> Àrea = (perímetre · apotema) / 2</div>
    <label>Nombre de costats<input type="number" id="polygon-sides" min="3" step="1" placeholder="Exemple: 6" required /></label>
    <label>Longitud de cada costat<input type="number" id="polygon-side-length" min="0" step="any" placeholder="Exemple: 4" required /></label>
    <label>Apotema<input type="number" id="polygon-apothem" min="0" step="any" placeholder="Exemple: 3.46" required /></label>
  `,
  "circle-area": `
    <div class="formula-card"><strong>Fórmula:</strong> Àrea = πr²</div>
    <label>Radi<input type="number" id="circle-radius" min="0" step="any" placeholder="Exemple: 5" required /></label>
  `,
  "prism-volume": `
    <div class="formula-card"><strong>Fórmula:</strong> Volum = àrea de la base · altura</div>
    <label>Àrea de la base<input type="number" id="prism-base-area" min="0" step="any" placeholder="Exemple: 20" required /></label>
    <label>Altura<input type="number" id="prism-height" min="0" step="any" placeholder="Exemple: 8" required /></label>
  `,
  "pyramid-volume": `
    <div class="formula-card"><strong>Fórmula:</strong> Volum = (àrea de la base · altura) / 3</div>
    <label>Àrea de la base<input type="number" id="pyramid-base-area" min="0" step="any" placeholder="Exemple: 36" required /></label>
    <label>Altura<input type="number" id="pyramid-height" min="0" step="any" placeholder="Exemple: 10" required /></label>
  `,
  "cylinder-volume": `
    <div class="formula-card"><strong>Fórmula:</strong> Volum = πr²h</div>
    <label>Radi<input type="number" id="cylinder-radius" min="0" step="any" placeholder="Exemple: 3" required /></label>
    <label>Altura<input type="number" id="cylinder-height" min="0" step="any" placeholder="Exemple: 7" required /></label>
  `
};

function updateGeometryInputs() {
  geometryInputs.innerHTML = geometryTemplates[geometryType.value];
}

function ensurePositive(value, name) {
  if (value <= 0) throw new Error(`${name} ha de ser més gran que 0 perquè la figura tingui una mesura real.`);
}

defaultGeometryMessage();
function defaultGeometryMessage() {}

geometryType.addEventListener("change", updateGeometryInputs);

document.getElementById("geometry-form").addEventListener("submit", event => {
  event.preventDefault();
  try {
    const type = geometryType.value;

    if (type === "regular-polygon-area") {
      const sides = getNumber("polygon-sides");
      const sideLength = getNumber("polygon-side-length");
      const apothem = getNumber("polygon-apothem");
      if (!Number.isInteger(sides)) throw new Error("El nombre de costats ha de ser un nombre enter.");
      if (sides < 3) throw new Error("Un polígon necessita com a mínim 3 costats.");
      ensurePositive(sideLength, "La longitud del costat");
      ensurePositive(apothem, "L'apotema");
      const perimeter = sides * sideLength;
      const area = (perimeter * apothem) / 2;
      renderResult({
        title: "Àrea d'un polígon regular",
        summary: `L'àrea és <strong>${formatNumber(area)} unitats quadrades</strong>.`,
        steps: [
          "Per a un polígon regular fem servir la fórmula: <span class='math'>A = (P · a) / 2</span>.",
          `Calculem el perímetre: <span class='math'>P = ${formatNumber(sides)} · ${formatNumber(sideLength)}</span>.`,
          `Resultat del perímetre: <span class='math'>P = ${formatNumber(perimeter)}</span>.`,
          `Substituïm a la fórmula: <span class='math'>A = (${formatNumber(perimeter)} · ${formatNumber(apothem)}) / 2</span>.`,
          `Resultat: <span class='math'>A = ${formatNumber(area)}</span>.`
        ]
      });
    }

    if (type === "circle-area") {
      const radius = getNumber("circle-radius");
      ensurePositive(radius, "El radi");
      const area = Math.PI * radius ** 2;
      renderResult({
        title: "Àrea d'un cercle",
        summary: `L'àrea és <strong>${formatNumber(area)} unitats quadrades</strong>.`,
        steps: [
          "Per calcular l'àrea d'un cercle fem servir: <span class='math'>A = πr²</span>.",
          `Elevem el radi al quadrat: <span class='math'>r² = ${formatNumber(radius)}² = ${formatNumber(radius ** 2)}</span>.`,
          `Multipliquem per π: <span class='math'>A = π · ${formatNumber(radius ** 2)}</span>.`,
          `Resultat aproximat: <span class='math'>A = ${formatNumber(area)}</span>.`
        ]
      });
    }

    if (type === "prism-volume") {
      const baseArea = getNumber("prism-base-area");
      const height = getNumber("prism-height");
      ensurePositive(baseArea, "L'àrea de la base");
      ensurePositive(height, "L'altura");
      const volume = baseArea * height;
      renderResult({
        title: "Volum d'un prisma",
        summary: `El volum és <strong>${formatNumber(volume)} unitats cúbiques</strong>.`,
        steps: [
          "En un prisma, totes les seccions paral·leles a la base tenen la mateixa àrea.",
          "Per això fem servir: <span class='math'>V = àrea de la base · altura</span>.",
          `Substituïm: <span class='math'>V = ${formatNumber(baseArea)} · ${formatNumber(height)}</span>.`,
          `Resultat: <span class='math'>V = ${formatNumber(volume)}</span>.`
        ]
      });
    }

    if (type === "pyramid-volume") {
      const baseArea = getNumber("pyramid-base-area");
      const height = getNumber("pyramid-height");
      ensurePositive(baseArea, "L'àrea de la base");
      ensurePositive(height, "L'altura");
      const volume = (baseArea * height) / 3;
      renderResult({
        title: "Volum d'una piràmide",
        summary: `El volum és <strong>${formatNumber(volume)} unitats cúbiques</strong>.`,
        steps: [
          "Una piràmide amb la mateixa base i altura que un prisma ocupa la tercera part del seu volum.",
          "Per això fem servir: <span class='math'>V = (àrea de la base · altura) / 3</span>.",
          `Substituïm: <span class='math'>V = (${formatNumber(baseArea)} · ${formatNumber(height)}) / 3</span>.`,
          `Resultat: <span class='math'>V = ${formatNumber(volume)}</span>.`
        ]
      });
    }

    if (type === "cylinder-volume") {
      const radius = getNumber("cylinder-radius");
      const height = getNumber("cylinder-height");
      ensurePositive(radius, "El radi");
      ensurePositive(height, "L'altura");
      const baseArea = Math.PI * radius ** 2;
      const volume = baseArea * height;
      renderResult({
        title: "Volum d'un cilindre",
        summary: `El volum és <strong>${formatNumber(volume)} unitats cúbiques</strong>.`,
        steps: [
          "Un cilindre es pot entendre com una base circular que es desplaça al llarg d'una altura.",
          "Primer calculem l'àrea de la base circular: <span class='math'>A = πr²</span>.",
          `Substituïm el radi: <span class='math'>A = π · ${formatNumber(radius)}²</span>.`,
          `Àrea de la base: <span class='math'>A = ${formatNumber(baseArea)}</span>.`,
          "Després multipliquem per l'altura: <span class='math'>V = A · h</span>.",
          `Resultat: <span class='math'>V = ${formatNumber(baseArea)} · ${formatNumber(height)} = ${formatNumber(volume)}</span>.`
        ]
      });
    }
  } catch (error) {
    renderError("Hi ha alguna dada geomètrica que no és vàlida.", error.message);
  }
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./sw.js");
      console.info("Service Worker registrat correctament.");
    } catch (error) {
      console.warn("No s'ha pogut registrar el Service Worker:", error);
    }
  });
}

updateGeometryInputs();
