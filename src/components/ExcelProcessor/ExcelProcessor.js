import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, Eye, AlertCircle } from 'lucide-react';

const ExcelProcessor = () => {
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop().toLowerCase();
      if (['xlsx', 'xls', 'csv'].includes(fileType)) {
        setFile(selectedFile);
        setError('');
        setPreviewData(null);
      } else {
        setError('Please select a valid Excel file (.xlsx, .xls) or CSV file');
      }
    }
  };

  const processAndPreview = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('excel_file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/process-excel-preview/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setPreviewData(result);
    } catch (error) {
      console.error('Preview failed:', error);
      setError('Failed to process file: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const downloadProcessedFile = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setProcessing(true);
    setError('');

    const formData = new FormData();
    formData.append('excel_file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/process-excel-download/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        // 에러 응답 처리
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      // 파일 다운로드 처리
      const blob = await response.blob();
      const contentDisposition = response.headers.get('Content-Disposition');
      
      let filename = `modified_${file.name}`;
      
      if (contentDisposition) {
        // Content-Disposition에서 파일명 추출
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        } else if (contentDisposition.includes('filename=')) {
          // 간단한 파싱 시도
          const parts = contentDisposition.split('filename=');
          if (parts.length > 1) {
            filename = parts[1].replace(/['"]/g, '').trim();
          }
        }
      }

      // 파일 확장자 확인 및 기본값 설정
      if (!filename.includes('.')) {
        const originalExt = file.name.split('.').pop();
        filename = `${filename}.${originalExt}`;
      }

      // Blob URL 생성 및 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // 메모리 정리
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 100);

      // 성공 메시지 표시 (선택사항)
      console.log('File downloaded successfully:', filename);

    } catch (error) {
      console.error('Download failed:', error);
      setError('Failed to download file: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const renderDataTable = (data, title) => {
    if (!data || data.length === 0) return null;

    const columns = Object.keys(data[0]);

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">{title}</h3>
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column, index) => (
                  <th
                    key={column}
                    className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                      index === 5 ? 'bg-blue-50' : ''
                    }`}
                  >
                    {column} {index === 5 && <span className="text-blue-600">(+50 from row 6)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td
                      key={`${rowIndex}-${column}`}
                      className={`px-4 py-3 text-sm text-gray-900 ${
                        colIndex === 5 && rowIndex >= 5 ? 'bg-blue-50 font-semibold' : 
                        colIndex === 5 && rowIndex < 5 ? 'bg-gray-100' : ''
                      }`}
                    >
                      {row[column] !== null ? row[column].toString() : '-'}
                      {colIndex === 5 && rowIndex < 5 && (
                        <span className="ml-1 text-xs text-gray-500">(unchanged)</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">최저가 검색 적용</h1>
        <p className="text-gray-600">네이버에서 검색한 최저가를 업로드한 엑셀 파일에 적용합니다.</p>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          확장자 (.xlsx, .xls, .csv)
        </label>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".xlsx,.xls,.csv"
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <div className="flex items-center text-sm text-green-600">
              <FileSpreadsheet className="w-4 h-4 mr-1" />
              {file.name}
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={processAndPreview}
          disabled={!file || processing}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Eye className="w-4 h-4 mr-2" />
          {processing ? 'Processing...' : 'Preview Changes'}
        </button>

        <button
          onClick={downloadProcessedFile}
          disabled={!file || processing}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4 mr-2" />
          {processing ? 'Processing...' : 'Download Processed File'}
        </button>
      </div>

      {/* Preview Data */}
      {previewData && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Processing Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-blue-600 font-medium">Total Rows:</span>
                <p className="text-blue-800">{previewData.total_rows}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Modified Column:</span>
                <p className="text-blue-800">{previewData.column_modified}</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Operation:</span>
                <p className="text-blue-800">Add +50</p>
              </div>
              <div>
                <span className="text-blue-600 font-medium">Status:</span>
                <p className="text-green-600 font-semibold">✓ Ready</p>
              </div>
            </div>
          </div>

          {/* Original Data Preview */}
          {renderDataTable(previewData.original_sample, 'Original Data (First 5 rows)')}

          {/* Modified Data Preview */}
          {renderDataTable(previewData.modified_sample, 'Modified Data (First 5 rows)')}

          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-yellow-800">
              <strong>Note:</strong> Column 6 values from row 6 onwards have been increased by 50. 
              Rows 1-5 in column 6 remain unchanged.
              Click "Download Processed File" to get the modified file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelProcessor;