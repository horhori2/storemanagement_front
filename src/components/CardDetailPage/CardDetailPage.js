import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Container,
  Paper,
  Chip,
  Button,
  AppBar,
  Toolbar,
  Skeleton,
  Breadcrumbs,
  Link,
  Stack,
  IconButton,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  useMediaQuery,
  styled,
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  ZoomIn as ZoomInIcon,
  Store as StoreIcon
} from '@mui/icons-material';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 최저가 추이 차트 컴포넌트
const PriceChart = ({ data, selectedVersion }) => {
  const theme = useTheme();
  
  // Recharts import 추가 필요: import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
  
  // 데이터를 차트에 맞는 형식으로 변환
  const chartData = data.map(item => ({
    date: item.date,
    날짜: new Date(item.date).toLocaleDateString('ko-KR', { year: '2-digit', month: 'numeric', day: 'numeric' }).replace(/\. /g, '/').replace(/\.$/, ''),
    가격: item.price,
  }));

  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center' }}>
        {selectedVersion?.version_name || '노멀'} 최저가 추이
      </Typography>
      <Box sx={{ width: '100%', height: 250 }}>
        {/* Recharts를 사용한 실제 차트 */}
        <ResponsiveContainer width="100%" height="100%">
        <LineChart
          width={500}
          height={300}
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="날짜" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="가격" stroke="#8884d8" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
      </Box>
    </Box>
  );
};

// 커스텀 스타일 컴포넌트
const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 80,
  fontWeight: theme.typography.fontWeightMedium,
  marginRight: theme.spacing(1),
  '&.Mui-selected': {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

const VersionCard = styled(Card)(({ theme, selected }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: selected ? `2px solid ${theme.palette.primary.main}` : `1px solid ${theme.palette.divider}`,
  transform: selected ? 'scale(1.02)' : 'scale(1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[8],
  }
}));

// 희귀도 색상 함수
const getRarityColor = (rarity) => {
  const colors = {
    'C': '#757575',
    'UC': '#4caf50',
    'R': '#2196f3',
    'SR': '#ff9800',
    'SEC': '#9c27b0',
    'L': '#f44336',
    'P': '#e91e63'
  };
  return colors[rarity] || '#757575';
};

const CardDetailLoadingSkeleton = ({ onBack }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
    <AppBar position="sticky">
      <Toolbar>
        <IconButton color="inherit" onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Skeleton variant="text" width={300} height={32} />
      </Toolbar>
    </AppBar>

    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Skeleton variant="text" width={400} height={24} sx={{ mb: 3 }} />
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Skeleton variant="rectangular" height={500} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            {[...Array(3)].map((_, index) => (
              <Grid item xs={4} key={index}>
                <Skeleton variant="rectangular" height={140} />
              </Grid>
            ))}
          </Grid>
        </Grid>
        
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Skeleton variant="text" width="60%" height={40} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={80} />
          </Paper>
          
          <Paper sx={{ p: 3, mb: 3 }}>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={200} />
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={300} />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  </Box>
);

