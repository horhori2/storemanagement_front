import React, { useState, useCallback, useEffect } from 'react';
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
  MenuItem,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText
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
import { API_BASE_URL } from './config';

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
    PRODUCT_NAME: 3,
    PRICE: 5,
    STOCK: 7,
    IMAGE: 20
  },
  START_ROW: 5,
  MAX_EMPTY_ROWS: 2,
  MAX_SCAN_ROWS: 50000
};

// API 설정
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const PROGRESS_POLL_INTERVAL = 2000; // 2초마다 진행 상황 확인

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
  originalPrice,
  priceChange
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
 * Django 백엔드로 수정된 데이터 전송 및 파일 다운로드
 */
const downloadModifiedExcel = async (originalWorkbook, modifiedData, originalFileName, originalFile) => {
  try {
    console.log('=== Django 백엔드로 파일 처리 요청 ===');
    
    const modifiedItems = modifiedData.filter(p => p.isModified).map(product => ({
      originalRowIndex: product.originalRowIndex,
      productName: product.productName,
      price: Number(product.price) || 0,
      stock: Number(product.stock) || 0,
      excelRow: product.originalRowIndex + 1,
      filterInfo: product.filterInfo || "",
      validCount: product.validItemsCount || 0,
      searchKeyword: product.searchKeyword || ""
    }));
    
    if (modifiedItems.length === 0) {
      console.warn('수정된 데이터가 없습니다.');
      return false;
    }
    
    if (!originalFile) {
      console.error('원본 파일이 없습니다.');
      return false;
    }
    
    const formData = new FormData();
    formData.append('excel_file', originalFile, originalFile.name);
    formData.append('modifications', JSON.stringify(modifiedItems));
    formData.append('original_filename', originalFile.name);
    
    const response = await fetch(`${API_BASE_URL}/download-excel/`, {
      method: 'POST',
      body: formData,
      headers: {
        'X-CSRFToken': getCsrfToken(),
      }
    });
    
    if (!response.ok) {
      throw new Error(`서버 에러: ${response.status}`);
    }
    
    const responseBlob = await response.blob();
    
    if (responseBlob.size === 0) {
      throw new Error('서버에서 받은 파일의 크기가 0입니다.');
    }
    
    let downloadFileName = originalFile.name.replace(/\.[^/.]+$/, '') + '_modified.xlsx';
    const contentDisposition = response.headers.get('Content-Disposition');
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (fileNameMatch) {
        downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
      }
    }
    
    const url = window.URL.createObjectURL(responseBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = downloadFileName;
    link.style.display = 'none';
    link.rel = 'noopener';
    
    document.body.appendChild(link);
    link.click();
    
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
    
    return true;
    
  } catch (error) {
    console.error('=== Django 백엔드 처리 에러 ===');
    console.error('Error details:', error);
    return false;
  }
};

/**
 * CSRF 토큰 가져오기
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

/**
 * 엑셀 데이터 추출
 */
const extractDataFromWorksheet = (worksheet) => {
  if (!worksheet['!ref']) return [];
  
  const extractedData = [];
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const startRow = 5;
  
  let maxScanRow;
  if (range.e.r < 100) {
    maxScanRow = 1000;
  } else {
    maxScanRow = Math.min(range.e.r + 100, 5000);
  }
  
  let foundCount = 0;
  let consecutiveEmptyRows = 0;
  const MAX_EMPTY_ROWS = 20;
  
  for (let scanRow = startRow; scanRow <= maxScanRow; scanRow++) {
    const cells = {
      productName: worksheet[XLSX.utils.encode_cell({ r: scanRow, c: EXCEL_CONFIG.COLUMNS.PRODUCT_NAME })]?.v,
      price: worksheet[XLSX.utils.encode_cell({ r: scanRow, c: EXCEL_CONFIG.COLUMNS.PRICE })]?.v,
      stock: worksheet[XLSX.utils.encode_cell({ r: scanRow, c: EXCEL_CONFIG.COLUMNS.STOCK })]?.v,
      image: worksheet[XLSX.utils.encode_cell({ r: scanRow, c: EXCEL_CONFIG.COLUMNS.IMAGE })]?.v
    };
    
    if (cells.productName && 
        cells.productName !== '' && 
        cells.productName !== null && 
        cells.productName !== undefined &&
        String(cells.productName).trim() !== '') {
      
      foundCount++;
      consecutiveEmptyRows = 0;
      
      extractedData.push(createProduct(
        String(cells.productName).trim(),
        cells.price || 0,
        cells.stock || 0,
        cells.image || '',
        false,
        scanRow
      ));
    } else {
      consecutiveEmptyRows++;
      
      if (consecutiveEmptyRows >= MAX_EMPTY_ROWS) {
        break;
      }
    }
  }
  
  return extractedData;
};

// ===============================
// 진행 상황 표시 컴포넌트
// ===============================

