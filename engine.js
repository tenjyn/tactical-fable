// Simple game engine utilities for Tactical Fable
// Provides a basic event-driven engine with deterministic RNG and undo/redo support.

/**
 * Create a new Engine instance.
 * @param {Object} config Configuration for the engine.
 * @param {any} [config.initialState] Initial state object.
 * @param {string|number} [config.seed] Optional seed for RNG.
 * @returns {Engine}
 */
export function createEngine(config = {}) {
  const engine = {
    config,
    state: clone(config.initialState || {}),
    time: 0,
    listeners: {},
    history: [],
    rng: seedRng(config.seed ?? Date.now()),
    dispatch(event) {
      const handlers = engine.listeners[event.type] || [];
      for (const fn of handlers) {
        fn(engine, event);
      }
    },
  };
  return engine;
}

/**
 * Advance the engine's internal clock.
 * @param {Engine} engine Engine instance
 * @param {number} dtMs Delta time in milliseconds
 */
export function tick(engine, dtMs) {
  engine.time += dtMs;
}

/**
 * Dispatch an event through the engine's event bus.
 * Listeners are functions registered under `engine.listeners[type]`.
 * @param {Engine} engine Engine instance
 * @param {GameEvent} event Event object with a `type` field
 */
export function dispatch(engine, event) {
  engine.dispatch(event);
}

/**
 * Enable undo support by wrapping dispatch to save snapshots of state.
 * Adds `engine.undo()` method to revert to previous state.
 * @param {Engine} engine Engine instance
 */
export function withUndo(engine) {
  const originalDispatch = engine.dispatch.bind(engine);
  engine.dispatch = (evt) => {
    engine.history.push(clone(engine.state));
    originalDispatch(evt);
  };
  engine.undo = () => {
    if (engine.history.length) {
      engine.state = engine.history.pop();
    }
  };
}

/**
 * Serialize the engine to a JSON string.
 * @param {Engine} engine
 * @returns {string}
 */
export function serialize(engine) {
  return JSON.stringify({
    config: engine.config,
    state: engine.state,
    time: engine.time,
    history: engine.history,
    rngState: engine.rng.state ? engine.rng.state() : undefined,
  });
}

/**
 * Deserialize a previously serialized engine.
 * Note: event listeners are not restored.
 * @param {string} json
 * @returns {Engine}
 */
export function deserialize(json) {
  const data = JSON.parse(json);
  const engine = createEngine(data.config);
  engine.state = data.state;
  engine.time = data.time;
  engine.history = data.history || [];
  if (data.rngState !== undefined && engine.rng.setState) {
    engine.rng.setState(data.rngState);
  }
  return engine;
}

/**
 * Create a deterministic pseudo random number generator.
 * @param {string|number} seed
 * @returns {() => number} RNG function returning [0,1)
 */
export function seedRng(seed) {
  let s = 0;
  if (typeof seed === 'string') {
    for (let i = 0; i < seed.length; i++) {
      s = (s + seed.charCodeAt(i)) | 0;
    }
  } else {
    s = seed | 0;
  }
  const rng = function () {
    // Linear congruential generator constants from Numerical Recipes
    s = (Math.imul(1664525, s) + 1013904223) | 0;
    return (s >>> 0) / 4294967296;
  };
  rng.state = () => s;
  rng.setState = (n) => {
    s = n | 0;
  };
  return rng;
}

// Helper to deep-clone simple objects.
function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * @typedef {Object} Engine
 * @property {Object} config
 * @property {any} state
 * @property {number} time
 * @property {Object.<string, Function[]>} listeners
 * @property {Function} rng
 * @property {Array<any>} history
 * @property {(event: GameEvent) => void} [dispatch]
 * @property {() => void} [undo]
 */

/**
 * @typedef {Object} GameEvent
 * @property {string} type
 * @property {any} [payload]
 */
