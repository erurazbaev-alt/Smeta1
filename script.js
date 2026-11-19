"use strict";

const positionsBody = document.querySelector("#positions-body");
const positionTemplate = document.querySelector("#position-template");
const addRowButton = document.querySelector("#add-row");
const grandTotalOutput = document.querySelector("#grand-total");
const dateInput = document.querySelector("#estimate-date");

function getTodayForInput() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function parseNumber(value) {
  const normalized = String(value ?? "")
    .replace(/\s+/g, "")
    .replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value) {
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2
  }).format(safeValue)} ₸`;
}

function calculateTotals() {
  let grandTotal = 0;

  positionsBody.querySelectorAll(".position-row").forEach((row) => {
    const quantity = parseNumber(row.querySelector(".item-quantity").value);
    const price = parseNumber(row.querySelector(".item-price").value);
    const rowTotal = quantity * price;
    const safeRowTotal = Number.isFinite(rowTotal) ? rowTotal : 0;

    row.querySelector(".row-total").textContent = formatMoney(safeRowTotal);
    grandTotal += safeRowTotal;
  });

  grandTotalOutput.textContent = formatMoney(grandTotal);
}

function addPosition({ focus = false } = {}) {
  const row = positionTemplate.content.firstElementChild.cloneNode(true);
  positionsBody.append(row);
  calculateTotals();

  if (focus) {
    row.querySelector(".item-name").focus();
  }
}

function removePosition(row) {
  row.remove();

  if (!positionsBody.querySelector(".position-row")) {
    addPosition();
  } else {
    calculateTotals();
  }
}

positionsBody.addEventListener("input", (event) => {
  if (event.target.matches(".item-quantity, .item-price")) {
    calculateTotals();
  }
});

positionsBody.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-button");
  if (deleteButton) {
    removePosition(deleteButton.closest(".position-row"));
  }
});

positionsBody.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" || event.target.matches("button")) {
    return;
  }

  const currentRow = event.target.closest(".position-row");
  const lastRow = positionsBody.lastElementChild;

  if (currentRow === lastRow) {
    event.preventDefault();
    addPosition({ focus: true });
  }
});

addRowButton.addEventListener("click", () => addPosition({ focus: true }));

dateInput.value = getTodayForInput();
addPosition();