/**
 * 진행 상황 표시 다이얼로그
 */
const ProgressDialog = ({ open, progressData, onClose }) => {
  const formatTime = (seconds) => {
    if (seconds < 60) return `약 ${seconds}초`;
    const minutes = Math.ceil(seconds / 60);
    return `약 ${minutes}분`;
  };

  const getStageMessage = (stage) => {
    switch (stage) {
      case 'initializing':
        return '작업을 준비하고 있습니다...';
      case 'processing':
        return '최저가를 검색하고 있습니다...';
      case 'completed':
        return '✅ 작업이 완료되었습니다!';
      case 'error':
        return '❌ 오류가 발생했습니다';
      default:
        return '처리 중...';
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={progressData?.stage === 'completed' ? onClose : undefined}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={progressData?.stage !== 'completed'}
    >
      <DialogTitle>
        {progressData?.stage === 'completed' ? '작업 완료' : '최저가 검색 중'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ width: '100%', mb: 2 }}>
          {/* 진행률 바 */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={progressData?.progress || 0}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
            <Box sx={{ minWidth: 50 }}>
              <Typography variant="body2" color="text.secondary">
                {progressData?.progress || 0}%
              </Typography>
            </Box>
          </Box>

          {/* 상태 메시지 */}
          <DialogContentText sx={{ mb: 2 }}>
            {progressData?.message || getStageMessage(progressData?.stage)}
          </DialogContentText>

          {/* 진행 정보 */}
          {progressData?.stage === 'processing' && (
            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                처리 중: <strong>{progressData?.processed_items || 0}</strong> / {progressData?.total_items || 0} 상품
              </Typography>
              
              {progressData?.estimated_time > 0 && (
                <Typography variant="body2" color="primary">
                  남은 시간: <strong>{formatTime(progressData.estimated_time)}</strong>
                </Typography>
              )}
              
              {progressData?.current_item && (
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block', 
                    mt: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  현재: {progressData.current_item}
                </Typography>
              )}
            </Box>
          )}

          {/* 완료 메시지 */}
          {progressData?.stage === 'completed' && (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CheckCircle sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" color="success.main">
                모든 상품의 최저가 검색이 완료되었습니다!
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                카드 화면에서 변경된 가격을 확인하세요
              </Typography>
            </Box>
          )}

          {/* 에러 메시지 */}
          {progressData?.stage === 'error' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {progressData?.error || '알 수 없는 오류가 발생했습니다'}
            </Alert>
          )}
        </Box>

        {/* 닫기 버튼 (완료 시에만) */}
        {progressData?.stage === 'completed' && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button variant="contained" onClick={onClose}>
              확인
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
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

  const renderPriceInfo = () => {
    const currentPrice = product.price || 0;
    const originalPrice = product.originalPrice;
    const priceChange = product.priceChange;

    if (originalPrice && originalPrice !== currentPrice) {
      const difference = currentPrice - originalPrice;
      const isIncrease = difference > 0;
      const isDecrease = difference < 0;

      return (
        <Box sx={{ mb: 1 }}>
          <Typography 
            variant="body1" 
            fontWeight="bold" 
            color="primary.main"
            sx={{ wordBreak: 'break-word', mb: 0.5 }}
          >
            {formatPrice(currentPrice)}
          </Typography>
          
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
    };
    onProductUpdate(index, updatedProduct);
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
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
        
        <Typography variant="caption" color="warning.main" display="block" mb={0.5}>
          Excel Row: {(product.originalRowIndex || 0) + 1}
        </Typography>
        
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

  const sortOptions = [
    { value: 'default', label: '기본 순서' },
    { value: 'priceHighToLow', label: '높은 가격 순' },
    { value: 'priceLowToHigh', label: '낮은 가격 순' },
    { value: 'priceIncreaseDesc', label: '가격 상승 순' },
    { value: 'priceDecreaseDesc', label: '가격 하락 순' }
  ];

  const getSortedData = () => {
    const sortedData = [...data];

    switch (sortOption) {
      case 'priceHighToLow':
        return sortedData.sort((a, b) => (b.price || 0) - (a.price || 0));
        
      case 'priceLowToHigh':
        return sortedData.sort((a, b) => (a.price || 0) - (b.price || 0));
        
      case 'priceIncreaseDesc':
        return sortedData.sort((a, b) => {
          const aIncrease = (a.originalPrice && a.price > a.originalPrice) ? 
            (a.price - a.originalPrice) : -Infinity;
          const bIncrease = (b.originalPrice && b.price > b.originalPrice) ? 
            (b.price - b.originalPrice) : -Infinity;
          return bIncrease - aIncrease;
        });
        
      case 'priceDecreaseDesc':
        return sortedData.sort((a, b) => {
          const aDecrease = (a.originalPrice && a.price < a.originalPrice) ? 
            (a.originalPrice - a.price) : -Infinity;
          const bDecrease = (b.originalPrice && b.price < b.originalPrice) ? 
            (b.originalPrice - b.price) : -Infinity;
          return bDecrease - aDecrease;
        });
        
      default:
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
            key={`${product.originalRowIndex}-${index}`}
            product={product} 
            index={data.indexOf(product)}
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
  const [originalFile, setOriginalFile] = useState(null);
  const [originalWorkbook, setOriginalWorkbook] = useState(null);
  
  // 진행 상황 관련 state
  const [jobId, setJobId] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  /**
   * 진행 상황 폴링
   */
  useEffect(() => {
    if (!jobId) return;

    const pollProgress = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/progress/${jobId}/`);
        
        if (!response.ok) {
          console.error('진행 상황 조회 실패:', response.status);
          return;
        }

        const data = await response.json();
        setProgressData(data);

        // 완료 또는 에러 상태면 폴링 중지
        if (data.stage === 'completed') {
          // 결과를 프론트엔드 데이터에 반영
          if (data.results && data.results.results) {
            updateDataWithResults(data.results.results);
          }
          
          setTimeout(() => {
            setProgressDialogOpen(false);
            setJobId(null);
            setDownloadLoading(false);
          }, 2000); // 2초 후 다이얼로그 닫기
        } else if (data.stage === 'error') {
          setError(data.error || '작업 중 오류가 발생했습니다');
          setTimeout(() => {
            setProgressDialogOpen(false);
            setJobId(null);
            setDownloadLoading(false);
          }, 3000);
        }
      } catch (err) {
        console.error('진행 상황 확인 중 오류:', err);
      }
    };

    // 초기 폴링
    pollProgress();

    // 주기적 폴링 설정
    const intervalId = setInterval(pollProgress, PROGRESS_POLL_INTERVAL);

    // 클린업
    return () => clearInterval(intervalId);
  }, [jobId]);

  /**
   * API 결과를 프론트엔드 데이터에 반영
   */
  const updateDataWithResults = (results) => {
    setData(prevData => {
      const updatedData = prevData.map(product => {
        const result = results.find(r => 
          r.productName === product.productName
        );
        
        if (result && result.newPrice !== result.currentPrice) {
          return {
            ...product,
            price: result.newPrice,
            originalPrice: result.currentPrice,
            priceChange: result.priceDiff > 0 ? `+${result.priceDiff}원` : `${result.priceDiff}원`,
            filterInfo: result.filterInfo,
            validItemsCount: result.validItemsCount,
            searchKeyword: result.searchKeyword,
            isModified: true
          };
        }
        
        return product;
      });
      
      return updatedData;
    });
  };

  /**
   * 파일 업로드 처리
   */
  const handleFileUpload = useCallback(async (event) => {
    const uploadedFile = event.target.files[0];
    
    const validation = validateFile(uploadedFile);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setFile(uploadedFile);
    setOriginalFile(uploadedFile);
    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      setOriginalWorkbook(workbook);
      
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      const extractedData = extractDataFromWorksheet(worksheet);
      
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
   * 모든 상품을 최저가로 변경 (비동기 처리)
   */
  const handleSetAllMinPrice = useCallback(async () => {
    if (!originalFile) {
      setError('원본 파일이 없습니다. 파일을 다시 업로드해주세요.');
      return;
    }
    
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
    setError(null);
    
    try {
      // 상품 데이터를 API 요청 형식으로 변환
      const items = data.map(product => ({
        productName: product.productName,
        currentPrice: Number(product.price) || 0
      }));
      
      // Django API 호출 - 비동기 작업 시작
      const response = await fetch(`${API_BASE_URL}/search-prices/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCsrfToken(),
        },
        body: JSON.stringify({ items })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`서버 에러: ${response.status} ${errorText}`);
      }
      
      // Job ID 받기
      const result = await response.json();
      console.log('Job 시작:', result);
      
      if (result.job_id) {
        setJobId(result.job_id);
        setProgressDialogOpen(true);
      } else {
        throw new Error('Job ID를 받지 못했습니다');
      }
      
    } catch (err) {
      setError('최저가 검색 중 오류가 발생했습니다: ' + err.message);
      console.error('Lowest price search error:', err);
      setDownloadLoading(false);
    }
  }, [originalFile, data]);

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
    setOriginalFile(null);
    setOriginalWorkbook(null);
    setData([]);
    setError(null);
    setDownloadLoading(false);
    setJobId(null);
    setProgressData(null);
  }, []);

  /**
   * 진행 다이얼로그 닫기
   */
  const handleCloseProgressDialog = () => {
    setProgressDialogOpen(false);
    setJobId(null);
  };

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
          {loading && <LoadingState />}

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

      {/* 진행 상황 다이얼로그 */}
      <ProgressDialog 
        open={progressDialogOpen}
        progressData={progressData}
        onClose={handleCloseProgressDialog}
      />
    </Box>
  );
}