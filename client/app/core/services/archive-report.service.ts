//let jsPDF = require('jspdf');
import { jsPDF } from 'jspdf';
import { Injectable } from "@angular/core";
import { from, map, merge, mergeAll, mergeMap, Observable, of, zip } from "rxjs";
import { FactoryInfoConfig, ImageSize, Report, ReportChecklistItem, ReportImageItem } from "../models";
import { ConfigurationService } from './configuration.service';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';
import { M } from '@angular/cdk/keycodes';
import { addFontToDoc, fontMiu } from './AbhayaLibre-Regular-normal';
import { InspectorInfo } from '../models/inspector-info.model';
import JSZip from 'jszip';
import { ReportGeneratorService } from './report-generator.service';



//https://codesandbox.io/s/dx5v0?file=/src/index.js
@Injectable({
    providedIn: 'root',
})
export class ArchiveReportGeneratorService {


    constructor(private configurationService: ConfigurationService,
        private reportGeneratorService: ReportGeneratorService,
        private domSanitizer: DomSanitizer) {
    }

    private groupByKey<T, K>(array: Array<T>, keyFactor: (T) => K): Map<K, T[]> {
        let map = new Map<K, T[]>();
        array.forEach(item => {
            let itemKey = keyFactor(item);
            if (!map.has(itemKey)) {
                map.set(itemKey, array.filter(i => keyFactor(i) === keyFactor(item)));
            }
        });
        return map;
    }

    getFileNameForReport(factory: FactoryInfoConfig, report: Report): string {
        return report._id; //todo
    }

    generateZip(factories: FactoryInfoConfig[], reports: Report[]): Observable<Blob> {
        of(reports)


        let reportsGroupByFactory = this.groupByKey(reports, (r: Report) => r.factoryInfoId);
        const zip = new JSZip();

        reportsGroupByFactory.forEach((reports: Report[], key: string) => {
            let factory = factories.find(f => f._id === key);

            const img = zip.folder(factory.shortName);

            reports.forEach((report: Report) =>
            {
                let fileName = this.getFileNameForReport(factory, report);
            
                this.reportGeneratorService.generatePdf(report)

               img.file("fileName.miurep", imgData, { base64: true });
               img.file("fileName.pdf", imgData, { base64: true });
            });
        });

        return from(zip.generateAsync({ type: "blob" }));
    }
}
