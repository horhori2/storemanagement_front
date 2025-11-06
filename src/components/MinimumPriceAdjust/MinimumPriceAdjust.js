import React, { useState, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Container,
  Alert,
  CircularProgress,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  ExpandMore,
  Edit,
  Save,
  Cancel,
  CheckCircle,
  Download,
  TrendingUp,
  TrendingDown,
  Sort
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { API_BASE_URL } from '../../config/api';

// ===============================
// 상수 및 유틸리티 함수
// ===============================

const EXCEL_CONFIG = {
  VALID_TYPES: [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ],
  VALID_EXTENSIONS: ['.xlsx', '.xls', '.csv'],
  COLUMNS: {
    PRODUCT_NAME: 3, // D열 (0-indexed)
    PRICE: 5,        // F열
    STOCK: 7,        // H열
    IMAGE: 20        // U열
  },
  START_ROW: 5,      // 6행부터 시작 (0-indexed로 5) - 원래대로 복원!
  MAX_EMPTY_ROWS: 2,
  MAX_SCAN_ROWS: 50000
};

/**
 * 상품 데이터 객체 생성
 */
const createProduct = (productName = '', price = 0, stock = 0, image = '', isModified = false, originalRowIndex = null, originalPrice = null, priceChange = null) => ({
  productName,
  price,
  stock,
  image,
  isModified,
  originalRowIndex,
  originalPrice, // 최저가 검색 전 원본 가격
  priceChange    // 가격 변경 정보 (+1000원, -500원 등)
});

/**
 * 업로드된 파일 검증
 */
const validateFile = (file) => {
  if (!file) return { isValid: false, error: '파일이 선택되지 않았습니다.' };
  
  const fileName = file.name.toLowerCase();
  const hasValidType = EXCEL_CONFIG.VALID_TYPES.includes(file.type);
  const hasValidExtension = EXCEL_CONFIG.VALID_EXTENSIONS.some(ext => fileName.endsWith(ext));
  
  if (!hasValidType && !hasValidExtension) {
    return { 
      isValid: false, 
      error: 'Excel 파일(.xlsx, .xls) 또는 CSV 파일만 업로드할 수 있습니다.' 
    };
  }
  
  return { isValid: true };
};

/**
 * 워크시트에 수정된 데이터 반영
 */
const updateWorksheetWithModifiedData = (originalWorksheet, modifiedData) => {
  console.log('=== 워크시트 업데이트 시작 ===');
  console.log('원본 워크시트 정보:', originalWorksheet['!ref']);
  console.log('수정할 데이터 개수:', modifiedData.filter(p => p.isModified).length);
  
  // 원본 워크시트의 모든 키 확인
  const originalKeys = Object.keys(originalWorksheet);
  console.log('원본 워크시트 셀 개수:', originalKeys.filter(key => !key.startsWith('!')).length);
  
  // 원본 워크시트 깊은 복사
  const newWorksheet = {};
  
  // 모든 셀과 메타데이터를 복사
  originalKeys.forEach(key => {
    if (key.startsWith('!')) {
      // 워크시트 메타데이터 복사
      newWorksheet[key] = originalWorksheet[key];
    } else {
      // 셀 데이터 복사
      newWorksheet[key] = { 
        ...originalWorksheet[key],
        v: originalWorksheet[key].v,
        t: originalWorksheet[key].t,
        w: originalWorksheet[key].w
      };
    }
  });
  
  console.log('복사된 워크시트 셀 개수:', Object.keys(newWorksheet).filter(key => !key.startsWith('!')).length);
  
  // 수정된 데이터를 워크시트에 반영
  modifiedData.forEach((product, arrayIndex) => {
    if (product.isModified && product.originalRowIndex !== null) {
      const rowIndex = product.originalRowIndex;
      
      console.log(`=== 상품 ${arrayIndex + 1} 업데이트 ===`);
      console.log(`상품명: ${product.productName}`);
      console.log(`원본 행: ${rowIndex + 1} (0-based: ${rowIndex})`);
      console.log(`업데이트할 가격: ${product.price}`);
      console.log(`업데이트할 재고: ${product.stock}`);
      
      // 가격 업데이트 (F열 = 인덱스 5)
      const priceCell = XLSX.utils.encode_cell({ r: rowIndex, c: EXCEL_CONFIG.COLUMNS.PRICE });
      const originalPriceCell = originalWorksheet[priceCell];
      
      console.log(`가격 셀 주소: ${priceCell}`);
      console.log('원본 가격 셀:', originalPriceCell);
      
      // 원본 셀의 형식 정보를 유지하면서 값만 변경
      newWorksheet[priceCell] = {
        ...originalPriceCell, // 원본 셀의 모든 속성 유지
        v: Number(product.price) || 0,
        w: undefined // Excel이 자동으로 포맷하도록
      };
      
      console.log('업데이트된 가격 셀:', newWorksheet[priceCell]);
      
      // 재고 업데이트 (H열 = 인덱스 7)
      const stockCell = XLSX.utils.encode_cell({ r: rowIndex, c: EXCEL_CONFIG.COLUMNS.STOCK });
      const originalStockCell = originalWorksheet[stockCell];
      
      console.log(`재고 셀 주소: ${stockCell}`);
      console.log('원본 재고 셀:', originalStockCell);
      
      // 원본 셀의 형식 정보를 유지하면서 값만 변경
      newWorksheet[stockCell] = {
        ...originalStockCell, // 원본 셀의 모든 속성 유지
        v: Number(product.stock) || 0,
        w: undefined // Excel이 자동으로 포맷하도록
      };
      
      console.log('업데이트된 재고 셀:', newWorksheet[stockCell]);
    }
  });
  
  // 중요: 워크시트 범위 재계산 및 강제 설정
  console.log('=== 워크시트 범위 재계산 시작 ===');
  console.log('원본 범위:', originalWorksheet['!ref']);
  
  // 기존 범위를 유지하되, 필요시 확장
  const originalRange = XLSX.utils.decode_range(originalWorksheet['!ref']);
  console.log('원본 범위 디코드:', originalRange);
  
  // 새로운 워크시트의 범위를 원본과 동일하게 설정
  newWorksheet['!ref'] = originalWorksheet['!ref'];
  
  // 추가적으로 범위를 다시 계산하여 설정 (이중 보장)
  const range = XLSX.utils.encode_range(originalRange);
  newWorksheet['!ref'] = range;
  
  console.log('최종 설정된 범위:', newWorksheet['!ref']);
  console.log('=== 워크시트 업데이트 완료 ===');
  console.log('최종 워크시트 셀 개수:', Object.keys(newWorksheet).filter(key => !key.startsWith('!')).length);
  
  return newWorksheet;
};

/**
 * Django 백엔드로 수정된 데이터 전송 및 파일 다운로드 (원본 파일 직접 전송)
 */
const downloadModifiedExcel = async (originalWorkbook, modifiedData, originalFileName, originalFile) => {

  try {
    console.log('=== Django 백엔드로 파일 처리 요청 ===');
    
    // 수정된 데이터만 필터링
    const modifiedItems = modifiedData.filter(p => p.isModified).map(product => ({
      originalRowIndex: product.originalRowIndex,
      productName: product.productName,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      excelRow: product.originalRowIndex + 1,
      filterInfo: product.filterInfo || "",           // ⭐ 추가
      validCount: product.validItemsCount || 0,       // ⭐ 추가
      searchKeyword: product.searchKeyword || ""      // ⭐ 추가
    }));

    
    console.log('백엔드로 전송할 수정 데이터:', modifiedItems);
    
    if (modifiedItems.length === 0) {
      console.warn('수정된 데이터가 없습니다.');
      return false;
    }
    
    if (!originalFile) {
      console.error('원본 파일이 없습니다.');
      return false;
    }
    
    console.log('원본 파일 정보:', {
      name: originalFile.name,
      size: originalFile.size,
      type: originalFile.type,
      lastModified: new Date(originalFile.lastModified)
    });
    
    // FormData 생성
    const formData = new FormData();
    
    // 원본 파일을 직접 전송 (SheetJS 변환 없이)
    formData.append('excel_file', originalFile, originalFile.name);
    formData.append('modifications', JSON.stringify(modifiedItems));
    formData.append('original_filename', originalFile.name);
    
    console.log('FormData 준비 완료 - 원본 파일 직접 전송');
    console.log('수정 항목 개수:', modifiedItems.length);
    console.log('원본 파일 크기:', originalFile.size, 'bytes');
    
    // Django API 호출 (타임아웃 설정)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃 (파일이 클 수 있으므로)
    
    let response;
    try {
        response = await fetch(`${API_BASE_URL}/download-excel/`, {
        method: 'POST',
        body: formData,
        headers: {
          'X-CSRFToken': getCsrfToken(),
        },
        signal: controller.signal
      });

      
      clearTimeout(timeoutId);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('요청 시간이 초과되었습니다. 파일이 너무 크거나 서버 응답이 느립니다.');
      }
      throw error;
    }
    
    // 응답 상태 확인
    console.log('서버 응답 상태:', response.status);
    console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      let errorMessage;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || `서버 에러: ${response.status}`;
      } else {
        const errorText = await response.text();
        errorMessage = `서버 에러: ${response.status} ${errorText}`;
      }
      
      console.error('Django API 에러:', response.status, errorMessage);
      throw new Error(errorMessage);
    }
    
    console.log('Django에서 파일 처리 완료, 다운로드 시작...');
    
    // 응답을 Blob으로 받아서 다운로드
    const responseBlob = await response.blob();
    console.log('받은 응답 Blob 크기:', responseBlob.size, 'bytes');
    console.log('응답 Blob 타입:', responseBlob.type);
    
    // 파일 크기 검증
    if (responseBlob.size === 0) {
      throw new Error('서버에서 받은 파일의 크기가 0입니다.');
    }
    
    // Content-Disposition 헤더에서 파일명 추출 (옵션)
    let downloadFileName = originalFile.name.replace(/\.[^/.]+$/, '') + '_modified.xlsx';
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch) {
        downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
      }
    }
    
    // 파일 다운로드 실행
    const url = window.URL.createObjectURL(responseBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName;
    
    // 브라우저 호환성을 위한 추가 속성
    link.style.display = 'none';
    link.rel = 'noopener';
    
    document.body.appendChild(link);
    link.click();
    
    // 정리
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    console.log('=== 파일 다운로드 완료 ===');
    console.log('다운로드된 파일명:', downloadFileName);
    console.log('파일 크기:', responseBlob.size, 'bytes');
    
    return true;
    
  } catch (error) {
    console.error('=== Django 백엔드 처리 에러 ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    return false;
  }
};

