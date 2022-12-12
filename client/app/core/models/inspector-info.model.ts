import { DbModel } from "./db.model";
import * as uuid from "uuid";

export const InspectorInfoId = `inspectorInfo`

export const CreateInspectorInfo = (): InspectorInfo => {
    let res = {} as InspectorInfo;
    res._id = InspectorInfoId; //only one
    res.isActive = true;
    return res;
}

export interface  InspectorInfo extends DbModel {
    companyName: string;
    companyAddress: string;

    inspectorSign: string; //multi line    
}
