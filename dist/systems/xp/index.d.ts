import { BaseSystem } from '../BaseSystem';
import { XPManager } from './manager';
import { XPController } from './controller';
export default class XPSystem extends BaseSystem {
    name: string;
    manager: XPManager;
    controller: XPController;
    protected onInit(): Promise<void>;
}
//# sourceMappingURL=index.d.ts.map