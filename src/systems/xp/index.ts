import { BaseSystem } from '../BaseSystem';
import { XPManager } from './manager';
import { XPController } from './controller';

export default class XPSystem extends BaseSystem {
    public name = 'XP';
    public manager!: XPManager;
    public controller!: XPController;

    protected async onInit(): Promise<void> {
        this.manager = new XPManager();
        this.controller = new XPController(this.manager);

        // In future: Register event listeners for messageCreate to add XP
    }
}
