import * as XLSX from 'xlsx';

export interface ExportOptions {
  sheetName?: string;
  columnMapping?: Record<string, string>;
  visibleColumns?: Array<{ field: string; headerName: string }>;
  columnWidth?: number;
  includeDate?: boolean;
}

/**
 * Generic Export to Excel utility function
 * 
 * @param data - Array of data to export
 * @param filename - Base filename (without extension)
 * @param options - Export configuration options
 * @returns boolean - Success/failure status
 * 
 * @example
 * // Simple usage
 * exportToExcel(data, 'MyReport');
 * 
 * @example
 * // Advanced usage with custom columns
 * exportToExcel(data, 'MyReport', {
 *   sheetName: 'Data Sheet',
 *   visibleColumns: [{ field: 'name', headerName: 'Name' }],
 *   columnMapping: { name: 'Full Name' },
 *   columnWidth: 25,
 *   includeDate: false
 * });
 */
export const exportToExcel = (
  data: any[], 
  filename: string, 
  options: ExportOptions = {}
): boolean => {
  try {
    const {
      sheetName = 'Data',
      columnMapping = {},
      visibleColumns,
      columnWidth = 20,
      includeDate = true
    } = options;

    let exportData: any[];
    let headers: string[];

    if (visibleColumns && Object.keys(columnMapping).length > 0) {
      // Use provided column configuration
      headers = visibleColumns.map(col => columnMapping[col.field] || col.headerName);
      exportData = data.map(row => {
        const exportRow: any = {};
        visibleColumns.forEach(col => {
          const headerName = columnMapping[col.field] || col.headerName;
          exportRow[headerName] = row[col.field] || '';
        });
        return exportRow;
      });
    } else if (visibleColumns) {
      // Use visible columns without mapping
      headers = visibleColumns.map(col => col.headerName);
      exportData = data.map(row => {
        const exportRow: any = {};
        visibleColumns.forEach(col => {
          exportRow[col.headerName] = row[col.field] || '';
        });
        return exportRow;
      });
    } else {
      // Auto-generate from data
      exportData = data;
      headers = data.length > 0 ? Object.keys(data[0]) : [];
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    const colWidths = headers.map(() => ({ wch: columnWidth }));
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0];
    const fullFilename = includeDate ? `${filename}_${currentDate}.xlsx` : `${filename}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fullFilename);

    return true;
  } catch (error) {
    console.error('Export to Excel failed:', error);
    return false;
  }
};

/**
 * Export simple data array to Excel with auto-generated headers
 * 
 * @param data - Array of objects to export
 * @param filename - Filename without extension
 * @param sheetName - Optional sheet name
 * @returns boolean - Success/failure status
 */
export const exportSimpleToExcel = (
  data: any[], 
  filename: string, 
  sheetName: string = 'Data'
): boolean => {
  return exportToExcel(data, filename, { 
    sheetName, 
    includeDate: true 
  });
};

/**
 * Export data with custom column selection and headers
 * 
 * @param data - Array of objects to export  
 * @param filename - Filename without extension
 * @param columns - Array of column definitions
 * @param options - Additional export options
 * @returns boolean - Success/failure status
 */
export const exportCustomColumnsToExcel = (
  data: any[],
  filename: string,
  columns: Array<{ field: string; headerName: string; displayName?: string }>,
  options: Omit<ExportOptions, 'visibleColumns' | 'columnMapping'> = {}
): boolean => {
  const visibleColumns = columns.map(col => ({
    field: col.field,
    headerName: col.headerName
  }));

  const columnMapping = columns.reduce((mapping, col) => {
    mapping[col.field] = col.displayName || col.headerName;
    return mapping;
  }, {} as Record<string, string>);

  return exportToExcel(data, filename, {
    ...options,
    visibleColumns,
    columnMapping
  });
};

/**
 * Export complex report data with multiple sections to Excel
 * 
 * @param sections - Array of sections with data
 * @param filename - Filename without extension  
 * @param options - Export options
 * @returns boolean - Success/failure status
 * 
 * @example
 * exportComplexReportToExcel([
 *   { type: 'info', title: 'Report Info', data: [['Key', 'Value'], ['Date', '2025-01-01']] },
 *   { type: 'table', title: 'Main Data', headers: ['Name', 'Age'], data: [['John', 30]] },
 *   { type: 'summary', title: 'Total', data: [['', 'Total: 1']] }
 * ], 'ComplexReport');
 */
export const exportComplexReportToExcel = (
  sections: Array<{
    type: 'info' | 'table' | 'summary';
    title?: string;
    headers?: string[];
    data: any[][];
  }>,
  filename: string,
  options: Omit<ExportOptions, 'visibleColumns' | 'columnMapping'> = {}
): boolean => {
  try {
    const {
      sheetName = 'Report',
      columnWidth = 20,
      includeDate = true
    } = options;

    // Combine all sections into one data array
    const allData: any[][] = [];
    
    sections.forEach((section, index) => {
      // Add section title if provided
      if (section.title) {
        allData.push([section.title]);
        allData.push([]); // Empty row for spacing
      }
      
      // Add headers for table sections
      if (section.type === 'table' && section.headers) {
        allData.push(section.headers);
      }
      
      // Add section data
      allData.push(...section.data);
      
      // Add spacing between sections (except last)
      if (index < sections.length - 1) {
        allData.push([]);
      }
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set column widths (auto-detect or use provided width)
    const maxCols = Math.max(...allData.map(row => row.length));
    const colWidths = Array(maxCols).fill({ wch: columnWidth });
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Generate filename
    const currentDate = new Date().toISOString().split('T')[0];
    const fullFilename = includeDate ? `${filename}_${currentDate}.xlsx` : `${filename}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fullFilename);

    return true;
  } catch (error) {
    console.error('Export complex report to Excel failed:', error);
    return false;
  }
};

