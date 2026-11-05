/// <reference types="mocha" />
/// <reference types="chai/register-should" />

// The assertions @signalk/signalk-schema's chaiModule and chai-things add.
declare namespace Chai {
  interface Assertion {
    validSignalK: Assertion
    validSignalKDelta: Assertion
    validSignalKVessel: Assertion
    validSignalKVesselIgnoringIdentity: Assertion
    validSignalKAtoNIgnoringIdentity: Assertion
    something: Assertion
  }
}
