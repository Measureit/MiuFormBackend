import { DbModel } from './db.model';
import * as uuid from 'uuid';

export const CreateIdFactoryInfoConfig = (): string => `factory_${uuid.v4()}`;

export const CreateFactoryInfoConfig = (): FactoryInfoConfig => {
    const res = {} as FactoryInfoConfig;
    res._id = CreateIdFactoryInfoConfig();
    res.isActive = true;
    res.emails = [];
    return res;
};

export interface FactoryInfoConfig extends DbModel {

    order: number;

    shortName: string;
    name: string;
    address: string;

    emails: string[]; //emails of factory users
}
