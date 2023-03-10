//let jsPDF = require('jspdf');
import { jsPDF } from 'jspdf';
import { Injectable } from '@angular/core';
import { flatMap, from, map, merge, mergeAll, mergeMap, Observable, of, tap, toArray, zip } from 'rxjs';
import { FactoryInfoConfig, ImageSize, Report, ReportChecklistItem, ReportImageItem } from '../models';
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

    toFolderAndFile(n: string): string {
        return n.replace(/[^a-zA-Z0-9\- ]/g, '');
    }

    getFileNameForReport(report: Report): string {
        return this.toFolderAndFile(`${report.productName} ${report.productColor} ${moment(report.dateOfCreation).format('YYYY-MM-DD-HH-MM-SS')}`);
    }

    createFolderName(factories: FactoryInfoConfig[], factoryId: string): string {
        const factory = factories.find(f => f._id === factoryId);
        if (factory !== undefined) {
            return this.toFolderAndFile(factory.shortName);
        }
        return this.toFolderAndFile(factoryId);
    }

    generateZip(factories: FactoryInfoConfig[], reports: Report[]): Observable<Blob> {
        const jsZip = new JSZip();
        return merge(
            reports.map(x =>
                zip(of(x), this.reportGeneratorService.generatePdf(x), of(JSON.stringify(x)))
            )
        )
        .pipe(
            mergeAll(),
            map(y => {
                const jsZipFolder = jsZip.folder(this.createFolderName(factories, y[0].factoryInfoId));
                jsZipFolder.file(`${this.getFileNameForReport(y[0])}.pdf`, y[1].output('blob'));
                jsZipFolder.file(`${this.getFileNameForReport(y[0])}.mfr`, y[2]);
            }),
            toArray(),
            mergeMap(x => from(jsZip.generateAsync({ type: 'blob' })))
        );
    }
}
