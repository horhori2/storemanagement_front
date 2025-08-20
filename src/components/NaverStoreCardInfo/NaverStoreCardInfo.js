import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Grid,
  Container,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  CloudUpload,
  InsertDriveFile,
  Delete,
  ExpandMore
} from '@mui/icons-material';
import * as XLSX from 'xlsx';

export default function ExcelCardViewer() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    
    if (!uploadedFile) return;

    // 파일 형식 검증 (MIME 타입과 확장자 모두 확인)
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv'
    ];
    
    const fileName = uploadedFile.name.toLowerCase();
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!validTypes.includes(uploadedFile.type) && !hasValidExtension) {
      setError('엑셀 파일(.xlsx, .xls) 또는 CSV 파일만 업로드할 수 있습니다.');
      return;
    }

    setFile(uploadedFile);
    setLoading(true);
    setError(null);

    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // 첫 번째 시트 데이터 읽기
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // 원시 데이터를 가져와서 필요한 컬럼만 추출
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const extractedData = [];
      
      console.log('워크시트 범위:', range);
      console.log('감지된 총 행 수:', range.e.r + 1);
      
      let emptyRowCount = 0;
      let currentRow = 5; // 6행부터 시작 (인덱스 5)
      
      // 연속으로 빈 행이 2개 나올 때까지 계속 스캔
      while (emptyRowCount < 2) {
        const dCell = XLSX.utils.encode_cell({ r: currentRow, c: 3 }); // D열
        const fCell = XLSX.utils.encode_cell({ r: currentRow, c: 5 }); // F열
        const hCell = XLSX.utils.encode_cell({ r: currentRow, c: 7 }); // H열
        const uCell = XLSX.utils.encode_cell({ r: currentRow, c: 20 }); // U열
        
        const productName = worksheet[dCell]?.v;
        const price = worksheet[fCell]?.v;
        const stock = worksheet[hCell]?.v;
        const image = worksheet[uCell]?.v;
        
        // 처음 20행만 로그 출력
        // if (currentRow <= 24) {
        //   console.log(`Row ${currentRow + 1}:`, {
        //     D: { cell: dCell, value: productName },
        //     F: { cell: fCell, value: price },
        //     H: { cell: hCell, value: stock },
        //     U: { cell: uCell, value: image }
        //   });
        // }
        
        // 상품명이 있으면 데이터 추가하고 빈 행 카운트 리셋
        if (productName) {
          extractedData.push({
            productName: productName || '',
            price: price || 0,
            stock: stock || 0,
            image: image || ''
          });
          emptyRowCount = 0; // 데이터가 있으면 빈 행 카운트 리셋
        } else {
          emptyRowCount++; // 빈 행 카운트 증가
        }
        
        currentRow++;
        
        // 안전장치: 너무 많은 행을 스캔하지 않도록 (최대 50000행)
        if (currentRow > 50000) {
          console.log('최대 스캔 한계에 도달했습니다.');
          break;
        }
      }
      
      console.log(`총 ${extractedData.length}개의 상품을 찾았습니다. 마지막 스캔 행: ${currentRow}`);
      
      // 전체 데이터 스캔 결과 요약
    //   console.log('데이터가 있는 행 요약:');
    //   let foundDataRows = 0;
    //   for (let rowNum = 5; rowNum < currentRow && foundDataRows < 10; rowNum++) {
    //     const dValue = worksheet[XLSX.utils.encode_cell({ r: rowNum, c: 3 })]?.v;
    //     if (dValue) {
    //       console.log(`Row ${rowNum + 1} D열:`, dValue);
    //       foundDataRows++;
    //     }
    //   }
      
    //   setData(extractedData);
    //   console.log('추출된 데이터:', extractedData);
      
    } catch (err) {
      setError('파일을 읽는 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetFile = () => {
    setFile(null);
    setData([]);
    setError(null);
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
            엑셀 카드 뷰어
          </Typography>
          <Typography variant="body1" color="text.secondary">
            엑셀 파일을 업로드하여 카드 형태로 데이터를 확인하세요
          </Typography>
        </Box>

        {/* 파일 업로드 영역 */}
        <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
          {!file ? (
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
                엑셀 파일 업로드
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                .xlsx, .xls, .csv 파일을 선택하세요
              </Typography>
              <Button
                variant="contained"
                component="label"
                startIcon={<CloudUpload />}
                size="large"
              >
                파일 선택
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                  hidden
                />
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
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
              <Button
                onClick={resetFile}
                color="error"
                startIcon={<Delete />}
              >
                제거
              </Button>
            </Box>
          )}

          {/* 로딩 상태 */}
          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 2 }}>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                파일을 읽는 중...
              </Typography>
            </Box>
          )}

          {/* 에러 메시지 */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* 상품 카드 목록 */}
        {data.length > 0 && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom color="text.primary" mb={3}>
              상품 목록 ({data.length}개 상품)
            </Typography>
            
            <Grid container spacing={2}>
              {data.map((product, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2.4} xl={2.4} key={index}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* 대표이미지 */}
                    <CardMedia
                      sx={{ 
                        height: 128,
                        bgcolor: 'grey.100',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      {product.image ? (
                        <Box 
                          component="img"
                          src={product.image}
                          alt={product.productName}
                          sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : (
                        <InsertDriveFile sx={{ fontSize: 32, color: 'text.disabled' }} />
                      )}
                      <Box
                        sx={{
                          display: product.image ? 'none' : 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '100%',
                          height: '100%'
                        }}
                      >
                        <InsertDriveFile sx={{ fontSize: 32, color: 'text.disabled' }} />
                      </Box>
                    </CardMedia>
                    
                    <CardContent sx={{ flexGrow: 1, p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      {/* 상품명 */}
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
                          lineHeight: '1.25rem'
                        }}
                      >
                        {product.productName}
                      </Typography>
                      
                      {/* 재고수량 */}
                      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                        재고: {product.stock}
                      </Typography>
                      
                      {/* 판매가 */}
                      <Typography variant="body2" fontWeight="bold" color="primary.main">
                        {typeof product.price === 'number' 
                          ? `${product.price.toLocaleString()}원` 
                          : product.price
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
      </Container>
    </Box>
  );
}