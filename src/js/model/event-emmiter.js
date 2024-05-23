export default class EventEmitter {
    #callbacks = {};
  
    static Event = class {
      type = "";
      target = "";
      data = "";
    };
  
    addEventListener(eventType, callback) {
      if (typeof callback !== "function") return;
      if (this.#callbacks[eventType] === undefined) {
        this.#callbacks[eventType] = [];
      }
  
      this.#callbacks[eventType].push(callback);
    }
  
    dispatchEvent(eventType, data) {
      if (this.#callbacks[eventType] === undefined) return;
  
      const event = new EventEmitter.Event();
      event.type = eventType;
      event.target = this;
      event.data = data;
  
      this.#callbacks[eventType].forEach((callback) => {
        callback(event);
      });
    }
  }