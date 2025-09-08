import type { AccessibilityReport, AccessibilityIssue } from '../types';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, PageBreak } from 'docx';

const getFilenameBase = (url: string, timestamp: string): string => {
    const safeUrl = url.startsWith('http')
        ? url.replace(/^https?:\/\//, '').replace(/[^a-z0-9]/gi, '_').toLowerCase()
        : 'html-source';
    const date = new Date(timestamp).toISOString().split('T')[0];
    return `accessibility-report-${safeUrl}-${date}`;
};

const getBulkFilenameBase = (): string => {
    const date = new Date().toISOString().split('T')[0];
    return `accessibility-audit-multiple-pages-${date}`;
}

const downloadBlob = (blob: Blob, filename: string) => {
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
};

const escapeHtml = (unsafe: string): string => {
    if(!unsafe) return '';
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
};

// --- SINGLE REPORT EXPORTERS ---

export const exportAsJson = (report: AccessibilityReport) => {
    const filename = `${getFilenameBase(report.url, report.timestamp)}.json`;
    const jsonString = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, filename);
};

const generateIssueSectionHtml = (title: string, issues: AccessibilityIssue[]): string => {
    if (issues.length === 0) return '';
    return `
        <section>
            <h2 class="section-title">${title} (${issues.length})</h2>
            <div class="issues-container">
            ${issues.map(issue => `
                <div class="issue ${issue.impact}">
                    <h3>${escapeHtml(issue.description)}</h3>
                    <p><strong>Impact:</strong> <span class="impact-badge ${issue.impact}">${issue.impact}</span></p>
                    <p>${escapeHtml(issue.help)}</p>
                    <p><a href="${issue.helpUrl}" target="_blank" rel="noopener noreferrer">Learn more about "${escapeHtml(issue.id)}"</a></p>
                    ${issue.htmlElementSnippet ? `<div class="snippet-container"><p><strong>Element Snippet:</strong></p><pre><code>${escapeHtml(issue.htmlElementSnippet)}</code></pre></div>` : ''}
                </div>
            `).join('')}
            </div>
        </section>
    `;
};

