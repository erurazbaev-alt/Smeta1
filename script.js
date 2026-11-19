"use strict";

const positionsBody = document.querySelector("#positions-body");
const positionTemplate = document.querySelector("#position-template");
const addRowButton = document.querySelector("#add-row");
const discountRateInput = document.querySelector("#discount-rate");
const vatRateInput = document.querySelector("#vat-rate");
const currencySelect = document.querySelector("#currency");
const subtotalOutput = document.querySelector("#subtotal");
const discountRow = document.querySelector("#discount-row");
const discountAmountOutput = document.querySelector("#discount-amount");
const discountedRow = document.querySelector("#discounted-row");
const discountedSubtotalOutput = document.querySelector("#discounted-subtotal");
const vatRow = document.querySelector("#vat-row");
const vatAmountOutput = document.querySelector("#vat-amount");
const grandTotalOutput = document.querySelector("#grand-total");
const dateInput = document.querySelector("#estimate-date");
const estimateNumberInput = document.querySelector("#estimate-number");
const printTitle = document.querySelector("#print-title");
const printButton = document.querySelector("#print-estimate");

function getTodayForInput() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function formatDateForPrint(value) {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}.${month}.${year}` : value;
}

function updatePrintTitle() {
  const estimateNumber = estimateNumberInput.value.trim() || "—";
  const estimateDate = formatDateForPrint(dateInput.value);
  printTitle.textContent = `Смета № ${estimateNumber} от ${estimateDate}`;
}

function parseNumber(value) {
  const normalized = String(value ?? "")
    .replace(/\s+/g, "")
    .replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function formatMoney(value, { negative = false } = {}) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const roundedValue = Math.round(safeValue);
  const sign = negative && roundedValue !== 0 ? "−" : "";
  return `${sign}${new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(Math.abs(roundedValue))} ${currencySelect.value}`;
}

function calculateTotals() {
  let subtotal = 0;

  positionsBody.querySelectorAll(".position-row").forEach((row) => {
    const quantity = parseNumber(row.querySelector(".item-quantity").value);
    const price = parseNumber(row.querySelector(".item-price").value);
    const rowTotal = quantity * price;
    const safeRowTotal = Number.isFinite(rowTotal) ? rowTotal : 0;

    row.querySelector(".row-total").textContent = formatMoney(safeRowTotal);
    subtotal += safeRowTotal;
  });

  subtotal = Math.round(subtotal);

  const discountRate = Math.max(0, parseNumber(discountRateInput.value));
  const vatRate = Math.max(0, parseNumber(vatRateInput.value));
  const discountAmount = Math.round(subtotal * discountRate / 100);
  const discountedSubtotal = subtotal - discountAmount;
  const vatAmount = Math.round(discountedSubtotal * vatRate / 100);
  const grandTotal = discountedSubtotal + vatAmount;

  subtotalOutput.textContent = formatMoney(subtotal);
  discountAmountOutput.textContent = formatMoney(discountAmount, { negative: true });
  discountedSubtotalOutput.textContent = formatMoney(discountedSubtotal);
  vatAmountOutput.textContent = formatMoney(vatAmount);
  grandTotalOutput.textContent = formatMoney(grandTotal);

  const hasDiscount = discountAmount !== 0;
  const hasVat = vatAmount !== 0;
  discountRow.hidden = !hasDiscount;
  discountedRow.hidden = !hasDiscount;
  vatRow.hidden = !hasVat;
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

discountRateInput.addEventListener("input", calculateTotals);
vatRateInput.addEventListener("input", calculateTotals);
currencySelect.addEventListener("change", calculateTotals);
estimateNumberInput.addEventListener("input", updatePrintTitle);
dateInput.addEventListener("input", updatePrintTitle);
printButton.addEventListener("click", () => {
  updatePrintTitle();
  window.print();
});
window.addEventListener("beforeprint", updatePrintTitle);

dateInput.value = getTodayForInput();
updatePrintTitle();
addPosition();
