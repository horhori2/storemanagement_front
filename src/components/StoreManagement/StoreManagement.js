import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Badge,
  LinearProgress,
  InputAdornment,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Search,
  FilterList,
  TrendingUp,
  TrendingDown,
  Remove,
  Inventory,
  LocalOffer,
  CalendarToday,
  Launch,
  Notifications,
  ShoppingCart,
  Favorite,
  Share,
  ExpandMore,
  Sort,
  ViewModule,
  ViewList,
  Analytics,
  TrendingFlat,
  ArrowBack,
  Home
} from '@mui/icons-material';

// 샘플 데이터
const sampleCardSets = [
  {
    code: 'OP12',
    name: 'Legacy of the Master',
    releaseDate: '2025-08-22',
    cardCount: 154,
    pricePercentage: 5.81,
    usdPrice: 0,
    eurPrice: 0,
    type: 'booster',
    stock: 0,
    trend: 'new',
    description: '최신 부스터팩으로 새로운 전설의 마스터들이 등장합니다.'
  },
  {
    code: 'OP11',
    name: 'A Fist of Divine Speed',
    releaseDate: '2025-06-06',
    cardCount: 155,
    pricePercentage: 33.33,
    usdPrice: 4825.57,
    eurPrice: 3334.70,
    type: 'booster',
    stock: 8,
    trend: 'up',
    description: '신속한 주먹으로 전장을 지배하는 강력한 캐릭터들의 등장'
  },
  {
    code: 'EB02',
    name: 'Anime 25th Collection',
    releaseDate: '2025-05-09',
    cardCount: 105,
    pricePercentage: 44.76,
    usdPrice: 6274.95,
    eurPrice: 4061.59,
    type: 'booster',
    stock: 3,
    trend: 'up',
    description: '애니메이션 25주년을 기념하는 특별 컬렉션'
  },
  {
    code: 'OP10',
    name: 'Royal Blood',
    releaseDate: '2025-03-21',
    cardCount: 151,
    pricePercentage: 62.91,
    usdPrice: 1158.84,
    eurPrice: 948.14,
    type: 'booster',
    stock: 15,
    trend: 'stable',
    description: '왕족의 피를 이어받은 강력한 전사들의 이야기'
  },
  {
    code: 'ST21',
    name: 'EX Gear 5',
    releaseDate: '2025-03-14',
    cardCount: 32,
    pricePercentage: 28.13,
    usdPrice: 72.37,
    eurPrice: 77.27,
    type: 'starter',
    stock: 12,
    trend: 'down',
    description: 'EX 시리즈의 기어 5 스타터 덱'
  },
  {
    code: 'ST13',
    name: 'Ultra Deck: The Three Brothers',
    releaseDate: '2024-04-19',
    cardCount: 35,
    pricePercentage: 80.00,
    usdPrice: 137.85,
    eurPrice: 112.58,
    type: 'starter',
    stock: 5,
    trend: 'up',
    description: '세 형제의 유대를 담은 울트라 덱'
  }
];

