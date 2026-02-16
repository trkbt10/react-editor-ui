/**
 * @file Rule group: 6. Forbid mocking APIs from Jest and Bun (vitest allowed)
 */

export default {
  // Ban global access to jest (vitest allowed)
  "no-restricted-globals": [
    "error",
    { name: "jest", message: "Using Jest global is prohibited. Use vitest instead." },
  ],

  // Ban Jest mock helpers and Bun mock.module (vitest allowed)
  "no-restricted-properties": [
    "error",
    { object: "jest", property: "mock", message: "Jest mock APIs are prohibited. Use vitest instead." },
    { object: "jest", property: "fn", message: "Jest mock APIs are prohibited. Use vitest instead." },
    { object: "jest", property: "spyOn", message: "Jest mock APIs are prohibited. Use vitest instead." },
    { object: "mock", property: "module", message: "Bun mock.module is prohibited. Use vitest instead." },
  ],
};
