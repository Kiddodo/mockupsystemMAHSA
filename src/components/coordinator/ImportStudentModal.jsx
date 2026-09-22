import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, Upload, Download, FileSpreadsheet, CheckCircle, 
  AlertCircle, FileText, RefreshCw, Check, ChevronDown
} from 'lucide-react';
import * as XLSX from 'xlsx';

const SAMPLE_CSV_CONTENT = `id,name,program,cgpa,credits,company,lecturer,financeCleared,facultyApproved
24-DHRM-0451,Nurul Ain Binti Roslan,DHRM,3.55,68,Sunway Resort Hotel,Dr. Rahman,true,true
24-DBA-0120,Kevin Tan Jun Wei,DBA,3.25,62,PwC Malaysia,Dr. Lee,false,true
24-BBA-0092,Ahmad Daniel Bin Zulkifli,BBA,3.70,70,Maybank Berhad,Dr. Rahman,true,false
24-DHRM-0489,Kavitha A/P Subramaniam,DHRM,3.40,64,Petronas Dagangan,Dr. Rahman,true,true`;

export const ImportStudentModal = ({ isOpen, onClose }) => {
  const { students, importStudents } = useApp();
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'paste'
  const [csvText, setCsvText] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [parseError, setParseError] = useState('');
  const [fileName, setFileName] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Excel-specific state
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [workbookRef, setWorkbookRef] = useState(null);
  const [isExcelFile, setIsExcelFile] = useState(false);

  if (!isOpen) return null;

  // Helper to split a CSV line by comma while preserving quoted values
  const splitLine = (rowStr) => {
    const result = [];
    let curr = '';
    let inQuotes = false;
    for (let i = 0; i < rowStr.length; i++) {
      const char = rowStr[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(curr.trim());
        curr = '';
      } else {
        curr += char;
      }
    }
    result.push(curr.trim());
    return result.map(val => val.replace(/^"|"$/g, '').trim());
  };

  // Core parser that converts rows (array of arrays) into student records
  const parseRows = (rows) => {
    try {
      setParseError('');

      if (!rows || rows.length < 2) {
        setParseError('Data must have at least a header row and 1 data row.');
        setParsedData([]);
        return;
      }

      // Find the header row by scanning for a row containing 'student id' or 'student name'
      let headerRowIndex = 0;
      for (let i = 0; i < rows.length; i++) {
        const rowText = rows[i].map(c => String(c || '')).join(' ').toLowerCase();
        if (rowText.includes('student id') || rowText.includes('student name')) {
          headerRowIndex = i;
          break;
        }
      }

      const headers = rows[headerRowIndex].map(h => String(h || '').toLowerCase().replace(/[\s_-]+/g, ''));

      // Column alias matching
      const getField = (rowValues, ...aliases) => {
        for (const alias of aliases) {
          const idx = headers.findIndex(h => h === alias || h.includes(alias));
          if (idx !== -1 && rowValues[idx] !== undefined) {
            return String(rowValues[idx] || '').trim();
          }
        }
        return '';
      };

      const parsedRows = [];
      for (let i = headerRowIndex + 1; i < rows.length; i++) {
        const values = rows[i].map(c => String(c || '').trim());
        if (values.length === 0 || values.every(v => !v)) continue;

        const id = getField(values, 'studentid', 'id', 'matric', 'matricid');
        const name = getField(values, 'studentname', 'name', 'fullname');
        
        let program = getField(values, 'program', 'programme', 'course').toUpperCase();
        if (!program && id) {
          const match = id.match(/^[A-Z]+/i);
          if (match) program = match[0].toUpperCase();
          else program = 'DHRM';
        }

        const cgpa = parseFloat(getField(values, 'cgpa', 'gpa')) || 3.00;
        const credits = parseInt(getField(values, 'credits', 'credithours'), 10) || 60;
        const company = getField(values, 'companyname', 'company', 'hostcompany') || 'Pending Placement';
        const lecturer = getField(values, 'supervisorname', 'lecturer', 'supervisor', 'academicsupervisor') || 'Dr. Rahman';
        
        const rawFinance = getField(values, 'financialstatus', 'financecleared', 'finance', 'bursary').toLowerCase();
        const financeCleared = rawFinance === 'true' || rawFinance === '1' || rawFinance === 'yes' || rawFinance === 'cleared';
        
        const rawFaculty = getField(values, 'internletterrelease', 'facultyapproved', 'faculty', 'facultyclearance').toLowerCase();
        const facultyApproved = rawFaculty === 'true' || rawFaculty === '1' || rawFaculty === 'yes' || rawFaculty === 'approved' || rawFaculty === 'conditionalrelease' || rawFaculty === 'conditional release';

        if (id && name) {
          const isExisting = students.some(s => s.id.toLowerCase() === id.toLowerCase());
          parsedRows.push({
            id,
            name,
            program,
            cgpa,
            credits,
            company,
            lecturer,
            financeCleared,
            facultyApproved,
            isExisting
          });
        }
      }

      if (parsedRows.length === 0) {
        setParseError('No valid student records found. Ensure rows have "Student ID" and "Student Name" columns.');
      } else {
        setParsedData(parsedRows);
      }
    } catch (err) {
      setParseError('Error parsing data. Please check formatting.');
      setParsedData([]);
    }
  };

  // Parse CSV text into rows, then use the core parser
  const parseCSV = (text) => {
    const cleanText = text.trim();
    if (!cleanText) {
      setParsedData([]);
      setParseError('');
      return;
    }
    const lines = cleanText.split(/\r?\n/).filter(line => line.trim().length > 0);
    const rows = lines.map(line => splitLine(line));
    parseRows(rows);
  };

  // Parse an Excel sheet into rows, then use the core parser
  const parseExcelSheet = (workbook, sheetName) => {
    try {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) {
        setParseError(`Sheet "${sheetName}" not found.`);
        setParsedData([]);
        return;
      }
      // Convert sheet to array of arrays (each row is an array of cell values)
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      // Filter out completely empty rows
      const nonEmptyRows = rows.filter(row => row.some(cell => String(cell || '').trim() !== ''));
      if (nonEmptyRows.length < 2) {
        setParseError(`Sheet "${sheetName}" has no data rows.`);
        setParsedData([]);
        return;
      }
      parseRows(nonEmptyRows);
    } catch (err) {
      setParseError('Error reading Excel sheet. Please check the file.');
      setParsedData([]);
    }
  };

  // Detect file type and handle accordingly
  const processFile = (file) => {
    const name = file.name.toLowerCase();
    const isExcel = name.endsWith('.xlsx') || name.endsWith('.xls');

    setFileName(file.name);
    setParsedData([]);
    setParseError('');
    setSheetNames([]);
    setSelectedSheet('');
    setWorkbookRef(null);
    setIsExcelFile(isExcel);

    if (isExcel) {
      // Read as binary for Excel
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheets = workbook.SheetNames;
          setWorkbookRef(workbook);
          setSheetNames(sheets);
          if (sheets.length === 1) {
            // Auto-select if only one sheet
            setSelectedSheet(sheets[0]);
            parseExcelSheet(workbook, sheets[0]);
          } else {
            setSelectedSheet('');
            setParseError(`Excel file has ${sheets.length} sheets. Please select a sheet to import.`);
          }
        } catch (err) {
          setParseError('Failed to read Excel file. Make sure it is a valid .xlsx or .xls file.');
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // Read as text for CSV
      setIsExcelFile(false);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          setCsvText(content);
          parseCSV(content);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSheetChange = (sheetName) => {
    setSelectedSheet(sheetName);
    setParsedData([]);
    setParseError('');
    if (workbookRef && sheetName) {
      parseExcelSheet(workbookRef, sheetName);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processFile(file);
  };

  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'mahsa_student_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadDemoData = () => {
    setFileName('mahsa_demo_candidates.csv');
    setCsvText(SAMPLE_CSV_CONTENT);
    setIsExcelFile(false);
    setSheetNames([]);
    setSelectedSheet('');
    setWorkbookRef(null);
    parseCSV(SAMPLE_CSV_CONTENT);
  };

  const handleConfirmImport = () => {
    if (parsedData.length === 0) return;
    importStudents(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-[#003DA5] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet size={18} />
            <h3 className="font-bold text-base">Import Student Data</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection & Actions */}
        <div className="px-5 pt-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 bg-slate-50">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 text-sm font-semibold border-b-2 transition ${
                activeTab === 'upload' 
                  ? 'border-[#003DA5] text-[#003DA5]' 
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`px-3 py-1.5 text-sm font-semibold border-b-2 transition ${
                activeTab === 'paste' 
                  ? 'border-[#003DA5] text-[#003DA5]' 
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              Paste CSV Text
            </button>
          </div>

          <div className="flex items-center space-x-2 pb-2 sm:pb-0">
            <button
              onClick={handleLoadDemoData}
              className="px-2.5 py-1 text-xs font-semibold bg-blue-50 text-[#003DA5] hover:bg-blue-100 rounded border border-blue-200 flex items-center gap-1 transition"
              title="Autofill with 4 demo candidates"
            >
              <RefreshCw size={12} />
              <span>Load Demo Data</span>
            </button>
            <button
              onClick={handleDownloadTemplate}
              className="px-2.5 py-1 text-xs font-semibold bg-white text-slate-700 hover:bg-slate-100 rounded border border-slate-300 flex items-center gap-1 transition"
              title="Download CSV format template"
            >
              <Download size={12} />
              <span>Download Template</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Upload Area */}
          {activeTab === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition ${
                  dragActive 
                    ? 'border-[#003DA5] bg-blue-50/50' 
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                }`}
              >
                <Upload size={28} className="mx-auto text-[#003DA5] mb-2" />
                <p className="font-semibold text-sm text-slate-800">
                  {fileName ? `Selected: ${fileName}` : 'Click to select file or drag and drop here'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports <strong>.csv</strong> and <strong>.xlsx / .xls</strong> (Excel) files
                </p>
              </div>

              {/* Sheet Selector for Excel files */}
              {isExcelFile && sheetNames.length > 1 && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                    <FileSpreadsheet size={13} className="text-[#003DA5]" />
                    Select Sheet to Import ({sheetNames.length} sheets found)
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSheet}
                      onChange={(e) => handleSheetChange(e.target.value)}
                      className="w-full p-2 pr-8 bg-white border border-blue-300 rounded text-sm font-medium text-slate-800 focus:outline-none focus:border-[#003DA5] appearance-none cursor-pointer"
                    >
                      <option value="">-- Choose a sheet --</option>
                      {sheetNames.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Single sheet auto-selected indicator */}
              {isExcelFile && sheetNames.length === 1 && (
                <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs text-emerald-700 font-medium">
                  <CheckCircle size={14} />
                  <span>Sheet "<strong>{sheetNames[0]}</strong>" auto-selected (only 1 sheet found)</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Paste Raw CSV Text (including header row)
              </label>
              <textarea
                rows={5}
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  parseCSV(e.target.value);
                }}
                placeholder={`id,name,program,cgpa,credits,company,lecturer,financeCleared,facultyApproved\n24-DHRM-0999,Nur Farah,DHRM,3.45,64,Sunway Resort,Dr. Rahman,true,true`}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded font-mono text-xs text-slate-800 focus:outline-none focus:border-[#003DA5]"
              />
            </div>
          )}

          {/* Validation Alert */}
          {parseError && (
            <div className={`p-3 rounded text-xs flex items-center gap-2 ${
              parseError.includes('select a sheet')
                ? 'bg-blue-50 border border-blue-200 text-blue-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <AlertCircle size={15} />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Records Preview */}
          {parsedData.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <CheckCircle size={15} className="text-emerald-600" />
                  <span>Preview Records Ready to Insert ({parsedData.length})</span>
                </h4>
                <div className="text-xs text-slate-500 space-x-2">
                  <span>New: <strong className="text-emerald-700">{parsedData.filter(d => !d.isExisting).length}</strong></span>
                  <span>Update: <strong className="text-blue-700">{parsedData.filter(d => d.isExisting).length}</strong></span>
                </div>
              </div>

              <div className="border border-slate-200 rounded overflow-hidden max-h-48 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="p-2">Status</th>
                      <th className="p-2">Matric ID</th>
                      <th className="p-2">Student Name</th>
                      <th className="p-2">Prog</th>
                      <th className="p-2">CGPA</th>
                      <th className="p-2">Host Company</th>
                      <th className="p-2">Finance</th>
                      <th className="p-2">Faculty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {parsedData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2">
                          <span className={`px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                            row.isExisting 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {row.isExisting ? 'Update' : 'New'}
                          </span>
                        </td>
                        <td className="p-2 font-mono font-medium text-slate-700">{row.id}</td>
                        <td className="p-2 font-semibold text-slate-800">{row.name}</td>
                        <td className="p-2">{row.program}</td>
                        <td className="p-2 font-mono">{row.cgpa}</td>
                        <td className="p-2 text-slate-600 truncate max-w-[120px]">{row.company}</td>
                        <td className="p-2 text-center">
                          {row.financeCleared ? (
                            <span className="text-emerald-600 font-semibold">Yes</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">No</span>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          {row.facultyApproved ? (
                            <span className="text-emerald-600 font-semibold">Yes</span>
                          ) : (
                            <span className="text-amber-600 font-semibold">No</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition"
          >
            Cancel
          </button>
          
          <button
            disabled={parsedData.length === 0}
            onClick={handleConfirmImport}
            className="bg-[#003DA5] hover:bg-[#002d7a] disabled:opacity-50 text-white px-5 py-2 text-sm font-semibold rounded flex items-center gap-1.5 transition"
          >
            <Check size={16} />
            <span>Insert {parsedData.length} Students</span>
          </button>
        </div>
      </div>
    </div>
  );
};