/**
 * Export Asset Transfer Report with custom column widths and formatting
 * 
 * @param transferFormData - Transfer form information
 * @param assetData - Array of asset data
 * @param totalsData - Totals row data
 * @param options - Export options
 * @returns boolean - Success/failure status
 */
export const exportAssetTransferReportToExcel = (
  transferFormData: any,
  assetData: any[][],
  totalsData: any[],
  options: {
    assetHeaders?: string[];
    columnWidths?: Array<{ wch: number }>;
    filename?: string;
  } = {}
): boolean => {
  try {
    const {
      assetHeaders = [
        'From Cost Center', 'From Location', 'To Cost Center', 'To Location',
        'Oracle Asset No.', 'Asset Barcode', 'Asset Description', 'Life Year',
        'Start Date', 'Transfer Date', 'Units', 'Asset Cost', 'NBV',
        'Oracle Category', 'Remark', 'Transfer vs NBV', 'Transfer Report', 'Transfer vs FBDI'
      ],
      columnWidths = [
        { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 },
        { wch: 30 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 8 }, { wch: 18 },
        { wch: 18 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 18 }, { wch: 15 }
      ],
      filename = `Asset_Transfer_Report_${transferFormData?.transferFormId || 'Report'}`
    } = options;

    // Prepare sections
    const sections = [
      {
        type: 'info' as const,
        title: 'Transfer Form Information',
        data: [
          ['Transfer Form ID:', transferFormData?.transferFormId || 'N/A'],
          ['Location From:', transferFormData?.locationFrom || 'N/A'],
          ['Location To:', transferFormData?.locationTo || 'N/A'],
          ['Project Name:', transferFormData?.projectName || 'N/A'],
          ['Status:', transferFormData?.status || 'N/A'],
          ['Owner:', transferFormData?.owner || 'N/A'],
          ['Request Date:', transferFormData?.requestDate || 'N/A'],
          ['Requester:', transferFormData?.requester || 'N/A']
        ]
      },
      {
        type: 'table' as const,
        title: 'Asset Transfer Report',
        headers: assetHeaders,
        data: [...assetData, ['Grand Total', ...totalsData.slice(1)]]
      }
    ];

    // Use complex report export but with custom column widths
    const allData: any[][] = [];
    
    sections.forEach((section, index) => {
      if (section.title) {
        allData.push([section.title]);
        allData.push([]);
      }
      
      if (section.type === 'table' && section.headers) {
        allData.push(section.headers);
      }
      
      allData.push(...section.data);
      
      if (index < sections.length - 1) {
        allData.push([]);
      }
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(allData);

    // Set custom column widths
    ws['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Asset Transfer Report');

    // Generate filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${currentDate}.xlsx`;

    // Save file
    XLSX.writeFile(wb, fullFilename);

    return true;
  } catch (error) {
    console.error('Export Asset Transfer Report to Excel failed:', error);
    return false;
  }
};

export default exportToExcel;