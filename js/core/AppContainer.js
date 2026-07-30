export class AppContainer {
    constructor() {
        this.services = new Map();
    }

    register(name, service) {
        if (this.services.has(name)) {
            console.warn(`Service ${name} is already registered. Overwriting.`);
        }
        this.services.set(name, service);
    }

    get(name) {
        const service = this.services.get(name);
        if (!service) {
            console.warn(`Service ${name} not found in container.`);
        }
        return service;
    }

    getAll() {
        return Object.fromEntries(this.services);
    }
}
