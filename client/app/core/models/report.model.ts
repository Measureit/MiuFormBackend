import * as uuid from 'uuid';
import { ChecklistItemConfig } from './checklist-item-config.model';
import { DbModel } from './db.model';

export interface ImageSize {
    width: number;
    height: number;
}
export interface ImageMarkPart {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

//image w reporcie
export interface ReportImageItem {
    base64: string;
    size: ImageSize;
    marks?: ImageMarkPart[];
}


//checklist item w reporcie
export class ReportChecklistItem {
    public static Create(checklistConfig: ChecklistItemConfig): ReportChecklistItem {
        const res = new ReportChecklistItem();
        res.checklistItemId = checklistConfig._id;
        res.content = checklistConfig.content;
        res.order = checklistConfig.order;
        res.isChecked = null;
        return res;
    }

    checklistItemId: string; //id z configuracji
    content: string; //przepisany z configuracji (moze sie zmieniac w konfiguracji po wygeneroaniu raportu)
    isChecked: boolean | null;
    comment: string;
    order: number; //przepisany z configuracji (moze sie zmieniac w konfiguracji po wygeneroaniu raportu)
    pointImages: ReportImageItem[] = []; //images assigned to checklist item
}

export const CreateReport = (checklist: ChecklistItemConfig[]): Report => {
    const res = {} as Report;
    res._id = `report_${uuid.v4()}`;
    res.isActive = true;
    res.checklist = checklist.map(x => ReportChecklistItem.Create(x));
    res.dateOfCreation = Date.now();
    res.images = [];
    return res;
};

export interface Report extends DbModel {
    dateOfCreation: number;
    productName: string;
    productColor: string;
    productId: string;
    comment: string;
    factoryInfoId: string;
    checklist: ReportChecklistItem[];
    images: ReportImageItem[];

    dateOfDelivery?: number;
}