/**
 * CSRF 토큰 가져오기 (Django CSRF 보호가 활성화된 경우)
 */
const getCsrfToken = () => {
  const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value ||
                   document.querySelector('meta[name="csrf-token"]')?.content ||
                   getCookie('csrftoken');
  return csrfToken || '';
};

/**
 * 쿠키에서 값 가져오기
 */
const getCookie = (name) => {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
};

// 수정된 extractDataFromWorksheet 함수
const extractDataFromWorksheet = (worksheet) => {
  if (!worksheet['!ref']) return [];
  
  const extractedData = [];
  
  console.log('=== 데이터 추출 시작 ===');
  console.log('워크시트 범위:', worksheet['!ref']);
  
  // 워크시트 범위 분석
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  console.log('워크시트 범위 상세:', {
    startRow: range.s.r,
    endRow: range.e.r,
    startCol: range.s.c,
    endCol: range.e.c,
    totalRows: range.e.r + 1,
    totalCols: range.e.c + 1
  });
  
  // row 6부터 시작 (0-based로 5부터)
  const startRow = 5; // Excel row 6
  
  // 워크시트의 실제 범위를 기준으로 하되, 최소한 충분히 스캔
  // 워크시트 범위가 작으면 (row 5가 비어있어서) 강제로 더 많이 스캔
  let maxScanRow;
  if (range.e.r < 100) {
    // 워크시트 범위가 작으면 강제로 1000행까지 스캔
    maxScanRow = 1000;
    console.log(`⚠️ 워크시트 범위가 작음 (${range.e.r + 1}행). 강제로 1000행까지 스캔`);
  } else {
    // 워크시트 범위가 충분하면 그 범위 + 여유분으로 스캔
    maxScanRow = Math.min(range.e.r + 100, 5000); // 최대 5000행까지
    console.log(`워크시트 범위 기반 스캔: ${maxScanRow}행까지`);
  }
  
  console.log(`=== Row 6부터 데이터 스캔 시작 ===`);
  console.log(`스캔 범위: Excel 행 ${startRow + 1}부터 ${maxScanRow}까지`);
  
  // row 1-5 상태 확인 (참고용)
  console.log('Row 1-5 상태 (스캔 제외):');
  for (let i = 0; i < 5; i++) {
    const sampleD = worksheet[XLSX.utils.encode_cell({ r: i, c: 3 })]?.v;
    console.log(`  Excel 행 ${i + 1}: D='${sampleD}' (헤더/구분선)`);
  }
  
  // row 6부터 실제 상품 데이터 스캔
  let foundCount = 0;
  let consecutiveEmptyRows = 0;
  const MAX_EMPTY_ROWS = 20; // 연속 빈 행 허용 개수
  
  for (let scanRow = startRow; scanRow <= maxScanRow; scanRow++) {
    const cells = {
      productName: worksheet[XLSX.utils.encode_cell({ r: scanRow, c: EXCEL_CONFIG.COLUMNS.PRODUCT_NAME })]?.v,
      price: worksheet[XLSX.utils.encode_cell({ r: scanRow, c: EXCEL_CONFIG.COLUMNS.PRICE })]?.v,
      stock: worksheet[XLSX.utils.encode_cell({ r: scanRow, c: EXCEL_CONFIG.COLUMNS.STOCK })]?.v,
      image: worksheet[XLSX.utils.encode_cell({ r: scanRow, c: EXCEL_CONFIG.COLUMNS.IMAGE })]?.v
    };
    
    // 상품명이 있으면 유효한 데이터로 판단
    if (cells.productName && 
        cells.productName !== '' && 
        cells.productName !== null && 
        cells.productName !== undefined &&
        String(cells.productName).trim() !== '') {
      
      foundCount++;
      consecutiveEmptyRows = 0; // 빈 행 카운터 리셋
      
      // 처음 10개 상품만 상세 로그
      if (foundCount <= 10) {
        console.log(`✓ 상품 ${foundCount} 발견 - Excel 행 ${scanRow + 1}:`);
        console.log(`  상품명: ${cells.productName}`);
        console.log(`  가격: ${cells.price}`);
        console.log(`  재고: ${cells.stock}`);
        console.log(`  이미지: ${cells.image ? '있음' : '없음'}`);
      }
      
      // 상품 객체 생성
      extractedData.push(createProduct(
        String(cells.productName).trim(),
        cells.price || 0,
        cells.stock || 0,
        cells.image || '',
        false, // isModified
        scanRow // originalRowIndex (0-based)
      ));
    } else {
      consecutiveEmptyRows++;
      
      // 연속 빈 행이 MAX_EMPTY_ROWS를 넘으면 스캔 중단
      if (consecutiveEmptyRows >= MAX_EMPTY_ROWS) {
        console.log(`연속 ${MAX_EMPTY_ROWS}개 빈 행 감지, 스캔 중단 (Excel 행 ${scanRow + 1})`);
        break;
      }
    }
    
    // 진행률 표시 (1000행마다)
    if (scanRow % 1000 === 0 && scanRow > startRow) {
      console.log(`스캔 진행률: ${scanRow}행까지 완료, 발견된 상품: ${foundCount}개`);
    }
  }
  
  console.log(`=== 데이터 추출 완료 ===`);
  console.log(`총 ${extractedData.length}개의 상품을 찾았습니다 (Row 6부터)`);
  console.log(`최종 스캔 범위: Excel 행 ${startRow + 1}부터 ${Math.min(startRow + consecutiveEmptyRows + extractedData.length, maxScanRow)}까지`);
  
  // 추출된 데이터 요약 (처음 5개만)
  if (extractedData.length > 0) {
    console.log('추출된 상품 요약 (처음 5개):');
    extractedData.slice(0, 5).forEach((product, idx) => {
      console.log(`${idx + 1}. ${product.productName} (Excel 행: ${product.originalRowIndex + 1})`);
    });
    
    if (extractedData.length > 5) {
      console.log(`... 외 ${extractedData.length - 5}개 더`);
    }
  } else {
    console.warn('⚠️ Row 6부터 상품 데이터를 찾을 수 없습니다!');
    console.log('Row 6-15 샘플 데이터:');
    for (let i = 5; i < 15; i++) {
      const sampleD = worksheet[XLSX.utils.encode_cell({ r: i, c: 3 })]?.v;
      const sampleF = worksheet[XLSX.utils.encode_cell({ r: i, c: 5 })]?.v;
      const sampleH = worksheet[XLSX.utils.encode_cell({ r: i, c: 7 })]?.v;
      console.log(`  Excel 행 ${i + 1}: D='${sampleD}' F='${sampleF}' H='${sampleH}'`);
    }
  }
  
  return extractedData;
};

