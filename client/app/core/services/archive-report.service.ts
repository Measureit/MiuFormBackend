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
        return n;
    }

    getFileNameForReport(report: Report): string {
        return this.toFolderAndFile(report.productName + report.dateOfCreation.toLocaleString());
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
           // tap(x => console.log(x)),
            mergeAll(),
            //mergeMap(y => merge()),
            //mergeMap(rs => rs.map( x => {
            // flatMap(x =>zip(
            //         of({ folderName: this.createFolderName(factories, x.factoryInfoId), fileName: this.getFileNameForReport(x)}),
            //         from(jsZip.generateAsync({ type: 'blob' }))
            // )),
            map(y => {
                const jsZipFolder = jsZip.folder(this.createFolderName(factories, y[0].factoryInfoId));
                jsZipFolder.file(`${this.getFileNameForReport(y[0])}.pdf`, y[1].output('blob'));
                jsZipFolder.file(`${this.getFileNameForReport(y[0])}.mfr`, y[2]);
            }),
            toArray(),
            mergeMap(x => from(jsZip.generateAsync({ type: 'blob' })))
        );



        // .pipe(
        //     mergeAll(),
        //     //mergeMap(y => merge()),
        //     //mergeMap(rs => rs.map( x => {
        //     map(x =>zip(
        //             of({ folderName: this.createFolderName(factories, x.factoryInfoId), fileName: this.getFileNameForReport(x)}),
        //             from(jsZip.generateAsync({ type: 'blob' }))
        //     )),
        //     map(y => {
        //         const jsZipFolder = jsZip.folder(y[0].folderName);
        //         jsZipFolder.file(y[0].fileName, y[1], { base64: true });
        //     }),
        //     mergeMap(x => from(jsZip.generateAsync({ type: 'blob' })))
        // );





        // const reportsGroupByFactory = this.groupByKey(reports, (r: Report) => r.factoryInfoId);

        // const toZipStruct = Array.from( reportsGroupByFactory )
        //     .map(([key, value]) => ({ key, value }))
        //     .map(v => ({ folder: this.createFolderName(factories, v.key),
        //         reports: v.value.map(r => ({ name: this.getFileNameForReport(r), report: r}))}));

        // const jsZip = new JSZip();

        // reportsGroupByFactory.forEach((groupItemReports: Report[], key: string) => {


        //     const jsZipFolder = jsZip.folder(this.createFolderName(factories, key));
        //     const jsZipFolder1 = jsZip.folder(this.createFolderName(factories, key));

        //     groupItemReports.forEach((report: Report) =>
        //     {
        //         const fileName = this.getFileNameForReport(report);

        //         this.reportGeneratorService.generatePdf(report);

        //     //    jsZipFolder.file('fileName.miurep', imgData, { base64: true });
        //     //    jsZipFolder.file('fileName.pdf', imgData, { base64: true });
        //     });
        // });

        //return from(jsZip.generateAsync({ type: 'blob' }));
    }

    private groupByKey<T, K>(array: Array<T>, keyFactor: (T) => K): Map<K, T[]> {
        const res = new Map<K, T[]>();
        array.forEach(item => {
            const itemKey = keyFactor(item);
            if (!res.has(itemKey)) {
                res.set(itemKey, array.filter(i => keyFactor(i) === keyFactor(item)));
            }
        });
        return res;
    }
}
