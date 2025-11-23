import mongoose from 'mongoose';
import { IGuild } from '../../types/database';
export declare const GuildModel: mongoose.Model<IGuild, {}, {}, {}, mongoose.Document<unknown, {}, IGuild, {}, mongoose.DefaultSchemaOptions> & IGuild & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any, IGuild>;
//# sourceMappingURL=Guild.d.ts.map