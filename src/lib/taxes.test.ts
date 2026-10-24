import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_TAXES, formatPercent, validateTaxes, parseStoredTaxes, describeTaxes } from "./taxes";

test("formatPercent", () => {
  assert.equal(formatPercent(8.875), "8.875%");
  assert.equal(formatPercent(12), "12%");
  assert.equal(formatPercent(5.9), "5.9%");
  assert.equal(formatPercent(0), "0%");
});

test("validateTaxes trims and rounds", () =>
  assert.deepEqual(validateTaxes([{ label: "  City tax ", rate: 4.12345 }]), { taxes: [{ label: "City tax", rate: 4.123 }] }));

test("validateTaxes allows no taxes", () => assert.deepEqual(validateTaxes([]), { taxes: [] }));

test("validateTaxes limits", () => {
  assert.deepEqual(validateTaxes(Array.from({ length: 11 }, () => ({ label: "x", rate: 1 }))), { error: "Up to 10 taxes." });
  assert.deepEqual(validateTaxes([{ label: " ", rate: 1 }]), { error: "Each tax needs a name (up to 40 characters)." });
  assert.deepEqual(validateTaxes([{ label: "x".repeat(41), rate: 1 }]), { error: "Each tax needs a name (up to 40 characters)." });
  for (const rate of [-1, 101, Number.NaN]) {
    assert.deepEqual(validateTaxes([{ label: "x", rate }]), { error: "Each rate must be between 0% and 100%." });
  }
});

test("parseStoredTaxes", () => {
  assert.deepEqual(parseStoredTaxes(undefined), DEFAULT_TAXES);
  assert.deepEqual(parseStoredTaxes("not json"), DEFAULT_TAXES);
  assert.deepEqual(parseStoredTaxes("[]"), []);
  assert.deepEqual(parseStoredTaxes('[{"label":"City tax","rate":10}]'), [{ label: "City tax", rate: 10 }]);
});

test("describeTaxes", () => {
  assert.equal(describeTaxes(DEFAULT_TAXES), "NYC sales tax (8.875%), NY rental tax (12%) and Service charge (5.9%)");
  assert.equal(describeTaxes([{ label: "City tax", rate: 10 }]), "City tax (10%)");
  assert.equal(describeTaxes([]), "");
});

test("validateTaxes rejects rows that are not objects", () => {
  assert.deepEqual(validateTaxes([null] as never), { error: "Each tax needs a name (up to 40 characters)." });
  assert.deepEqual(validateTaxes([42, "x"] as never), { error: "Each tax needs a name (up to 40 characters)." });
});

test("parseStoredTaxes falls back to the defaults for malformed rows", () => {
  assert.deepEqual(parseStoredTaxes("[null]"), DEFAULT_TAXES);
  assert.deepEqual(parseStoredTaxes('[{"label":"A"}]'), DEFAULT_TAXES);
});

test("validateTaxes rejects duplicate names (ignoring case and spaces)", () => {
  assert.deepEqual(
    validateTaxes([{ label: "Fee", rate: 1 }, { label: " fee ", rate: 2 }]),
    { error: "Each tax needs a different name." }
  );
});
