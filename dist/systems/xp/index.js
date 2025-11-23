"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BaseSystem_1 = require("../BaseSystem");
const manager_1 = require("./manager");
const controller_1 = require("./controller");
class XPSystem extends BaseSystem_1.BaseSystem {
    constructor() {
        super(...arguments);
        this.name = 'XP';
    }
    async onInit() {
        this.manager = new manager_1.XPManager();
        this.controller = new controller_1.XPController(this.manager);
        // In future: Register event listeners for messageCreate to add XP
    }
}
exports.default = XPSystem;
//# sourceMappingURL=index.js.map