const CardDetailPage = ({ cardNumber = "001/086", setCode = "sv11B", onBack = () => {} }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVersionIndex, setSelectedVersionIndex] = useState(0);
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    loadCardData();
  }, [cardNumber, setCode]);

  const loadCardData = async () => {
    setLoading(true);
    try {
      // 실제 API 호출 - 카드 상세 정보 조회
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'}/sets/${setCode}/cards/?card_number=${cardNumber}`);
      
      if (response.ok) {
        const data = await response.json();
        const cardsArray = Array.isArray(data) ? data : data.results || [];
        const cardInfo = cardsArray.find(card => card.card_number === cardNumber);
        
        if (cardInfo) {
          // API 데이터를 컴포넌트 형식으로 변환
          const processedCard = {
            id: cardInfo.id,
            card_number: cardInfo.card_number,
            name: cardInfo.name,
            name_kr: cardInfo.name_kr,
            name_jp: cardInfo.name_jp || cardInfo.name,
            set_code: setCode,
            set_name: cardInfo.set_name || 'Card Set',
            set_name_kr: cardInfo.set_name_kr || '카드 세트',
            our_price: cardInfo.price || 0,
            lowest_price: Math.floor((cardInfo.price || 0) * 0.85),
            versions: [
              {
                id: 1,
                version_code: 'normal',
                version_name: '노멀',
                rarity_code: cardInfo.rarity_code || 'C',
                image_url: cardInfo.image_url || `https://via.placeholder.com/300x420/${getRarityColor(cardInfo.rarity_code || 'C').slice(1)}/ffffff?text=${encodeURIComponent(`${setCode}-${cardNumber}+${cardInfo.rarity_code || 'C'}`)}`,
                our_price: cardInfo.price || 0,
                lowest_price: Math.floor((cardInfo.price || 0) * 0.85),
                stock: cardInfo.stock || 0,
                is_foil: false
              }
            ]
          };
          
          // 추가 버전이 있다면 (foil, parallel 등)
          if (cardInfo.versions && Array.isArray(cardInfo.versions)) {
            processedCard.versions = cardInfo.versions.map((version, index) => ({
              id: index + 1,
              version_code: version.version_code || 'normal',
              version_name: version.version_name || '노멀',
              rarity_code: version.rarity_code || cardInfo.rarity_code || 'C',
              image_url: version.image_url || cardInfo.image_url || `https://via.placeholder.com/300x420/${getRarityColor(version.rarity_code || 'C').slice(1)}/ffffff?text=${encodeURIComponent(`${setCode}-${cardNumber}+${version.rarity_code || 'C'}`)}`,
              our_price: version.price || cardInfo.price || 0,
              lowest_price: Math.floor((version.price || cardInfo.price || 0) * 0.85),
              stock: version.stock || cardInfo.stock || 0,
              is_foil: version.is_foil || false
            }));
          }
          
          setCardData(processedCard);
          
          // 가격 히스토리 별도 API 호출 - 기존 API 구조 사용
          try {
            // CardVersion ID를 사용해서 price_trend 엔드포인트 호출
            const cardVersionId = processedCard.versions[0].id;
            const historyResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api'}/card-versions/${cardVersionId}/price_trend/?days=30`);
            
            if (historyResponse.ok) {
              const historyData = await historyResponse.json();
              setPriceHistory(historyData.map(item => ({
                date: item.date,
                price: item.closing_price || item.avg_price || 0
              })));
            } else {
              // 히스토리 API 실패시 기본 데이터 생성
              const basePrice = cardInfo.price || 0;
              setPriceHistory([
                { date: '2024-01-01', price: Math.floor(basePrice * 1.1) },
                { date: '2024-01-15', price: Math.floor(basePrice * 1.05) },
                { date: '2024-02-01', price: basePrice },
                { date: '2024-02-15', price: Math.floor(basePrice * 0.95) },
                { date: '2024-03-01', price: Math.floor(basePrice * 0.85) }
              ]);
            }
          } catch (historyError) {
            console.warn('가격 히스토리 로드 실패:', historyError);
            // 폴백 데이터
            const basePrice = cardInfo.price || 0;
            setPriceHistory([
              { date: '2024-01-01', price: Math.floor(basePrice * 1.1) },
              { date: '2024-01-15', price: Math.floor(basePrice * 1.05) },
              { date: '2024-02-01', price: basePrice },
              { date: '2024-02-15', price: Math.floor(basePrice * 0.95) },
              { date: '2024-03-01', price: Math.floor(basePrice * 0.85) }
            ]);
          }
        } else {
          throw new Error('카드를 찾을 수 없습니다');
        }
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('카드 데이터 로드 실패:', error);
      
      // 에러 발생시 샘플 데이터로 폴백
      const sampleCard = {
        id: 1,
        card_number: cardNumber,
        name: 'Sample Card',
        name_kr: `샘플 카드 ${cardNumber}`,
        name_jp: `サンプル${cardNumber}`,
        set_code: setCode,
        set_name: 'Sample Set',
        set_name_kr: '샘플 세트',
        our_price: 5000,
        lowest_price: 4500,
        versions: [
          {
            id: 1,
            version_code: 'normal',
            version_name: '노멀',
            rarity_code: 'R',
            image_url: `https://via.placeholder.com/300x420/2196f3/ffffff?text=${encodeURIComponent(`${setCode}-${cardNumber}+R`)}`,
            our_price: 5000,
            lowest_price: 4500,
            stock: 5,
            is_foil: false
          }
        ]
      };
      
      setCardData(sampleCard);
      setPriceHistory([
        { date: '2024-01-01', price: 4000 },
        { date: '2024-01-15', price: 4500 },
        { date: '2024-02-01', price: 5000 },
        { date: '2024-02-15', price: 4800 },
        { date: '2024-03-01', price: 5000 }
      ]);
      setLoading(false);
    }
  };

  const handleVersionChange = (event, newIndex) => {
    setSelectedVersionIndex(newIndex);
  };

  if (loading) {
    return <CardDetailLoadingSkeleton onBack={onBack} />;
  }

  if (!cardData) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Button onClick={onBack} variant="outlined" sx={{ mb: 2 }}>
          ← 뒤로 가기
        </Button>
        <Typography variant="h6">카드 정보를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  const selectedVersion = cardData.versions[selectedVersionIndex];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="sticky" sx={{ bgcolor: '#2196f3' }}>
        <Toolbar>
          <IconButton color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            [{cardData.set_code}-{cardData.card_number}] {cardData.name_kr}
          </Typography>
          <IconButton color="inherit">
            <FavoriteIcon />
          </IconButton>
          <IconButton color="inherit">
            <ShareIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 3 }}>
          <Link href="#" underline="hover" color="inherit" onClick={onBack}>
            카드 목록
          </Link>
          <Typography color="text.primary">
            {cardData.card_number} - {cardData.name_kr}
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            {/* 카드 이미지 */}
            <Card sx={{ mb: 3, position: 'relative' }}>
              <Box sx={{ position: 'relative' }}>
                <Box
                  component="img"
                  src={selectedVersion.image_url}
                  alt={`${cardData.name_kr} ${selectedVersion.version_name}`}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: 500,
                    objectFit: 'contain'
                  }}
                />
                <IconButton
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' }
                  }}
                >
                  <ZoomInIcon />
                </IconButton>
                
                <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                  <Chip
                    label={selectedVersion.rarity_code}
                    sx={{
                      bgcolor: getRarityColor(selectedVersion.rarity_code),
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
                    }}
                  />
                </Box>
                
                <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                  <Chip
                    label={selectedVersion.stock > 0 ? `재고 ${selectedVersion.stock}개` : '품절'}
                    color={selectedVersion.stock > 0 ? 'success' : 'error'}
                    variant="filled"
                  />
                </Box>
              </Box>
            </Card>

            {/* 버전 선택 탭 */}
            <Paper sx={{ mb: 2 }}>
              <Tabs
                value={selectedVersionIndex}
                onChange={handleVersionChange}
                variant="fullWidth"
                sx={{ borderBottom: 1, borderColor: 'divider' }}
              >
                {cardData.versions.map((version, index) => (
                  <StyledTab
                    key={version.id}
                    label={version.version_name}
                    icon={
                      <Chip
                        label={version.rarity_code}
                        size="small"
                        sx={{
                          bgcolor: getRarityColor(version.rarity_code),
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    }
                  />
                ))}
              </Tabs>
            </Paper>

            {/* 버전별 미리보기 */}
            <Grid container spacing={1}>
              {cardData.versions.map((version, index) => (
                <Grid item xs={4} key={version.id}>
                  <VersionCard
                    selected={selectedVersionIndex === index}
                    onClick={() => setSelectedVersionIndex(index)}
                  >
                    <Box
                      component="img"
                      src={version.image_url}
                      alt={version.version_name}
                      sx={{ width: '100%', height: 120, objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1, textAlign: 'center' }}>
                      <Typography variant="caption" display="block">
                        {version.version_name}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                        ₩{version.our_price.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </VersionCard>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={7}>
            {/* 카드 기본 정보 및 가격 */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {cardData.name_kr}
                  </Typography>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    {cardData.name} / {cardData.name_jp}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    [{cardData.set_code}-{cardData.card_number}] {cardData.set_name_kr}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Stack direction="row" spacing={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        우리 매장
                      </Typography>
                      <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                        ₩{selectedVersion.our_price.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        최저가
                      </Typography>
                      <Typography variant="h5" color="error" sx={{ fontWeight: 'bold' }}>
                        ₩{selectedVersion.lowest_price.toLocaleString()}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Paper>

            {/* 최저가 추이 차트 */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                <TimelineIcon sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  최저가 추이
                </Typography>
              </Stack>
              <PriceChart data={priceHistory} selectedVersion={selectedVersion} />
            </Paper>

            {/* 매장별 재고 및 가격 비교 */}
            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                <StoreIcon sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  매장별 재고 현황
                </Typography>
              </Stack>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>매장</TableCell>
                      <TableCell>버전</TableCell>
                      <TableCell align="right">가격</TableCell>
                      <TableCell align="center">재고</TableCell>
                      <TableCell align="center">상태</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow sx={{ bgcolor: 'primary.50' }}>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <StoreIcon color="primary" fontSize="small" />
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            광주
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={selectedVersion.version_name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          ₩{selectedVersion.our_price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {selectedVersion.stock}개
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={selectedVersion.stock > 0 ? '판매중' : '품절'}
                          size="small"
                          color={selectedVersion.stock > 0 ? 'success' : 'error'}
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                    
                    {/* 다른 매장 데이터 */}
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2">
                          부산
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="노멀"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                          ₩{selectedVersion.lowest_price.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          3개
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label="판매중"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                    
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2">
                          온라인
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="노멀"
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2">
                          ₩{(selectedVersion.lowest_price + 20).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography variant="body2">
                          10개
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label="판매중"
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default CardDetailPage;