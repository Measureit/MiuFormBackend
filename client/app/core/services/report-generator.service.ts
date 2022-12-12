//let jsPDF = require('jspdf');
import { jsPDF } from 'jspdf';
import { Injectable } from "@angular/core";
import { from, map, merge, mergeMap, Observable, of, zip } from "rxjs";
import { FactoryInfoConfig, ImageSize, Report, ReportChecklistItem, ReportImageItem } from "../models";
import { ConfigurationService } from './configuration.service';
import { DomSanitizer } from '@angular/platform-browser';
import moment from 'moment';
import { M } from '@angular/cdk/keycodes';
import { addFontToDoc, fontMiu } from './AbhayaLibre-Regular-normal';

interface ReportGeneratorConfig {
    vMargin: number;
    hMargin: number;
    pageHeight: number;
    pageWidth: number;
    lineDistance: number;
}
interface ReportGeneratorContext {
    doc: jsPDF;
    factory: FactoryInfoConfig;
    yPosition: number;
    yPage: number;
    config: ReportGeneratorConfig;
}

interface AddTextLineOptions {
    fontSize?: number;
    xPos?: number;
    align?: "left" | "center" | "right";
    makeBottomMargin?: boolean; 
    keepY?: boolean;
}

//https://codesandbox.io/s/dx5v0?file=/src/index.js
@Injectable({
    providedIn: 'root',
})
export class ReportGeneratorService {


    constructor(private configurationService: ConfigurationService,
        private domSanitizer: DomSanitizer) {
    }

    private newPage(context: ReportGeneratorContext) {
        context.doc.addPage();
        context.yPage = context.yPage + 1;
        context.yPosition = context.config.vMargin; 
    }
    
    private addYSpace(context: ReportGeneratorContext, ySpace: number) {
        context.yPosition = context.yPosition + ySpace; 
    }

    private fontSizeToMm(fontSize: number) : number {
        return fontSize / 3.2; //todo: font size to mm 
    }
    
    private addTextLine(context: ReportGeneratorContext, text: string, options: AddTextLineOptions) { //}: Observable<ReportGeneratorContext> {
        var defaults = {
            //xPos: undefined,
            fontSize: 16,
            align: "left",
            makeBottomMargin: true, 
            keepY: false
        };
        let actual = Object.assign({}, defaults, options);
        
        context.yPosition = Math.max(context.yPosition, context.config.vMargin);
        if (this.spaceToEndOfPage(context, actual.fontSize) > 0) {
            this.newPage(context);
        }
        context.doc.setFontSize(actual.fontSize);

        let x = actual.xPos || context.config.hMargin;
        if (actual.xPos === undefined) {
            x = context.config.hMargin;
            switch(actual.align) {
                case 'center':
                    x = context.config.pageWidth / 2;
                    break;
                case 'right':
                    x = context.config.pageWidth - context.config.hMargin;
                    break;
            }
        }
        console.log('y: ' + context.yPosition )
        if (text && text.length> 0) {
            context.doc.text(text, x, context.yPosition, {align: actual.align});
        }
        if (!actual.keepY) {
            context.yPosition = context.yPosition + this.fontSizeToMm(actual.fontSize);        
            if (actual.makeBottomMargin) {
                context.yPosition = context.yPosition + context.config.lineDistance;
            }
        }
        //return of(context);
    } 

    //jesli dodatni wynik to wychodzi za strone 
    spaceToEndOfPage(context: ReportGeneratorContext, eleHeight: number): number {
        return context.yPosition + eleHeight - context.config.pageHeight - context.config.vMargin; 
    }

    generatePdf(report: Report): Observable<jsPDF> {
        return zip(
                this.configurationService.getFactory(report.factoryInfoId),
                this.configurationService.getInspectorInfo()
                )
            .pipe(                
                mergeMap(f => {
                    let doc = new jsPDF("p", "mm", "a4", true);
                    addFontToDoc(doc, fontMiu);
                    return of({ doc: doc, 
                        yPage: 0, yPosition: 0, factory: f[0],
                        config: { vMargin: 10, hMargin: 10, lineDistance: 5,
                            pageHeight: doc.internal.pageSize.height || doc.internal.pageSize.getHeight(),
                            pageWidth: doc.internal.pageSize.width || doc.internal.pageSize.getWidth() } as ReportGeneratorConfig
                    } as ReportGeneratorContext)
                }),
                mergeMap(x => {
                    this.addHeader(x, moment(new Date(report.dateOfCreation)).format('DD-MM-YYYY HH:mm:ss'));
                    this.addFactoryInfo(x, x.factory);
                    this.addProductInfo(x, report.productName, report.productId, report.productColor);
                    this.addChecklist(x, report.checklist);
                    this.addSummary(x, report.comment, report.images);
                    this.addSign(x, 'asdfadf\rasfdasdf');
                    return of(x.doc);
                })
            );
    }

    