export const exportAsHtml = (report: AccessibilityReport) => {
    const filename = `${getFilenameBase(report.url, report.timestamp)}.html`;
    const htmlString = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Accessibility Report for ${escapeHtml(report.url)}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
                h1, h2, h3 { color: #1e40af; }
                h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; font-size: 2em; }
                .report-title { font-size: 1.8em; margin-top: 3rem; border-top: 3px solid #1e40af; padding-top: 1.5rem; }
                .section-title { font-size: 1.5em; margin-top: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;}
                .issue { border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 5px; page-break-inside: avoid; }
                .issue p { margin: 0.5rem 0; }
                .issue h3 { margin-top: 0; }
                .impact-badge { display: inline-block; padding: 0.2em 0.6em; font-size: 0.8em; font-weight: bold; border-radius: 1em; color: white; text-transform: capitalize; }
                .critical { border-left: 5px solid #dc2626; } .critical .impact-badge { background-color: #dc2626; }
                .serious { border-left: 5px solid #f97316; } .serious .impact-badge { background-color: #f97316; }
                .moderate { border-left: 5px solid #f59e0b; } .moderate .impact-badge { background-color: #f59e0b; }
                .minor { border-left: 5px solid #3b82f6; } .minor .impact-badge { background-color: #3b82f6; }
                .none { border-left: 5px solid #22c55e; } .none .impact-badge { background-color: #22c55e; }
                .info { border-left: 5px solid #0ea5e9; } .info .impact-badge { background-color: #0ea5e9; }
                .snippet-container { margin-top: 1rem; }
                pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.8rem; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
                code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 0.9em; }
                a { color: #3b82f6; text-decoration: none; } a:hover { text-decoration: underline; }
                .summary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 5px; margin-bottom: 2rem; }
            </style>
        </head>
        <body>
            <h1>Accessibility Report</h1>
            <div class="summary">
                <p><strong>URL:</strong> <a href="${report.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(report.url)}</a></p>
                <p><strong>Scanned on:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
                <p><strong>Violations:</strong> ${report.violations.length}</p>
                <p><strong>Needs Review:</strong> ${report.incomplete.length}</p>
                <p><strong>Passes:</strong> ${report.passes.length}</p>
            </div>
            ${generateIssueSectionHtml('Violations', report.violations)}
            ${generateIssueSectionHtml('Needs Review', report.incomplete)}
            ${generateIssueSectionHtml('Passed Tests', report.passes)}
        </body>
        </html>
    `;
    const blob = new Blob([htmlString], { type: 'text/html' });
    downloadBlob(blob, filename);
};

export const exportAsCsv = (report: AccessibilityReport) => {
    const filename = `${getFilenameBase(report.url, report.timestamp)}.csv`;
    const headers = ['Category', 'Impact', 'ID', 'Description', 'Help', 'Help URL', 'HTML Snippet'];
    
    const toCsvRow = (issue: AccessibilityIssue, category: string) => {
        return [
            category,
            issue.impact,
            issue.id,
            issue.description,
            issue.help,
            issue.helpUrl,
            issue.htmlElementSnippet || ''
        ];
    };
    
    const rows = [
        ...report.violations.map(i => toCsvRow(i, 'Violation')),
        ...report.incomplete.map(i => toCsvRow(i, 'Needs Review')),
        ...report.passes.map(i => toCsvRow(i, 'Pass')),
    ];

    const csvString = [headers, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');

    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
};

export const exportAsPdf = (report: AccessibilityReport) => {
    const filename = `${getFilenameBase(report.url, report.timestamp)}.pdf`;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Accessibility Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`URL: ${report.url}`, 14, 32);
    doc.text(`Scanned on: ${new Date(report.timestamp).toLocaleString()}`, 14, 38);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text('Summary', 14, 50);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`- Violations: ${report.violations.length}`, 14, 56);
    doc.text(`- Needs Review: ${report.incomplete.length}`, 14, 62);
    doc.text(`- Passes: ${report.passes.length}`, 14, 68);

    const generateTable = (title: string, issues: AccessibilityIssue[], startY: number) => {
        if (issues.length === 0) return startY;
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(title, 14, startY);

        autoTable(doc, {
            head: [['Impact', 'Description', 'Rule ID']],
            body: issues.map(i => [i.impact, i.description, i.id]),
            startY: startY + 5,
            theme: 'grid',
            headStyles: { fillColor: '#1e40af' },
            styles: { fontSize: 9 },
            columnStyles: { 
                0: { cellWidth: 20 },
                1: { cellWidth: 120 },
                2: { cellWidth: 'auto' }
            }
        });
        return (doc as any).lastAutoTable.finalY + 10;
    };

    let currentY = 80;
    currentY = generateTable(`Violations (${report.violations.length})`, report.violations, currentY);
    currentY = generateTable(`Needs Review (${report.incomplete.length})`, report.incomplete, currentY);
    generateTable(`Passed Tests (${report.passes.length})`, report.passes, currentY);

    doc.save(filename);
};

export const exportAsWord = (report: AccessibilityReport) => {
    const filename = `${getFilenameBase(report.url, report.timestamp)}.docx`;

    const createIssuesTable = (issues: AccessibilityIssue[]): Paragraph | Table => {
        if (!issues || issues.length === 0) return new Paragraph("None found in this category.");
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: "Impact", style: "strong" })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                        new TableCell({ children: [new Paragraph({ text: "Description & Details", style: "strong" })], width: { size: 85, type: WidthType.PERCENTAGE } }),
                    ]
                }),
                ...issues.map(issue => new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(issue.impact)] }),
                        new TableCell({ children: [
                            new Paragraph({ text: issue.description, style: "strong" }),
                            new Paragraph(issue.help),
                            new Paragraph({ text: `Rule: ${issue.id} | ${issue.helpUrl}` }),
                            ...(issue.htmlElementSnippet ? [
                                new Paragraph({ text: "Snippet:", style: "strong" }), 
                                new Paragraph({ text: issue.htmlElementSnippet })
                            ] : [])
                        ]}),
                    ]
                }))
            ]
        });
    };

    const doc = new Document({
        styles: { paragraphStyles: [ { id: "strong", name: "Strong", run: { bold: true } } ] },
        sections: [{
            children: [
                new Paragraph({ text: 'Accessibility Report', heading: HeadingLevel.TITLE }),
                new Paragraph({ children: [new TextRun({ text: "URL: ", bold: true }), new TextRun(report.url)] }),
                new Paragraph({ children: [new TextRun({ text: "Scanned on: ", bold: true }), new TextRun(new Date(report.timestamp).toLocaleString())] }),
                new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_1 }),
                new Paragraph(`- Violations: ${report.violations.length}`),
                new Paragraph(`- Needs Review: ${report.incomplete.length}`),
                new Paragraph(`- Passes: ${report.passes.length}`),
                new Paragraph(' '),
                new Paragraph({ text: `Violations (${report.violations.length})`, heading: HeadingLevel.HEADING_1 }),
                createIssuesTable(report.violations),
                new Paragraph(' '),
                new Paragraph({ text: `Needs Review (${report.incomplete.length})`, heading: HeadingLevel.HEADING_1 }),
                createIssuesTable(report.incomplete),
                new Paragraph(' '),
                new Paragraph({ text: `Passed Tests (${report.passes.length})`, heading: HeadingLevel.HEADING_1 }),
                createIssuesTable(report.passes),
            ],
        }],
    });
    
    Packer.toBlob(doc).then(blob => {
        downloadBlob(blob, filename);
    });
};


// --- BULK REPORT EXPORTERS ---

export const exportAllAsJson = (reports: AccessibilityReport[]) => {
    const filename = `${getBulkFilenameBase()}.json`;
    const jsonString = JSON.stringify(reports, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, filename);
};

export const exportAllAsHtml = (reports: AccessibilityReport[]) => {
    const filename = `${getBulkFilenameBase()}.html`;
    const reportsHtml = reports.map(report => `
        <h1 class="report-title">Report for: <a href="${report.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(report.url)}</a></h1>
        <div class="summary">
            <p><strong>Scanned on:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
            <p><strong>Violations:</strong> ${report.violations.length}</p>
            <p><strong>Needs Review:</strong> ${report.incomplete.length}</p>
            <p><strong>Passes:</strong> ${report.passes.length}</p>
        </div>
        ${generateIssueSectionHtml('Violations', report.violations)}
        ${generateIssueSectionHtml('Needs Review', report.incomplete)}
        ${generateIssueSectionHtml('Passed Tests', report.passes)}
    `).join('<hr class="report-divider">');

    const fullHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Aggregated Accessibility Report</title>
             <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 2rem auto; padding: 0 1rem; }
                h1, h2, h3 { color: #1e40af; }
                h1 { border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem; font-size: 2em; }
                .report-title { font-size: 1.8em; margin-top: 3rem; border-top: 3px solid #1e40af; padding-top: 1.5rem; }
                .report-divider { margin-top: 3rem; border: none; height: 1px; background-color: #ccc; }
                .section-title { font-size: 1.5em; margin-top: 2rem; border-bottom: 1px solid #ccc; padding-bottom: 0.3rem;}
                .issue { border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; border-radius: 5px; page-break-inside: avoid; }
                .issue p { margin: 0.5rem 0; }
                .issue h3 { margin-top: 0; }
                .impact-badge { display: inline-block; padding: 0.2em 0.6em; font-size: 0.8em; font-weight: bold; border-radius: 1em; color: white; text-transform: capitalize; }
                .critical { border-left: 5px solid #dc2626; } .critical .impact-badge { background-color: #dc2626; }
                .serious { border-left: 5px solid #f97316; } .serious .impact-badge { background-color: #f97316; }
                .moderate { border-left: 5px solid #f59e0b; } .moderate .impact-badge { background-color: #f59e0b; }
                .minor { border-left: 5px solid #3b82f6; } .minor .impact-badge { background-color: #3b82f6; }
                .none { border-left: 5px solid #22c55e; } .none .impact-badge { background-color: #22c55e; }
                .info { border-left: 5px solid #0ea5e9; } .info .impact-badge { background-color: #0ea5e9; }
                .snippet-container { margin-top: 1rem; }
                pre { background: #f8fafc; border: 1px solid #e2e8f0; padding: 0.8rem; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word; }
                code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; font-size: 0.9em; }
                a { color: #3b82f6; text-decoration: none; } a:hover { text-decoration: underline; }
                .summary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 5px; margin-bottom: 2rem; }
            </style>
        </head>
        <body>
            <h1>Aggregated Accessibility Report</h1>
            ${reportsHtml}
        </body>
        </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    downloadBlob(blob, filename);
};

export const exportAllAsCsv = (reports: AccessibilityReport[]) => {
    const filename = `${getBulkFilenameBase()}.csv`;
    const headers = ['URL', 'Category', 'Impact', 'ID', 'Description', 'Help', 'Help URL', 'HTML Snippet'];

    const toCsvRow = (issue: AccessibilityIssue, category: string, url: string) => {
        return [
            url,
            category,
            issue.impact,
            issue.id,
            issue.description,
            issue.help,
            issue.helpUrl,
            issue.htmlElementSnippet || ''
        ];
    };
    
    const allRows: (string|undefined)[][] = [];
    reports.forEach(report => {
        const url = report.url;
        report.violations.forEach(i => allRows.push(toCsvRow(i, 'Violation', url)));
        report.incomplete.forEach(i => allRows.push(toCsvRow(i, 'Needs Review', url)));
        report.passes.forEach(i => allRows.push(toCsvRow(i, 'Pass', url)));
    });

    const csvString = [headers, ...allRows]
        .map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
        .join('\n');
    
    const blob = new Blob([`\uFEFF${csvString}`], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
};

export const exportAllAsPdf = (reports: AccessibilityReport[]) => {
    const filename = `${getBulkFilenameBase()}.pdf`;
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Aggregated Accessibility Report', 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Total pages scanned: ${reports.length}`, 14, 32);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 38);

    let currentY = 50;

    const generateTable = (title: string, issues: AccessibilityIssue[], startY: number) => {
        if (issues.length === 0) return startY;
        
        doc.setFontSize(14);
        doc.setTextColor(0);
        doc.text(title, 14, startY);

        autoTable(doc, {
            head: [['Impact', 'Description', 'Rule ID']],
            body: issues.map(i => [i.impact, i.description, i.id]),
            startY: startY + 5,
            theme: 'grid',
            headStyles: { fillColor: '#1e40af' },
            styles: { fontSize: 9 },
            columnStyles: { 
                0: { cellWidth: 20 },
                1: { cellWidth: 120 },
                2: { cellWidth: 'auto' }
            },
            didDrawPage: (data) => {
                currentY = data.cursor?.y ?? 10;
            }
        });
        return (doc as any).lastAutoTable.finalY + 10;
    };
    
    reports.forEach((report, index) => {
        if (index > 0) {
            doc.addPage();
        }
        currentY = 22;

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(`Report for: ${report.url}`, 14, currentY);
        currentY += 10;
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Scanned on: ${new Date(report.timestamp).toLocaleString()}`, 14, currentY);
        currentY += 12;

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text('Summary', 14, currentY);
        currentY += 6;
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`- Violations: ${report.violations.length}`, 14, currentY);
        currentY += 6;
        doc.text(`- Needs Review: ${report.incomplete.length}`, 14, currentY);
        currentY += 6;
        doc.text(`- Passes: ${report.passes.length}`, 14, currentY);
        currentY += 10;
        
        currentY = generateTable(`Violations (${report.violations.length})`, report.violations, currentY);
        currentY = generateTable(`Needs Review (${report.incomplete.length})`, report.incomplete, currentY);
        generateTable(`Passed Tests (${report.passes.length})`, report.passes, currentY);
    });

    doc.save(filename);
};

export const exportAllAsWord = (reports: AccessibilityReport[]) => {
    const filename = `${getBulkFilenameBase()}.docx`;

    const createIssuesTable = (issues: AccessibilityIssue[]): Paragraph | Table => {
        if (!issues || issues.length === 0) {
            return new Paragraph("None found in this category.");
        }
        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph({ text: "Impact", style: "strong" })], width: { size: 15, type: WidthType.PERCENTAGE } }),
                        new TableCell({ children: [new Paragraph({ text: "Description & Details", style: "strong" })], width: { size: 85, type: WidthType.PERCENTAGE } }),
                    ]
                }),
                ...issues.map(issue => new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(issue.impact)] }),
                        new TableCell({ children: [
                            new Paragraph({ text: issue.description, style: "strong" }),
                            new Paragraph(issue.help),
                            new Paragraph({ text: `Rule: ${issue.id} | ${issue.helpUrl}` }),
                            ...(issue.htmlElementSnippet ? [
                                new Paragraph({ text: "Snippet:", style: "strong" }), 
                                new Paragraph({ text: issue.htmlElementSnippet })
                            ] : [])
                        ]}),
                    ]
                }))
            ]
        });
    };
    
    const children: (Paragraph | Table)[] = [
        new Paragraph({ text: 'Aggregated Accessibility Report', heading: HeadingLevel.TITLE }),
        new Paragraph({ children: [new TextRun({ text: "Total pages scanned: ", bold: true }), new TextRun(String(reports.length))] }),
        new Paragraph({ children: [new TextRun({ text: "Generated on: ", bold: true }), new TextRun(new Date().toLocaleString())] }),
    ];

    reports.forEach((report, index) => {
        if(index > 0) {
           children.push(new Paragraph({ children: [new PageBreak()] }));
        }

        children.push(new Paragraph({ text: `Report for: ${report.url}`, heading: HeadingLevel.HEADING_1 }));
        children.push(new Paragraph({ children: [new TextRun({ text: "Scanned on: ", bold: true }), new TextRun(new Date(report.timestamp).toLocaleString())] }));
        children.push(new Paragraph({ text: 'Summary', heading: HeadingLevel.HEADING_2 }));
        children.push(new Paragraph(`- Violations: ${report.violations.length}`));
        children.push(new Paragraph(`- Needs Review: ${report.incomplete.length}`));
        children.push(new Paragraph(`- Passes: ${report.passes.length}`));
        children.push(new Paragraph(' '));
        
        children.push(new Paragraph({ text: `Violations (${report.violations.length})`, heading: HeadingLevel.HEADING_2 }));
        children.push(createIssuesTable(report.violations));
        children.push(new Paragraph(' '));
        
        children.push(new Paragraph({ text: `Needs Review (${report.incomplete.length})`, heading: HeadingLevel.HEADING_2 }));
        children.push(createIssuesTable(report.incomplete));
        children.push(new Paragraph(' '));

        children.push(new Paragraph({ text: `Passed Tests (${report.passes.length})`, heading: HeadingLevel.HEADING_2 }));
        children.push(createIssuesTable(report.passes));
    });


    const doc = new Document({
        styles: { paragraphStyles: [ { id: "strong", name: "Strong", run: { bold: true } } ] },
        sections: [{ children }],
    });
    
    Packer.toBlob(doc).then(blob => {
        downloadBlob(blob, filename);
    });
};