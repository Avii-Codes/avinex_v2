import mongoose from 'mongoose';
import { IUser } from '../../types/database';
export declare const UserModel: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any, IUser>;
//# sourceMappingURL=User.d.ts.map