    private addHeader(context: ReportGeneratorContext, dateOfCreation: string) { //}: Observable<ReportGeneratorContext> {
        this.addTextLine(context, dateOfCreation, { fontSize: 10, align: 'right', makeBottomMargin: false, keepY: true});
        this.addTextLine(context, "MY COMPANY", { fontSize: 15 });
        this.addTextLine(context, "MY COMPANY ADDRESS", { fontSize: 15 });
        this.addYSpace(context, 10);
        this.addTextLine(context, "Raport pokontrolny produkcji mebla", { fontSize: 20, align: 'center'});
        
    }
//ĄĆŻŃÓŁĘ ąćżńół 
    private addFactoryInfo(context: ReportGeneratorContext, factoryInfo: FactoryInfoConfig) { //}: Observable<ReportGeneratorContext> {
        this.addYSpace(context, 15);
        this.addTextLine(context, "Firma/Miejsce wykonania kontroli:", { fontSize: 17, align: 'center'});
        this.addTextLine(context, factoryInfo.name, { fontSize: 15, align: 'center'});
        this.addTextLine(context, factoryInfo.address, { fontSize: 15, align: 'center'});
    }
            
    private addProductInfo(context: ReportGeneratorContext, productName: string, productId: string, productColor: string) { //}: Observable<ReportGeneratorContext> {
        this.addYSpace(context, 7);
        this.addTextLine(context, "Nazwa produktu: " + productName, { fontSize: 15} );
        this.addTextLine(context, "Id produktu: " + productId, { fontSize: 15});
        this.addTextLine(context, "Kolor produktu: " + productColor, { fontSize: 15});
    }
    
    getScale(originalSize: ImageSize, maxWidth: number, maxHeight: number): ImageSize {
        if (originalSize.width <= maxWidth && originalSize.height <= maxHeight) {
          return { width: originalSize.width, height: originalSize.height };
        }
    
        let newWidth: number;
        let newHeight: number;
    
        if (originalSize.width > originalSize.height) {
          newHeight = originalSize.height * (maxWidth / originalSize.width);
          newWidth = maxWidth;
        } else {
          newWidth = originalSize.width * (maxHeight / originalSize.height);
          newHeight = maxHeight;
        }
        return { width: newWidth, height: newHeight };
      }

    private addImages(context: ReportGeneratorContext, images: ReportImageItem[]) { //} Observable<ReportGeneratorContext> {
        if (images && images.length > 0) {
            let distanceBetweenImages = 5;
            let pageHeightWithoutMargin = context.config.pageHeight - 2 * context.config.vMargin;
            images.forEach(ib => {
                let pdfSize = this.getScale(ib.size, 
                    context.config.pageWidth - 2 * context.config.hMargin,
                    (pageHeightWithoutMargin) / 2 - distanceBetweenImages
                );
                if (this.spaceToEndOfPage(context, pdfSize.height) > 0) {
                    context.doc.addPage();
                    context.yPosition = context.config.vMargin;
                }
                                
                context.doc.addImage(ib.base64, "png", context.config.hMargin, context.yPosition, pdfSize.width, pdfSize.height);
                context.yPosition = context.yPosition + distanceBetweenImages + pdfSize.height;
            });            
        }
    }

    private addComment(context: ReportGeneratorContext, comment: string) { //} Observable<ReportGeneratorContext> {
        if (comment && comment.length > 0) {
            context.doc.setFont("MyFont", "italic");
            this.addTextLine(context, 'Komentarz: ' + comment, {});
            context.doc.setFont("MyFont", "normal");
        }
    }
    
    private addChecklist(context: ReportGeneratorContext, checklist: ReportChecklistItem[]) { //}: Observable<ReportGeneratorContext> {
        const answerTextWidth = 20;
        const numberWidth = 5;
        let contentWidth = context.config.pageWidth - 2 * context.config.hMargin 
            - answerTextWidth - numberWidth;
        
        this.addYSpace(context, 10);
        checklist.forEach(x => {
            var arr = context.doc.splitTextToSize(x.content, contentWidth) as string[];
            var dim = context.doc.getTextDimensions(x.content);
            var arrHeight = arr.length * dim.h + (arr.length - 1) * context.config.lineDistance; 
            if (this.spaceToEndOfPage(context, arrHeight) > 0) {
                context.doc.addPage();
                context.yPosition = context.config.vMargin;
            }
            this.addTextLine(context, `${x.order + 1}.`, { 
                xPos: context.config.hMargin + numberWidth, 
                align: 'right', keepY: true});
            arr.forEach((line, i) => {
                if (i === 0) {
                    this.addTextLine(context, x.isChecked === true ? 'TAK' : (x.isChecked === false ? 'NIE' : '-'), 
                        { xPos: context.config.pageWidth - context.config.hMargin, align: 'right', keepY: true });
                } 
                this.addTextLine(context, line, { xPos: context.config.hMargin + numberWidth + 2});

                this.addComment(context, x.comment);

                this.addImages(context, x.pointImages); 
            });
        });        
    }

    addSummary(context: ReportGeneratorContext, comment: string, images: ReportImageItem[]) {
        this.addTextLine(context, 'PODSUMOWANIE', { align: 'center' });

        this.addComment(context, comment);
        
        this.addImages(context, images);
    }

    addSign(context: ReportGeneratorContext, sign: string) {
        if (sign && sign.length > 0) {
            const lines = sign.split(/\r?\n/);
            const h = context.doc.getTextDimensions(lines[0]).h;
            var width = lines
                .map(x => context.doc.getTextDimensions(x).w)
                .reduce((p, n) => Math.max(p, n), 0);
            var cen = context.config.pageWidth - context.config.hMargin - width / 2;
            if (this.spaceToEndOfPage(context, lines.length * h +context.config.lineDistance) > 0) {
                context.doc.addPage();
                context.yPosition = context.config.vMargin;
            }
            lines.forEach(x => this.addTextLine(context, x, { xPos: cen, align: 'center'}))
        }        
    }
}
