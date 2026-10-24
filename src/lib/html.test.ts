import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "./html";
import { escapeEmailData } from "./email";
import { isDeliveryArea } from "./booking-options";
import { computeQuote } from "./format";

test("escapeHtml neutralizes markup characters", () => {
  assert.equal(
    escapeHtml(`<img src=x onerror="alert('1')"> & co`),
    "&lt;img src=x onerror=&quot;alert(&#39;1&#39;)&quot;&gt; &amp; co"
  );
  assert.equal(escapeHtml("Plain text"), "Plain text");
});

test("escapeEmailData escapes every customer-supplied and admin-set text field", () => {
  const evil = `<a href="https://evil.example">x</a>`;
  const quote = computeQuote(100, 1, [{ label: evil, rate: 1 }]);
  const out = escapeEmailData({
    id: "abc123",
    fullName: evil,
    phone: evil,
    email: evil,
    car: evil,
    startDate: "2026-11-01",
    endDate: "2026-11-02",
    pickupTime: "10:00 AM",
    returnTime: "10:00 AM",
    pickupLocation: evil,
    returnLocation: evil,
    deliveryAddress: evil,
    days: 1,
    quote,
    groups: [{ price: 100, count: 1 }],
    message: evil,
  });
  for (const v of [
    out.fullName, out.phone, out.email, out.car, out.pickupLocation,
    out.returnLocation, out.deliveryAddress, out.message, out.quote.lines[0].label,
  ]) {
    assert.ok(!String(v).includes("<"), `unescaped: ${v}`);
  }
  assert.equal(out.quote.total, quote.total);
  assert.equal(out.pickupTime, "10:00 AM");
});

test("escapeEmailData keeps empty optional fields empty", () => {
  const out = escapeEmailData({
    id: "abc123", fullName: "Ann", phone: "555", email: "a@b.co", car: "Car",
    startDate: "2026-11-01", endDate: "2026-11-02", days: 1,
    quote: computeQuote(100, 1), groups: [{ price: 100, count: 1 }],
    pickupLocation: null, deliveryAddress: null, message: null,
  });
  assert.equal(out.pickupLocation, null);
  assert.equal(out.deliveryAddress, null);
  assert.equal(out.message, null);
});

test("isDeliveryArea accepts only the listed NY & NJ areas", () => {
  assert.equal(isDeliveryArea("Manhattan"), true);
  assert.equal(isDeliveryArea("Other (New Jersey)"), true);
  assert.equal(isDeliveryArea("<b>Mars</b>"), false);
  assert.equal(isDeliveryArea("manhattan"), false);
  assert.equal(isDeliveryArea("__same__"), false);
});