// ===============================
// 하위 컴포넌트들
// ===============================

/**
 * 파일 업로드 영역 컴포넌트
 */
const FileUploadArea = ({ onFileUpload, loading }) => (
  <Box
    sx={{
      border: '2px dashed #ccc',
      borderRadius: 2,
      p: 4,
      textAlign: 'center',
      '&:hover': { borderColor: '#1976d2' },
      transition: 'border-color 0.3s'
    }}
  >
    <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h6" gutterBottom color="text.primary">
      Excel 파일 업로드
    </Typography>
    <Typography variant="body2" color="text.secondary" mb={3}>
      .xlsx, .xls, .csv 파일을 선택하세요
    </Typography>
    <Button
      variant="contained"
      component="label"
      startIcon={<CloudUpload />}
      size="large"
      disabled={loading}
    >
      파일 선택
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={onFileUpload}
        hidden
      />
    </Button>
  </Box>
);

/**
 * 업로드된 파일 정보 표시 컴포넌트
 */
const UploadedFileInfo = ({ file, onReset }) => (
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    p: 2, 
    bgcolor: 'grey.50', 
    borderRadius: 1 
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <InsertDriveFile sx={{ fontSize: 32, color: 'success.main' }} />
      <Box>
        <Typography variant="subtitle1" fontWeight="medium">
          {file.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {(file.size / 1024).toFixed(1)} KB
        </Typography>
      </Box>
    </Box>
    <Button onClick={onReset} color="error" startIcon={<Delete />}>
      제거
    </Button>
  </Box>
);

/**
 * 로딩 상태 표시 컴포넌트
 */
const LoadingState = () => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
    <CircularProgress size={24} sx={{ mr: 1 }} />
    <Typography variant="body2" color="text.secondary">
      파일을 읽는 중...
    </Typography>
  </Box>
);