const sampleIndividualCards = [
  {
    id: 'OP11-001',
    name: 'Monkey D. Luffy (Gear 5)',
    set: 'OP11',
    rarity: 'SEC',
    type: 'Leader',
    color: 'Red',
    cost: 0,
    power: 5000,
    usdPrice: 89.99,
    eurPrice: 75.50,
    stock: 2,
    trend: 'up',
    image: 'https://via.placeholder.com/200x280/FF6B6B/FFFFFF?text=Luffy',
    description: '기어 5의 힘으로 각성한 루피의 최강 형태',
    priceHistory: [75, 80, 85, 89.99]
  },
  {
    id: 'OP10-062',
    name: 'Roronoa Zoro',
    set: 'OP10',
    rarity: 'SR',
    type: 'Character',
    color: 'Green',
    cost: 4,
    power: 5000,
    usdPrice: 24.99,
    eurPrice: 19.99,
    stock: 8,
    trend: 'stable',
    image: 'https://via.placeholder.com/200x280/4ECDC4/FFFFFF?text=Zoro',
    description: '삼도류의 달인, 조로의 새로운 모습',
    priceHistory: [20, 22, 25, 24.99]
  },
  {
    id: 'EB02-003',
    name: 'Portgas D. Ace',
    set: 'EB02',
    rarity: 'SR',
    type: 'Character',
    color: 'Red',
    cost: 5,
    power: 6000,
    usdPrice: 45.00,
    eurPrice: 38.50,
    stock: 1,
    trend: 'up',
    image: 'https://via.placeholder.com/200x280/FF8E53/FFFFFF?text=Ace',
    description: '불꽃의 힘을 가진 에이스의 특별한 카드',
    priceHistory: [35, 38, 42, 45.00]
  },
  {
    id: 'OP11-045',
    name: 'Trafalgar Law',
    set: 'OP11',
    rarity: 'R',
    type: 'Character',
    color: 'Blue',
    cost: 3,
    power: 4000,
    usdPrice: 8.99,
    eurPrice: 7.50,
    stock: 20,
    trend: 'stable',
    image: 'https://via.placeholder.com/200x280/45B7D1/FFFFFF?text=Law',
    description: '오페오페 열매의 능력자 트라팔가 로',
    priceHistory: [7, 8, 9, 8.99]
  },
  {
    id: 'ST21-001',
    name: 'Monkey D. Luffy (Gear 5)',
    set: 'ST21',
    rarity: 'L',
    type: 'Leader',
    color: 'Red',
    cost: 0,
    power: 5000,
    usdPrice: 15.99,
    eurPrice: 12.99,
    stock: 7,
    trend: 'down',
    image: 'https://via.placeholder.com/200x280/96CEB4/FFFFFF?text=Luffy+L',
    description: '스타터 덱의 리더 카드 버전',
    priceHistory: [18, 17, 16, 15.99]
  },
  {
    id: 'OP10-023',
    name: 'Nami',
    set: 'OP10',
    rarity: 'C',
    type: 'Character',
    color: 'Blue',
    cost: 1,
    power: 1000,
    usdPrice: 2.49,
    eurPrice: 1.99,
    stock: 35,
    trend: 'stable',
    image: 'https://via.placeholder.com/200x280/FFEAA7/333333?text=Nami',
    description: '밀짚모자 일당의 항해사 나미',
    priceHistory: [2, 2.2, 2.5, 2.49]
  }
];

// 탭 패널 컴포넌트
function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

