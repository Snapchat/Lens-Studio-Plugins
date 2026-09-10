const assert = require("node:assert/strict");
const test = require("node:test");
const {
  AuthenticatedMessageGate,
} = require("../.test-dist/AuthenticatedMessageGate.js");

const TOKEN = "3ce9a050-bfdd-4b12-898a-70e1d5ac633e";

test("rejects executeCode before authentication", () => {
  const gate = new AuthenticatedMessageGate(TOKEN);

  assert.equal(
    gate.evaluate({ event: "executeCode", payload: { code: "attackerCode()" } }),
    "reject"
  );
});

test("rejects missing and incorrect authentication tokens", () => {
  assert.equal(
    new AuthenticatedMessageGate(TOKEN).evaluate({ event: "auth", payload: {} }),
    "reject"
  );
  assert.equal(
    new AuthenticatedMessageGate(TOKEN).evaluate({
      event: "auth",
      payload: { token: "wrong-token" },
    }),
    "reject"
  );
});

test("dispatches normal messages only after matching authentication", () => {
  const gate = new AuthenticatedMessageGate(TOKEN);

  assert.equal(
    gate.evaluate({ event: "auth", payload: { token: TOKEN } }),
    "authenticate"
  );
  assert.equal(gate.evaluate({ event: "ready" }), "dispatch");
  assert.equal(
    gate.evaluate({ event: "executeCode", payload: { code: "legitimateCode()" } }),
    "dispatch"
  );
});

test("does not allow a connection to re-authenticate", () => {
  const gate = new AuthenticatedMessageGate(TOKEN);

  assert.equal(
    gate.evaluate({ event: "auth", payload: { token: TOKEN } }),
    "authenticate"
  );
  assert.equal(
    gate.evaluate({ event: "auth", payload: { token: TOKEN } }),
    "reject"
  );
});
