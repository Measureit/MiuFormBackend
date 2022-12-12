import { DbModel } from "./db.model";
import * as uuid from "uuid";

export const CreateIdChecklistItemConfig = (): string => {
    return `checklistitem_${uuid.v4()}`;
}

export const CreateChecklistItemConfig = (): ChecklistItemConfig => {
    let res = {} as ChecklistItemConfig;
    res._id = CreateIdChecklistItemConfig();
    res.isActive = true;
    return res;
}
export interface ChecklistItemConfig extends DbModel {
    order: number;
    content: string;
}