// 메인 컴포넌트
function StoreManagement() {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [sortBy, setSortBy] = useState('releaseDate');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedSet, setSelectedSet] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [breadcrumb, setBreadcrumb] = useState(['세트별 보기']);

  // 필터링 및 정렬 로직
  const filteredSets = useMemo(() => {
    return sampleCardSets
      .filter(set => {
        const matchesSearch = set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            set.code.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || set.type === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'releaseDate') {
          return new Date(b.releaseDate) - new Date(a.releaseDate);
        } else if (sortBy === 'price') {
          return b.usdPrice - a.usdPrice;
        } else if (sortBy === 'name') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [searchTerm, filterType, sortBy]);

  const filteredCards = useMemo(() => {
    const cardsToFilter = selectedSet 
      ? sampleIndividualCards.filter(card => card.set === selectedSet.code)
      : sampleIndividualCards;
      
    return cardsToFilter.filter(card => {
      const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           card.set.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRarity = filterRarity === 'all' || card.rarity === filterRarity;
      return matchesSearch && matchesRarity;
    });
  }, [searchTerm, filterRarity, selectedSet]);

  // 핸들러 함수들
  const handleSetSelect = (set) => {
    setSelectedSet(set);
    setSelectedCard(null);
    setBreadcrumb(['세트별 보기', set.name]);
  };

  const handleCardSelect = (card) => {
    setSelectedCard(card);
    if (selectedSet) {
      setBreadcrumb(['세트별 보기', selectedSet.name, card.name]);
    } else {
      setBreadcrumb(['전체 카드', card.name]);
    }
  };

  const handleBackToSets = () => {
    setSelectedSet(null);
    setSelectedCard(null);
    setBreadcrumb(['세트별 보기']);
  };

  const handleBackToSetCards = () => {
    setSelectedCard(null);
    setBreadcrumb(['세트별 보기', selectedSet.name]);
  };

  // 유틸리티 함수들
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />;
      case 'down':
        return <TrendingDown sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'new':
        return <Chip label="NEW" size="small" color="primary" variant="filled" />;
      default:
        return <TrendingFlat sx={{ color: 'grey.500', fontSize: 20 }} />;
    }
  };

  const getStockChip = (stock) => {
    if (stock === 0) {
      return <Chip label="품절" size="small" color="error" />;
    } else if (stock <= 3) {
      return <Chip label={`재고 ${stock}`} size="small" color="warning" />;
    } else {
      return <Chip label={`재고 ${stock}`} size="small" color="success" />;
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      'SEC': 'error',
      'SR': 'warning', 
      'R': 'info',
      'C': 'default',
      'L': 'primary'
    };
    return colors[rarity] || 'default';
  };

  const formatPrice = (price, currency = 'USD') => {
    if (price === 0) return '-';
    const symbol = currency === 'USD' ? '$' : '€';
    return `${symbol}${price.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* 앱바 */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            TCG Card Database
          </Typography>
          <IconButton color="inherit">
            <Notifications />
          </IconButton>
          <IconButton color="inherit">
            <ShoppingCart />
          </IconButton>
          <Avatar sx={{ ml: 2 }}>U</Avatar>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* 헤더 섹션 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
            Card Price Database
          </Typography>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            카드 가격 검색 및 재고 확인 시스템
          </Typography>
        </Box>

        {/* 검색 및 필터 섹션 */}
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="카드명, 세트 코드, 캐릭터 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'white' }}
              />
            </Grid>
            
            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>타입 필터</InputLabel>
                <Select
                  value={filterType}
                  label="타입 필터"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="booster">부스터팩</MenuItem>
                  <MenuItem value="starter">스타터덱</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>레어도</InputLabel>
                <Select
                  value={filterRarity}
                  label="레어도"
                  onChange={(e) => setFilterRarity(e.target.value)}
                >
                  <MenuItem value="all">전체</MenuItem>
                  <MenuItem value="SEC">SEC</MenuItem>
                  <MenuItem value="SR">SR</MenuItem>
                  <MenuItem value="R">R</MenuItem>
                  <MenuItem value="C">C</MenuItem>
                  <MenuItem value="L">L</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={2}>
              <FormControl fullWidth>
                <InputLabel>정렬</InputLabel>
                <Select
                  value={sortBy}
                  label="정렬"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="releaseDate">출시일순</MenuItem>
                  <MenuItem value="price">가격순</MenuItem>
                  <MenuItem value="name">이름순</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={6} md={2}>
              <Box display="flex" gap={1}>
                <Button 
                  variant="outlined" 
                  startIcon={<LocalOffer />}
                  size="small"
                  fullWidth
                >
                  가격알림
                </Button>
                <Tooltip title="보기 모드 변경">
                  <IconButton 
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <ViewList /> : <ViewModule />}
                  </IconButton>
                </Tooltip>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 브레드크럼 네비게이션 */}
        {(selectedSet || selectedCard) && (
          <Box sx={{ mb: 3 }}>
            <Breadcrumbs aria-label="breadcrumb">
              <Link
                component="button"
                variant="body1"
                onClick={handleBackToSets}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                <Home sx={{ mr: 0.5, fontSize: 20 }} />
                세트별 보기
              </Link>
              {selectedSet && !selectedCard && (
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <Inventory sx={{ mr: 0.5, fontSize: 20 }} />
                  {selectedSet.name}
                </Typography>
              )}
              {selectedSet && selectedCard && (
                <Link
                  component="button"
                  variant="body1"
                  onClick={handleBackToSetCards}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  <Inventory sx={{ mr: 0.5, fontSize: 20 }} />
                  {selectedSet.name}
                </Link>
              )}
              {selectedCard && (
                <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocalOffer sx={{ mr: 0.5, fontSize: 20 }} />
                  {selectedCard.name}
                </Typography>
              )}
            </Breadcrumbs>
          </Box>
        )}

        {/* 탭 네비게이션 */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab 
              label={
                selectedCard ? selectedCard.name : 
                selectedSet ? `${selectedSet.name} 카드` : 
                "세트별 보기"
              } 
              icon={selectedCard ? <LocalOffer /> : selectedSet ? <Inventory /> : <ViewModule />} 
              iconPosition="start"
            />
            <Tab 
              label="전체 카드" 
              icon={<Inventory />} 
              iconPosition="start"
            />
            <Tab 
              label="가격 동향" 
              icon={<Analytics />} 
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* 세트별 보기 탭 */}
        <TabPanel value={currentTab} index={0}>
          {selectedCard ? (
            // 개별 카드 상세 페이지
            <Box>
              <Paper elevation={2} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={4}>
                  {/* 카드 이미지 */}
                  <Grid item xs={12} md={4}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Card elevation={4} sx={{ display: 'inline-block', borderRadius: 3 }}>
                        <CardMedia
                          component="img"
                          sx={{ width: 300, height: 420 }}
                          image={selectedCard.image}
                          alt={selectedCard.name}
                        />
                      </Card>
                      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Button variant="contained" startIcon={<ShoppingCart />}>
                          장바구니 추가
                        </Button>
                        <Button variant="outlined" startIcon={<Favorite />}>
                          즐겨찾기
                        </Button>
                      </Box>
                    </Box>
                  </Grid>

                  {/* 카드 정보 */}
                  <Grid item xs={12} md={8}>
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                      {selectedCard.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {selectedCard.id}
                    </Typography>
                    
                    <Box display="flex" gap={1} mb={3} flexWrap="wrap">
                      <Chip 
                        label={selectedCard.rarity} 
                        color={getRarityColor(selectedCard.rarity)} 
                        size="medium"
                      />
                      <Chip label={selectedCard.type} color="info" variant="outlined" />
                      <Chip label={selectedCard.color} color="primary" variant="outlined" />
                      <Chip label={`코스트 ${selectedCard.cost}`} variant="outlined" />
                      <Chip label={`파워 ${selectedCard.power?.toLocaleString()}`} variant="outlined" />
                    </Box>

                    {/* 가격 정보 */}
                    <Paper elevation={1} sx={{ p: 3, mb: 3, bgcolor: 'grey.50' }}>
                      <Typography variant="h6" gutterBottom>
                        현재 시세
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              USD 가격
                            </Typography>
                            <Typography variant="h4" color="primary" fontWeight="bold">
                              {formatPrice(selectedCard.usdPrice)}
                            </Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                              {getTrendIcon(selectedCard.trend)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {selectedCard.trend === 'up' ? '+12.5%' : 
                                 selectedCard.trend === 'down' ? '-8.2%' : '±0%'} (7일)
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box textAlign="center" sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              EUR 가격
                            </Typography>
                            <Typography variant="h4" color="primary" fontWeight="bold">
                              {formatPrice(selectedCard.eurPrice, 'EUR')}
                            </Typography>
                            <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                              {getTrendIcon(selectedCard.trend)}
                              <Typography variant="body2" sx={{ ml: 1 }}>
                                {selectedCard.trend === 'up' ? '+10.8%' : 
                                 selectedCard.trend === 'down' ? '-7.1%' : '±0%'} (7일)
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
                        {getStockChip(selectedCard.stock)}
                        <Typography variant="body2" color="text.secondary">
                          최종 업데이트: 2025년 8월 27일
                        </Typography>
                      </Box>
                    </Paper>

                    {/* 카드 설명 */}
                    <Paper elevation={1} sx={{ p: 3 }}>
                      <Typography variant="h6" gutterBottom>
                        카드 효과
                      </Typography>
                      <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                        {selectedCard.description}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          ) : !selectedSet ? (
            // 세트 목록 테이블
            <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>코드</strong></TableCell>
                    <TableCell><strong>세트명</strong></TableCell>
                    <TableCell align="center"><strong>출시일</strong></TableCell>
                    <TableCell align="center"><strong>카드 수</strong></TableCell>
                    <TableCell align="center"><strong>USD 가격</strong></TableCell>
                    <TableCell align="center"><strong>EUR 가격</strong></TableCell>
                    <TableCell align="center"><strong>재고</strong></TableCell>
                    <TableCell align="center"><strong>동향</strong></TableCell>
                    <TableCell align="center"><strong>액션</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSets.map((set) => (
                    <TableRow 
                      key={set.code} 
                      hover
                      sx={{ 
                        '&:hover': { bgcolor: 'action.hover', cursor: 'pointer' },
                      }}
                      onClick={() => handleSetSelect(set)}
                    >
                      <TableCell>
                        <Chip 
                          label={set.code} 
                          variant="outlined" 
                          size="small"
                          color={set.type === 'booster' ? 'primary' : 'secondary'}
                        />
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body1" fontWeight="medium" gutterBottom>
                            {set.name}
                          </Typography>
                          <LinearProgress 
                            variant="determinate" 
                            value={set.pricePercentage} 
                            sx={{ 
                              height: 6, 
                              borderRadius: 3,
                              bgcolor: 'grey.200'
                            }}
                            color={
                              set.pricePercentage > 60 ? 'success' : 
                              set.pricePercentage > 30 ? 'warning' : 'error'
                            }
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {set.pricePercentage}% 가격 데이터 수집완료
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" alignItems="center" justifyContent="center" gap={0.5}>
                          <CalendarToday sx={{ fontSize: 16, color: 'action.active' }} />
                          <Typography variant="body2">
                            {formatDate(set.releaseDate)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Badge badgeContent={set.cardCount} color="info" max={999}>
                          <Box sx={{ width: 24, height: 24 }} />
                        </Badge>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          color={set.usdPrice > 0 ? 'text.primary' : 'text.secondary'}
                          fontWeight="medium"
                        >
                          {formatPrice(set.usdPrice)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Typography 
                          variant="body2" 
                          color={set.eurPrice > 0 ? 'text.primary' : 'text.secondary'}
                          fontWeight="medium"
                        >
                          {formatPrice(set.eurPrice, 'EUR')}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getStockChip(set.stock)}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={`가격 ${set.trend === 'up' ? '상승' : set.trend === 'down' ? '하락' : '안정'}`}>
                          <Box display="flex" justifyContent="center">
                            {getTrendIcon(set.trend)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" gap={1} justifyContent="center">
                          <Tooltip title="카드 목록 보기">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetSelect(set);
                              }}
                            >
                              <Launch />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="위시리스트 추가">
                            <IconButton 
                              size="small" 
                              color="secondary"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Favorite />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            // 선택된 세트의 카드 목록
            <Box>
              <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h4" gutterBottom>
                      {selectedSet.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" gutterBottom>
                      {selectedSet.description}
                    </Typography>
                    <Box display="flex" gap={2} mt={2}>
                      <Chip 
                        icon={<CalendarToday />}
                        label={`출시일: ${formatDate(selectedSet.releaseDate)}`} 
                        variant="outlined" 
                      />
                      <Chip 
                        icon={<Inventory />}
                        label={`총 ${selectedSet.cardCount}장`} 
                        color="primary" 
                        variant="outlined" 
                      />
                      <Chip 
                        label={selectedSet.type === 'booster' ? '부스터팩' : '스타터덱'} 
                        color="secondary" 
                      />
                    </Box>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<ArrowBack />}
                    onClick={handleBackToSets}
                    size="large"
                  >
                    세트 목록으로
                  </Button>
                </Box>
              </Paper>

              {/* 세트 내 카드들을 그리드로 표시 */}
              <Grid container spacing={3}>
                {filteredCards.map((card) => (
                  <Grid item xs={6} sm={4} md={3} lg={2} key={card.id}>
                    <Card 
                      elevation={3} 
                      sx={{ 
                        height: '100%',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                        '&:hover': { 
                          transform: 'translateY(-8px)', 
                          boxShadow: 6 
                        },
                        borderRadius: 2
                      }}
                      onClick={() => handleCardSelect(card)}
                    >
                      <CardMedia
                        sx={{
                          height: 280,
                          position: 'relative',
                          bgcolor: 'grey.100'
                        }}
                        image={card.image}
                        title={card.name}
                      >
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            right: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1
                          }}
                        >
                          {getTrendIcon(card.trend)}
                          <IconButton 
                            size="small" 
                            sx={{ 
                              bgcolor: 'rgba(255,255,255,0.8)', 
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Favorite fontSize="small" />
                          </IconButton>
                        </Box>
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            top: 8, 
                            left: 8
                          }}
                        >
                          <Chip 
                            label={card.rarity} 
                            size="small" 
                            color={getRarityColor(card.rarity)}
                            sx={{ fontWeight: 'bold' }}
                          />
                        </Box>
                        <Box 
                          sx={{ 
                            position: 'absolute', 
                            bottom: 8, 
                            right: 8
                          }}
                        >
                          {getStockChip(card.stock)}
                        </Box>
                      </CardMedia>
                      
                      <CardContent sx={{ p: 2 }}>
                        <Typography variant="body2" component="h3" fontWeight="bold" noWrap>
                          {card.name}
                        </Typography>
                        
                        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                          <Typography variant="body2" color="primary" fontWeight="bold">
                            {formatPrice(card.usdPrice)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {card.id}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </TabPanel>

        {/* 전체 카드 탭 */}
        <TabPanel value={currentTab} index={1}>
          <Grid container spacing={3}>
            {sampleIndividualCards.map((card) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%',
                    transition: 'all 0.3s',
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'translateY(-8px)', 
                      boxShadow: 6 
                    },
                    borderRadius: 2
                  }}
                  onClick={() => handleCardSelect(card)}
                >
                  <CardMedia
                    sx={{
                      height: 220,
                      position: 'relative',
                      bgcolor: 'grey.100'
                    }}
                    image={card.image}
                    title={card.name}
                  >
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        right: 8,
                        display: 'flex',
                        gap: 1
                      }}
                    >
                      {getTrendIcon(card.trend)}
                      <IconButton 
                        size="small" 
                        sx={{ 
                          bgcolor: 'rgba(255,255,255,0.8)', 
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } 
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Favorite fontSize="small" />
                      </IconButton>
                    </Box>
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 8, 
                        left: 8
                      }}
                    >
                      <Chip 
                        label={card.rarity} 
                        size="small" 
                        color={getRarityColor(card.rarity)}
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>
                  </CardMedia>
                  
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="h6" component="h3" gutterBottom noWrap>
                      {card.name}
                    </Typography>
                    
                    <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                      <Chip label={card.set} size="small" variant="outlined" />
                      <Chip label={card.type} size="small" color="info" variant="outlined" />
                      <Chip label={card.color} size="small" color="primary" variant="outlined" />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        코스트: {card.cost} | 파워: {card.power?.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">USD</Typography>
                      <Typography variant="h6" color="primary" fontWeight="bold">
                        {formatPrice(card.usdPrice)}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="body2" color="text.secondary">EUR</Typography>
                      <Typography variant="body1" color="primary" fontWeight="bold">
                        {formatPrice(card.eurPrice, 'EUR')}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      {getStockChip(card.stock)}
                      <Box display="flex" gap={0.5}>
                        <Tooltip title="장바구니에 추가">
                          <IconButton 
                            size="small" 
                            color="primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ShoppingCart fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="공유">
                          <IconButton 
                            size="small"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                    
                    <Button 
                      variant="contained" 
                      fullWidth 
                      size="small"
                      startIcon={<Launch />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardSelect(card);
                      }}
                    >
                      상세보기
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        {/* 가격 동향 탭 */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                시장 가격 동향 분석
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                최근 30일간의 카드 가격 변동 추이와 시장 분석 리포트
              </Typography>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                    <TrendingUp />
                  </Avatar>
                </Box>
                <Typography variant="h3" color="success.main" fontWeight="bold" gutterBottom>
                  12
                </Typography>
                <Typography variant="h6" gutterBottom>
                  상승 중인 카드
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  지난 주 대비 평균 +15% 상승
                </Typography>
                <Chip 
                  label="+2.1% vs 어제" 
                  size="small" 
                  color="success" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'error.main', width: 56, height: 56 }}>
                    <TrendingDown />
                  </Avatar>
                </Box>
                <Typography variant="h3" color="error.main" fontWeight="bold" gutterBottom>
                  8
                </Typography>
                <Typography variant="h6" gutterBottom>
                  하락 중인 카드
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  지난 주 대비 평균 -8% 하락
                </Typography>
                <Chip 
                  label="-1.3% vs 어제" 
                  size="small" 
                  color="error" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ p: 3, textAlign: 'center', borderRadius: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
                  <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                    <TrendingFlat />
                  </Avatar>
                </Box>
                <Typography variant="h3" color="info.main" fontWeight="bold" gutterBottom>
                  25
                </Typography>
                <Typography variant="h6" gutterBottom>
                  안정적인 카드
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  변동폭 ±3% 이내 유지
                </Typography>
                <Chip 
                  label="±0.5% vs 어제" 
                  size="small" 
                  color="info" 
                  sx={{ mt: 1 }}
                />
              </Card>
            </Grid>

            {/* 차트 섹션 */}
            <Grid item xs={12}>
              <Paper elevation={2} sx={{ p: 4, borderRadius: 2 }}>
                <Typography variant="h5" gutterBottom>
                  가격 변동 차트
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  주요 카드들의 30일간 가격 변동 추이
                </Typography>
                <Box 
                  sx={{ 
                    height: 400, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    border: '2px dashed',
                    borderColor: 'grey.300'
                  }}
                >
                  <Box textAlign="center">
                    <Analytics sx={{ fontSize: 64, color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      가격 차트 영역
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Chart.js, Recharts, 또는 D3.js를 사용하여<br />
                      실시간 가격 차트를 구현할 수 있습니다
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* 인기 카드 순위 */}
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  가격 상승률 TOP 5
                </Typography>
                <List>
                  {[
                    { name: 'Monkey D. Luffy (Gear 5)', change: '+15.2%', price: '$89.99' },
                    { name: 'Portgas D. Ace', change: '+12.8%', price: '$45.00' },
                    { name: 'Roronoa Zoro', change: '+8.5%', price: '$24.99' },
                    { name: 'Trafalgar Law', change: '+6.2%', price: '$8.99' },
                    { name: 'Nami', change: '+4.1%', price: '$2.49' }
                  ].map((card, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: 'success.main', 
                            fontSize: 12 
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={card.name}
                        secondary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip label={card.change} size="small" color="success" />
                            <Typography variant="body2" fontWeight="bold">
                              {card.price}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  가격 하락률 TOP 5
                </Typography>
                <List>
                  {[
                    { name: 'Monkey D. Luffy (ST21)', change: '-8.2%', price: '$15.99' },
                    { name: 'Yamato', change: '-6.5%', price: '$4.53' },
                    { name: 'Big Mom Pirates', change: '-4.8%', price: '$13.28' },
                    { name: 'Animal Kingdom Pirates', change: '-3.2%', price: '$4.46' },
                    { name: 'Straw Hat Crew', change: '-2.1%', price: '$8.17' }
                  ].map((card, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: 'error.main', 
                            fontSize: 12 
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={card.name}
                        secondary={
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Chip label={card.change} size="small" color="error" />
                            <Typography variant="body2" fontWeight="bold">
                              {card.price}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* 시장 분석 아코디언 */}
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                상세 시장 분석
              </Typography>
              
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">주간 시장 리포트</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    이번 주 TCG 카드 시장은 전반적으로 상승세를 보였습니다. 
                    특히 원피스 TCG의 새로운 부스터팩 'Legacy of the Master' 출시 발표로 
                    관련 카드들의 가격이 크게 상승했습니다.
                  </Typography>
                  <Typography paragraph>
                    SEC(Secret) 레어도 카드들이 평균 12% 상승했으며, 
                    특히 루피 관련 카드들이 높은 인기를 보이고 있습니다.
                  </Typography>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">투자 추천 카드</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    현재 시점에서 투자 가치가 높은 카드들을 분석했습니다:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography component="li" paragraph>
                      <strong>단기 투자:</strong> 새로 출시될 세트의 프리뷰 카드들
                    </Typography>
                    <Typography component="li" paragraph>
                      <strong>중기 투자:</strong> 애니메이션 연동 이벤트 관련 카드들
                    </Typography>
                    <Typography component="li" paragraph>
                      <strong>장기 투자:</strong> 초기 세트 SEC 레어 카드들
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="h6">시장 리스크 분석</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography paragraph>
                    카드 시장 투자 시 고려해야 할 리스크 요인들:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Typography component="li" paragraph>
                      재인쇄(reprint) 발표로 인한 급격한 가격 하락 위험
                    </Typography>
                    <Typography component="li" paragraph>
                      메타게임 변화에 따른 카드 가치 변동
                    </Typography>
                    <Typography component="li" paragraph>
                      시장 과열로 인한 버블 현상 가능성
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </TabPanel>
      </Container>
    </Box>
  );
}

export default StoreManagement;