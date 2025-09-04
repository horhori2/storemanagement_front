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
  alpha
} from '@mui/material';

import {
  ArrowBack as ArrowBackIcon,
  NavigateNext as NavigateNextIcon,
  TrendingUp as TrendingUpIcon,
  Timeline as TimelineIcon,
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  ZoomIn as ZoomInIcon
} from '@mui/icons-material';

// 임시 차트 컴포넌트
const PriceChart = ({ data, selectedVersion }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ width: '100%', height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper sx={{ p: 3, textAlign: 'center', width: '100%', height: '100%' }}>
        <Typography variant="h6" gutterBottom>
          {selectedVersion?.version_name || '노멀'} 가격 추이
        </Typography>
        <Box sx={{ 
          width: '100%', 
          height: 200, 
          background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            가격 차트 영역
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (실제로는 Recharts 또는 Chart.js 사용)
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

// 커스텀 스타일 컴포넌트
const StyledCardContainer = styled(Card)(({ theme, rarity }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  background: rarity === 'SR' || rarity === 'SEC' ? 
    `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)` :
    'white',
  border: rarity === 'SR' || rarity === 'SEC' ? 
    `2px solid ${alpha(theme.palette.warning.main, 0.3)}` : 
    `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
    '& .card-overlay': {
      opacity: 1,
    }
  },
}));

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

const InfoCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center'
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
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              {[...Array(4)].map((_, index) => (
                <Grid item xs={3} key={index}>
                  <Skeleton variant="rectangular" height={80} />
                </Grid>
              ))}
            </Grid>
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


const CardDetailPage = ({ cardNumber, setCode, onBack }) => {
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
    setTimeout(() => {
      const sampleCard = {
        id: 1,
        card_number: cardNumber,
        name: 'Monkey.D.Luffy',
        name_kr: '몽키 D. 루피',
        name_jp: 'モンキー・D・ルフィ',
        set_code: setCode,
        set_name: 'Two Legends',
        set_name_kr: '두 개의 전설',
        card_type: '캐릭터',
        cost: 10,
        power: 12000,
        counter: 1000,
        color: ['빨강'],
        attribute: ['슈퍼루키', '밀짚모자 일당'],
        effect: '[기동 메인] 이 카드를 트래시에서 등장시킬 수 있다. 그 경우, 이 카드는 이 턴 중, 파워 -2000.',
        trigger: '[트리거] 이 카드를 손패에 가한다.',
        rarity_code: 'L',
        versions: [
          {
            id: 1,
            version_code: 'normal',
            version_name: '노멀',
            rarity_code: 'L',
            image_url: `https://via.placeholder.com/300x420/f44336/ffffff?text=${encodeURIComponent(`${setCode}-${cardNumber}+L`)}`,
            price: 15000,
            market_price: 14500,
            stock: 3,
            is_foil: false
          },
          {
            id: 2,
            version_code: 'parallel',
            version_name: '패러렐',
            rarity_code: 'L',
            image_url: `https://via.placeholder.com/300x420/9c27b0/ffffff?text=${encodeURIComponent(`${setCode}-${cardNumber}+P`)}`,
            price: 45000,
            market_price: 42000,
            stock: 1,
            is_foil: true
          },
          {
            id: 3,
            version_code: 'alt-art',
            version_name: '얼터너티브',
            rarity_code: 'SEC',
            image_url: `https://via.placeholder.com/300x420/e91e63/ffffff?text=${encodeURIComponent(`${setCode}-${cardNumber}+SEC`)}`,
            price: 85000,
            market_price: 78000,
            stock: 0,
            is_foil: true
          }
        ]
      };
      
      setCardData(sampleCard);
      setPriceHistory([
        { date: '2024-01-01', price: 12000 },
        { date: '2024-01-15', price: 13500 },
        { date: '2024-02-01', price: 15000 },
        { date: '2024-02-15', price: 14000 },
        { date: '2024-03-01', price: 15000 }
      ]);
      setLoading(false);
    }, 800);
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
      <AppBar position="sticky">
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
                        ₩{version.price.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </VersionCard>
                </Grid>
              ))}
            </Grid>
          </Grid>

          <Grid item xs={12} md={7}>
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
                  <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                    ₩{selectedVersion.price.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    시장가: ₩{selectedVersion.market_price.toLocaleString()}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<ShoppingCartIcon />}
                  disabled={selectedVersion.stock === 0}
                  sx={{ flex: 1 }}
                >
                  {selectedVersion.stock > 0 ? '장바구니 담기' : '품절'}
                </Button>
                <Button variant="outlined" size="large">
                  문의하기
                </Button>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <InfoCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      타입
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {cardData.card_type}
                    </Typography>
                  </InfoCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <InfoCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      코스트
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                      {cardData.cost}
                    </Typography>
                  </InfoCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <InfoCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      파워
                    </Typography>
                    <Typography variant="h6" color="error" sx={{ fontWeight: 'bold' }}>
                      {cardData.power?.toLocaleString() || '-'}
                    </Typography>
                  </InfoCard>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <InfoCard>
                    <Typography variant="subtitle2" color="text.secondary">
                      카운터
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {cardData.counter ? `+${cardData.counter}` : '-'}
                    </Typography>
                  </InfoCard>
                </Grid>
              </Grid>
            </Paper>

            {/* 카드 효과 정보 */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                카드 효과
              </Typography>
              
              {cardData.color && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    색상
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    {cardData.color.map((color, index) => (
                      <Chip key={index} label={color} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}

              {cardData.attribute && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    특징
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {cardData.attribute.map((attr, index) => (
                      <Chip key={index} label={attr} size="small" color="primary" variant="outlined" />
                    ))}
                  </Stack>
                </Box>
              )}

              {cardData.effect && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    효과
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    bgcolor: 'grey.100', 
                    p: 2, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    lineHeight: 1.6
                  }}>
                    {cardData.effect}
                  </Typography>
                </Box>
              )}

              {cardData.trigger && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    트리거
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    bgcolor: 'warning.50', 
                    p: 2, 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    lineHeight: 1.6,
                    border: 1,
                    borderColor: 'warning.200'
                  }}>
                    {cardData.trigger}
                  </Typography>
                </Box>
              )}
            </Paper>

            {/* 가격 차트 */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                <TimelineIcon sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  가격 추이
                </Typography>
              </Stack>
              <PriceChart data={priceHistory} selectedVersion={selectedVersion} />
            </Paper>

            {/* 버전별 가격 비교 */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                버전별 가격 비교
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>버전</TableCell>
                      <TableCell>희귀도</TableCell>
                      <TableCell align="right">판매가</TableCell>
                      <TableCell align="right">시장가</TableCell>
                      <TableCell align="center">재고</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cardData.versions.map((version) => (
                      <TableRow 
                        key={version.id}
                        selected={selectedVersion.id === version.id}
                        sx={{ cursor: 'pointer' }}
                        onClick={() => setSelectedVersionIndex(cardData.versions.indexOf(version))}
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              component="img"
                              src={version.image_url}
                              sx={{ width: 30, height: 42, objectFit: 'cover', borderRadius: 0.5 }}
                            />
                            <Typography variant="body2">
                              {version.version_name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={version.rarity_code}
                            size="small"
                            sx={{
                              bgcolor: getRarityColor(version.rarity_code),
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            ₩{version.price.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="text.secondary">
                            ₩{version.market_price.toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={version.stock > 0 ? version.stock : '품절'}
                            size="small"
                            color={version.stock > 0 ? 'success' : 'error'}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
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