/**
 * 상품 카드 컴포넌트
 */
const ProductCard = ({ product, index, onProductUpdate }) => {
  const [imageError, setImageError] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    price: product.price || 0,
    stock: product.stock || 0
  });

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') {
      return `${price.toLocaleString()}원`;
    }
    return price || '가격 정보 없음';
  };

  // 가격 변경 정보 렌더링 함수
  const renderPriceInfo = () => {
    const currentPrice = product.price || 0;
    const originalPrice = product.originalPrice;
    const priceChange = product.priceChange;

    // 최저가 검색을 통해 업데이트된 경우
    if (originalPrice && originalPrice !== currentPrice) {
      const difference = currentPrice - originalPrice;
      const isIncrease = difference > 0;
      const isDecrease = difference < 0;

      return (
        <Box sx={{ mb: 1 }}>
          {/* 현재 가격 (업데이트된 가격) */}
          <Typography 
            variant="body1" 
            fontWeight="bold" 
            color="primary.main"
            sx={{ wordBreak: 'break-word', mb: 0.5 }}
          >
            {formatPrice(currentPrice)}
          </Typography>
          
          {/* 기존 가격 (취소선) */}
          <Typography 
            variant="caption" 
            sx={{ 
              textDecoration: 'line-through', 
              color: 'text.secondary',
              display: 'block',
              mb: 0.5
            }}
          >
            기존: {formatPrice(originalPrice)}
          </Typography>
          
          {/* 가격 변동 표시 */}
          {(isIncrease || isDecrease) && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 0.5,
              color: isIncrease ? 'success.main' : 'error.main'
            }}>
              {isIncrease ? (
                <TrendingUp fontSize="small" />
              ) : (
                <TrendingDown fontSize="small" />
              )}
              <Typography 
                variant="caption" 
                fontWeight="medium"
                sx={{ 
                  color: isIncrease ? 'success.main' : 'error.main'
                }}
              >
                {priceChange || `${difference > 0 ? '+' : ''}${difference.toLocaleString()}원`}
              </Typography>
            </Box>
          )}
        </Box>
      );
    }

    // 일반적인 경우 (수동 수정 또는 최저가 검색 전)
    return (
      <Typography 
        variant="body2" 
        fontWeight="bold" 
        color="primary.main"
        sx={{ wordBreak: 'break-word', mb: 1 }}
      >
        {formatPrice(currentPrice)}
      </Typography>
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditValues({
      price: product.price || 0,
      stock: product.stock || 0
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValues({
      price: product.price || 0,
      stock: product.stock || 0
    });
  };

  const handleSave = () => {
    const updatedProduct = {
      ...product,
      price: Number(editValues.price) || 0,
      stock: Number(editValues.stock) || 0,
      isModified: true
      // originalRowIndex는 그대로 유지됨
    };
    onProductUpdate(index, updatedProduct);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    // 숫자만 입력 허용
    const numericValue = value.replace(/[^0-9]/g, '');
    setEditValues(prev => ({
      ...prev,
      [field]: numericValue
    }));
  };

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      minWidth: 0,
      width: '100%',
      transition: 'transform 0.2s, box-shadow 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      },
      position: 'relative',
      border: product.isModified ? '2px solid #4caf50' : '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      {/* 수정됨 표시 */}
      {product.isModified && (
        <Chip
          icon={<CheckCircle />}
          label={product.originalPrice ? "최저가 적용" : "수정됨"}
          color="success"
          size="small"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1
          }}
        />
      )}

      <CardMedia
        sx={{ 
          height: 320,
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}
      >
        {product.image && !imageError ? (
          <Box 
            component="img"
            src={product.image}
            alt={product.productName}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={handleImageError}
          />
        ) : (
          <InsertDriveFile sx={{ fontSize: 48, color: 'text.disabled' }} />
        )}
      </CardMedia>
      
      <CardContent sx={{ 
        flexGrow: 1, 
        p: 1.5, 
        '&:last-child': { pb: 1.5 }, 
        minWidth: 0 
      }}>
        <Typography 
          variant="body2" 
          component="h3"
          fontWeight="medium"
          sx={{ 
            mb: 1,
            height: '2.5rem',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: '1.25rem',
            wordBreak: 'break-word'
          }}
          title={product.productName}
        >
          {product.productName || '상품명 없음'}
        </Typography>
        
        {/* 행 번호 표시 (디버그용) */}
        <Typography variant="caption" color="warning.main" display="block" mb={0.5}>
          Excel Row: {(product.originalRowIndex || 0) + 1}
        </Typography>
        
        {/* 재고 정보 */}
        {isEditing ? (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              재고:
            </Typography>
            <TextField
              size="small"
              value={editValues.stock}
              onChange={(e) => handleInputChange('stock', e.target.value)}
              placeholder="재고 수량"
              fullWidth
              sx={{
                '& .MuiInputBase-root': {
                  height: '32px',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
            재고: {product.stock || 0}
          </Typography>
        )}
        
        {/* 가격 정보 */}
        {isEditing ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
              가격:
            </Typography>
            <TextField
              size="small"
              value={editValues.price}
              onChange={(e) => handleInputChange('price', e.target.value)}
              placeholder="가격"
              fullWidth
              sx={{
                '& .MuiInputBase-root': {
                  height: '32px',
                  fontSize: '0.875rem'
                }
              }}
            />
          </Box>
        ) : (
          <Box sx={{ mb: 1 }}>
            {renderPriceInfo()}
          </Box>
        )}

        {/* 액션 버튼 */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          {isEditing ? (
            <>
              <IconButton
                size="small"
                onClick={handleCancel}
                color="error"
                sx={{ minWidth: 0, padding: '4px' }}
              >
                <Cancel fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleSave}
                color="success"
                sx={{ minWidth: 0, padding: '4px' }}
              >
                <Save fontSize="small" />
              </IconButton>
            </>
          ) : (
            <IconButton
              size="small"
              onClick={handleEdit}
              color="primary"
              sx={{ minWidth: 0, padding: '4px' }}
            >
              <Edit fontSize="small" />
            </IconButton>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

/**
 * 디버그 정보 표시 컴포넌트
 */
const DebugInfo = ({ data }) => (
  <Accordion sx={{ mb: 3 }}>
    <AccordionSummary expandIcon={<ExpandMore />}>
      <Typography variant="h6" color="warning.main">
        디버그 정보
      </Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          추출된 상품 데이터 ({data.length}개):
        </Typography>
        {data.length > 0 ? (
          <Paper variant="outlined" sx={{ p: 2, maxHeight: 240, overflow: 'auto', mb: 2 }}>
            {data.map((item, index) => (
              <Box key={index} sx={{ 
                py: 1, 
                borderBottom: index < data.length - 1 ? '1px solid #e0e0e0' : 'none' 
              }}>
                <Typography variant="body2">
                  <strong>#{index + 1}:</strong> {item.productName || '(상품명 없음)'} 
                  | 가격: {item.price || '0'} 
                  | 재고: {item.stock || '0'} 
                  | 이미지: {item.image ? '있음' : '없음'}
                  | Excel행: {(item.originalRowIndex || 0) + 1}
                </Typography>
              </Box>
            ))}
          </Paper>
        ) : (
          <Typography variant="body2" color="text.secondary">
            추출된 데이터가 없습니다.
          </Typography>
        )}
      </Box>
    </AccordionDetails>
  </Accordion>
);

/**
 * 상품 그리드 컴포넌트
 */
const ProductGrid = ({ data, onProductUpdate, onDownloadExcel, onSetAllMinPrice, downloadLoading }) => {
  const [sortOption, setSortOption] = useState('default');
  const modifiedCount = data.filter(product => product.isModified).length;

  // 정렬 옵션 정의
  const sortOptions = [
    { value: 'default', label: '기본 순서' },
    { value: 'priceHighToLow', label: '높은 가격 순' },
    { value: 'priceLowToHigh', label: '낮은 가격 순' },
    { value: 'priceIncreaseDesc', label: '가격 상승 순' },
    { value: 'priceDecreaseDesc', label: '가격 하락 순' }
  ];

  // 데이터 정렬 함수
  const getSortedData = () => {
    const sortedData = [...data];

    switch (sortOption) {
      case 'priceHighToLow':
        // 높은 가격 순
        return sortedData.sort((a, b) => (b.price || 0) - (a.price || 0));
        
      case 'priceLowToHigh':
        // 낮은 가격 순
        return sortedData.sort((a, b) => (a.price || 0) - (b.price || 0));
        
      case 'priceIncreaseDesc':
        // 가격 상승 순 (변경된 가격이 큰 순)
        return sortedData.sort((a, b) => {
          const aIncrease = (a.originalPrice && a.price > a.originalPrice) ? 
            (a.price - a.originalPrice) : -Infinity;
          const bIncrease = (b.originalPrice && b.price > b.originalPrice) ? 
            (b.price - b.originalPrice) : -Infinity;
          return bIncrease - aIncrease;
        });
        
      case 'priceDecreaseDesc':
        // 가격 하락 순 (변경된 가격이 큰 순, 절댓값)
        return sortedData.sort((a, b) => {
          const aDecrease = (a.originalPrice && a.price < a.originalPrice) ? 
            (a.originalPrice - a.price) : -Infinity;
          const bDecrease = (b.originalPrice && b.price < b.originalPrice) ? 
            (b.originalPrice - b.price) : -Infinity;
          return bDecrease - aDecrease;
        });
        
      default:
        // 기본 순서 (originalRowIndex 순)
        return sortedData.sort((a, b) => (a.originalRowIndex || 0) - (b.originalRowIndex || 0));
    }
  };

  const sortedData = getSortedData();

  const handleSortChange = (event) => {
    setSortOption(event.target.value);
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" color="text.primary">
          상품 목록 ({data.length}개 상품)
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* 정렬 드롭다운 */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel id="sort-select-label">
              <Sort sx={{ fontSize: 16, mr: 0.5 }} />
              정렬
            </InputLabel>
            <Select
              labelId="sort-select-label"
              value={sortOption}
              onChange={handleSortChange}
              label="정렬"
              sx={{ fontSize: '0.875rem' }}
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {/* 모든 카드 최저가로 변경 버튼 */}
          <Button
            variant="outlined"
            onClick={onSetAllMinPrice}
            color="warning"
            size="small"
            disabled={downloadLoading}
            sx={{
              borderColor: '#ff9800',
              color: '#ff9800',
              '&:hover': {
                borderColor: '#f57c00',
                backgroundColor: 'rgba(255, 152, 0, 0.04)'
              },
              '&:disabled': {
                borderColor: '#ccc',
                color: '#999'
              }
            }}
          >
            {downloadLoading ? '최저가 검색 중...' : '모든 카드 최저가로 변경'}
          </Button>
          
          {modifiedCount > 0 && (
            <>
              <Chip
                icon={<CheckCircle />}
                label={`${modifiedCount}개 수정됨`}
                color="success"
                variant="outlined"
              />
              <Button
                variant="contained"
                startIcon={<Download />}
                onClick={onDownloadExcel}
                color="success"
                size="small"
                disabled={downloadLoading}
              >
                수정된 파일 다운로드
              </Button>
            </>
          )}
        </Box>
      </Box>

      {/* 현재 정렬 상태 표시 */}
      {sortOption !== 'default' && (
        <Box sx={{ mb: 2 }}>
          <Chip
            label={`현재 정렬: ${sortOptions.find(opt => opt.value === sortOption)?.label}`}
            variant="outlined"
            color="primary"
            size="small"
            onDelete={() => setSortOption('default')}
          />
        </Box>
      )}
      
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, 1fr)',
          sm: 'repeat(3, 1fr)', 
          md: 'repeat(4, 1fr)',
          lg: 'repeat(5, 1fr)',
          xl: 'repeat(6, 1fr)'
        },
        gap: 2
      }}>
        {sortedData.map((product, index) => (
          <ProductCard 
            key={`${product.originalRowIndex}-${index}`} // 정렬 시 키 충돌 방지
            product={product} 
            index={data.indexOf(product)} // 원본 배열에서의 인덱스 전달
            onProductUpdate={onProductUpdate}
          />
        ))}
      </Box>
    </Paper>
  );
};

// ===============================
// 메인 컴포넌트
// ===============================

/**
 * Excel 카드 뷰어 메인 컴포넌트
 */
export default function MinimumPriceAdjust() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [originalFile, setOriginalFile] = useState(null); // 원본 파일 저장용 state 추가
  const [originalWorkbook, setOriginalWorkbook] = useState(null); // 원본 파일 저장용 state 추가

  /**
   * 파일 업로드 처리
   */
  const handleFileUpload = useCallback(async (event) => {
    const uploadedFile = event.target.files[0];
    
    // 파일 검증
    const validation = validateFile(uploadedFile);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setFile(uploadedFile);
    setOriginalFile(uploadedFile); // 원본 파일 별도 저장
    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // 원본 워크북 저장 (디스플레이용)
      setOriginalWorkbook(workbook);
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const extractedData = extractDataFromWorksheet(worksheet);
      
      // 원본 행 인덱스 설정 검증
      console.log('=== 추출된 데이터 검증 ===');
      extractedData.forEach((product, idx) => {
        console.log(`${idx + 1}. ${product.productName}`);
        console.log(`   - originalRowIndex: ${product.originalRowIndex}`);
        console.log(`   - Excel 행 번호: ${product.originalRowIndex + 1}`);
        console.log(`   - 가격: ${product.price}, 재고: ${product.stock}`);
      });
      
      setData(extractedData);
      
    } catch (err) {
      setError('파일을 읽는 중 오류가 발생했습니다. 파일 형식을 확인해주세요.');
      console.error('File processing error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 수정된 엑셀 파일 다운로드 처리
   */
  const handleDownloadExcel = useCallback(async () => {
    if (!originalFile) {
      setError('다운로드할 수 있는 원본 파일이 없습니다.');
      return;
    }

    setDownloadLoading(true);
    
    try {
      const success = await downloadModifiedExcel(originalWorkbook, data, file.name, originalFile);
      if (!success) {
        setError('파일 다운로드 중 오류가 발생했습니다.');
      }
    } catch (err) {
      setError('파일 다운로드 중 오류가 발생했습니다.');
      console.error('Download error:', err);
    } finally {
      setDownloadLoading(false);
    }
  }, [originalWorkbook, data, file, originalFile]);

  /**
   * 모든 상품을 최저가로 변경 (네이버 API 사용)
   */
  const handleSetAllMinPrice = useCallback(async () => {
    if (!originalFile) {
      setError('원본 파일이 없습니다. 파일을 다시 업로드해주세요.');
      return;
    }
    
    // 확인 대화상자
    const confirmed = window.confirm(
      '네이버 쇼핑 API를 통해 모든 상품의 최저가를 검색하여 가격을 업데이트하시겠습니까?\n' +
      '상품 수가 많을 경우 시간이 오래 걸릴 수 있습니다.'
    );
    
    if (!confirmed) {
      return;
    }
    
    console.log(`=== 네이버 최저가 검색 시작 ===`);
    console.log(`대상 상품 수: ${data.length}개`);
    
    setDownloadLoading(true);
    
    try {
      // 네이버 최저가 검색 API 호출
      const result = await callLowestPriceAPI(originalFile, file.name);
      
      if (result.success && result.priceChanges) {
        console.log('받은 가격 변경 데이터:', result.priceChanges);
        
        // 프론트엔드 데이터를 실제 최저가로 업데이트
        setData(prevData => {
          const updatedData = prevData.map(product => {
            // Django에서 받은 가격 변경 정보 찾기
            const priceChange = result.priceChanges.find(change => {
              // 상품명으로 매칭 (또는 행 번호로 매칭)
              return change.product_name === product.productName || 
                     change.row === (product.originalRowIndex + 1);
            });
            
            if (priceChange && priceChange.new_price) {
              const originalPrice = Number(priceChange.original_price) || product.price;
              const newPrice = Number(priceChange.new_price);
              
              console.log(`${product.productName}: ${originalPrice} → ${newPrice} (${priceChange.change})`);
              
              return {
                ...product,
                price: newPrice,
                originalPrice: originalPrice,
                priceChange: priceChange.change,
                filterInfo: priceChange.filter_info,              // ⭐ 추가
                validItemsCount: priceChange.valid_items_count || 0,  // ⭐ 추가
                searchKeyword: priceChange.search_keyword,        // ⭐ 추가
                isModified: true
              };
            }
            
            // 변경 사항이 없으면 기존 데이터 유지
            return product;
          });
          
          const changedCount = updatedData.filter(p => p.isModified).length;
          console.log(`${changedCount}개 상품의 가격이 최저가로 업데이트되었습니다`);
          
          return updatedData;
        });
        
        // 성공 알림
        alert(`최저가 검색이 완료되었습니다!\n카드 화면에서 변경된 가격을 확인하세요.`);
        
      } else {
        console.error('가격 변경 데이터를 받지 못했습니다:', result);
        setError(result.error || '최저가 검색 중 오류가 발생했습니다.');
      }
      
    } catch (err) {
      setError('최저가 검색 중 오류가 발생했습니다: ' + err.message);
      console.error('Lowest price search error:', err);
    } finally {
      setDownloadLoading(false);
    }
  }, [originalFile, file, data]);

    /**
   * 네이버 최저가 검색 API 호출 (수정됨)
   */
  const callLowestPriceAPI = useCallback(async (originalFile, originalFileName) => {
    try {
      console.log('=== 최저가 검색 API 호출 시작 ===');
      
      if (!data || data.length === 0) {
        console.error('상품 데이터가 없습니다.');
        return { success: false, error: '상품 데이터가 없습니다.' };
      }
      
      console.log(`대상 상품 수: ${data.length}개`);
      
      // 상품 데이터를 API 요청 형식으로 변환
      const items = data.map(product => ({
        productName: product.productName,
        currentPrice: Number(product.price) || 0
      }));
      
      console.log('API 전송 데이터:', items.slice(0, 3), '...(총', items.length, '개)');
      
      // Django API 호출 - search-prices 엔드포인트 사용 (변경됨!)
      const response = await fetch(`${API_BASE_URL}/search-prices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ items })
      });
      
      console.log('서버 응답 상태:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('서버 에러 응답:', errorText);
        throw new Error(`서버 에러: ${response.status}`);
      }
      
      // JSON 응답 처리
      const result = await response.json();
      console.log('API 응답 결과:', result);
      
      // Django에서 보내주는 데이터 구조 확인 (변경됨!)
      if (result.results && Array.isArray(result.results)) {
        console.log(`${result.results.length}개 상품의 가격 정보를 받았습니다.`);
        
        // 응답 데이터를 프론트엔드 형식으로 변환
        const priceChanges = result.results.map(item => ({
          product_name: item.productName,
          original_price: item.currentPrice,
          new_price: item.newPrice,
          change: item.priceDiff > 0 ? `+${item.priceDiff}원` : `${item.priceDiff}원`,
          card_type: item.cardType,
          filter_info: item.filterInfo,
          search_keyword: item.searchKeyword,
          valid_items_count: item.validItemsCount  // ⭐ 추가
        }));
        
        return { 
          success: true, 
          priceChanges: priceChanges,
          message: `${result.totalProcessed}개 상품 처리 완료`
        };
      } else {
        console.warn('예상과 다른 응답 형식:', result);
        return { success: false, error: '가격 정보를 받지 못했습니다.' };
      }
      
    } catch (error) {
      console.error('=== 최저가 검색 API 처리 에러 ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error.stack);
      return { success: false, error: error.message };
    }
  }, [data]); // 의존성 배열에 data 추가!

  /**
   * 상품 데이터 업데이트
   */
  const handleProductUpdate = useCallback((index, updatedProduct) => {
    setData(prevData => {
      const newData = [...prevData];
      newData[index] = updatedProduct;
      return newData;
    });
  }, []);

  /**
   * 파일 및 데이터 초기화
   */
  const resetFile = useCallback(() => {
    setFile(null);
    setOriginalFile(null); // 원본 파일도 초기화
    setOriginalWorkbook(null); // 워크북도 초기화
    setData([]);
    setError(null);
    setDownloadLoading(false);
  }, []);

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
      py: 3 
    }}>
      <Container maxWidth="xl">
        {/* 헤더 */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h3" component="h1" fontWeight="bold" color="text.primary" mb={1}>
            Excel 카드 뷰어
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Excel 파일을 업로드하여 카드 형태로 데이터를 확인하세요
          </Typography>
        </Box>

        {/* 파일 업로드 영역 */}
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          {!file ? (
            <FileUploadArea onFileUpload={handleFileUpload} loading={loading} />
          ) : (
            <UploadedFileInfo file={file} onReset={resetFile} />
          )}

          {/* 로딩 상태 */}
          {(loading || downloadLoading) && (
            <LoadingState />
          )}
          {downloadLoading && (
            <Typography variant="body2" color="text.secondary" textAlign="center" mt={1}>
              수정된 파일을 준비하고 있습니다...
            </Typography>
          )}

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* 디버깅 섹션 */}
        {file && <DebugInfo data={data} />}

        {/* 상품 카드 목록 */}
        {data.length > 0 && (
          <ProductGrid 
            data={data} 
            onProductUpdate={handleProductUpdate}
            onDownloadExcel={handleDownloadExcel}
            onSetAllMinPrice={handleSetAllMinPrice}
            downloadLoading={downloadLoading}
          />
        )}

        {/* 데이터가 없는 경우 */}
        {file && !loading && data.length === 0 && (
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" mb={2}>
              추출된 데이터가 없습니다
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Excel 파일의 D, F, H, U 열에 상품 데이터가 있는지 확인해주세요.
              <br />
              상품명이 D열에 있어야 데이터로 인식됩니다.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}