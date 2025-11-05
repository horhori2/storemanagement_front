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
  TextField,
  InputAdornment,
  AppBar,
  Toolbar,
  Skeleton,
  Breadcrumbs,
  Link,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Fade,
  useTheme,
  useMediaQuery,
  styled,
} from '@mui/material';

import {
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  FilterList as FilterListIcon,
  ViewModule as ViewModuleIcon,
  NavigateNext as NavigateNextIcon,
  ZoomIn as ZoomInIcon,
  Inventory as InventoryIcon,
  Collections as CollectionsIcon,
  ViewList
} from '@mui/icons-material';

// 전체 페이지 래퍼 (즉시 스타일 적용)
const PageWrapper = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isReady'
})(({ theme, isReady }) => ({
  minHeight: '100vh',
  backgroundColor: theme.palette.grey[50],
  opacity: isReady ? 1 : 0,
  transition: 'opacity 0.3s ease-in-out',
  // 초기 렌더링시 깜빡임 방지
  '& *': {
    visibility: isReady ? 'visible' : 'hidden'
  },
  // 스켈레톤은 항상 보이도록
  '& .MuiSkeleton-root': {
    visibility: 'visible !important'
  }
}));

// 컨텐츠 컨테이너
const ContentContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(3),
  paddingBottom: theme.spacing(3),
  position: 'relative'
}));

// 헤더 박스
const HeaderBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  borderRadius: theme.spacing(2),
}));

// 필터 칩
const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  ...(selected && {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  })
}));

// 페이지 스켈레톤 컴포넌트
const PageSkeleton = ({ onBack }) => (
  <PageWrapper isReady={true}>
    {/* 헤더 스켈레톤 */}
    <AppBar position="sticky">
      <Toolbar>
        <IconButton color="inherit" onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Skeleton variant="text" width={200} height={32} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
        <Box sx={{ flexGrow: 1 }} />
        <IconButton color="inherit">
          <FilterListIcon />
        </IconButton>
      </Toolbar>
    </AppBar>

    <ContentContainer maxWidth="xl">
      {/* 브레드크럼 스켈레톤 */}
      <Skeleton variant="text" width={300} height={20} sx={{ mb: 2 }} />

      {/* 헤더 박스 스켈레톤 */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main' }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Skeleton variant="circular" width={60} height={60} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1, bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2, bgcolor: 'rgba(255,255,255,0.2)' }} />
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={80} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
              <Skeleton variant="rounded" width={120} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* 검색 바 스켈레톤 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={40} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Skeleton variant="rounded" width={120} height={40} />
              <Skeleton variant="rounded" width={100} height={40} />
              <Skeleton variant="rounded" width={80} height={40} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 결과 통계 스켈레톤 */}
      <Skeleton variant="text" width={200} height={20} sx={{ mb: 2 }} />

      {/* 카드 그리드 영역 (빈 공간) */}
      <Box sx={{ height: '400px', bgcolor: '#f5f5f5', borderRadius: 1 }} />
    </ContentContainer>
  </PageWrapper>
);

// 메인 컴포넌트
const CardSetDetail = ({ setCode = 'SAMPLE', onBack, onCardClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // UI 준비 상태 관리
  const [isUIReady, setIsUIReady] = useState(false);
  const [isStylesReady, setIsStylesReady] = useState(false);

  // 기존 상태들...
  const [cardSet, setCardSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(new Set());
  
  // 필터 상태들...
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [sortBy, setSortBy] = useState('card_number');
  const [viewMode, setViewMode] = useState('grid');
  const [rarities, setRarities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // UI 준비 상태 관리
  useEffect(() => {
    // 스타일과 컴포넌트 준비 체크
    const prepareUI = async () => {
      // DOM이 준비될 때까지 대기
      await new Promise(resolve => {
        if (document.readyState === 'complete') {
          resolve();
        } else {
          window.addEventListener('load', resolve, { once: true });
        }
      });

      // 스타일 적용 대기
      await new Promise(resolve => setTimeout(resolve, 100));
      setIsStylesReady(true);

      // 추가 렌더링 준비 시간
      await new Promise(resolve => setTimeout(resolve, 50));
      setIsUIReady(true);
    };

    prepareUI();
  }, []);

  // 데이터 로딩 (기존 로직)
  useEffect(() => {
    if (setCode && isUIReady) {
      loadData();
    } 
  }, [setCode, isUIReady]);

  // 필터링 및 정렬 (기존 로직)
  useEffect(() => {
    if (isUIReady) {
      filterAndSortCards();
    }
  }, [cards, searchTerm, selectedRarity, sortBy, isUIReady]);

    // 기존 함수들... (loadData, filterAndSortCards, handleCardClick, handleImageLoad)
  const loadData = async () => {
    setLoading(true);
    setCardsLoading(true);
    setError(null);
    
    try {
      console.log(`=== 데이터 로딩 시작: ${setCode} ===`);
      
      // API 호출 로직 (기존과 동일)
      const [setInfo, cardsData] = await Promise.allSettled([
        apiService.fetchSetDetail(setCode),
        apiService.fetchSetCards(setCode)
      ]);

      // 세트 정보 처리 (기존과 동일)
      if (setInfo.status === 'fulfilled') {
        setCardSet({
          id: setInfo.value.id,
          set_code: setInfo.value.set_code,
          name: setInfo.value.name,
          name_kr: setInfo.value.name_kr,
          release_date: setInfo.value.release_date,
          game_name: setInfo.value.game_name || '카드 게임'
        });
      } else {
        setCardSet({
          id: 999,
          set_code: setCode,
          name: `Set ${setCode}`,
          name_kr: `세트 ${setCode}`,
          release_date: null,
          game_name: '카드 게임'
        });
      }

      setLoading(false);

      // 카드 목록 처리 (API 데이터 우선, 실패시 샘플 데이터)
      if (cardsData.status === 'fulfilled' && cardsData.value.length > 0) {
        const processedCards = cardsData.value.map(card => ({
          id: card.id,
          card_number: card.card_number,
          name: card.name,
          name_kr: card.name_kr,
          rarity_code: card.rarity_code || 'C',
          card_type: card.card_type || '캐릭터',
          cost: card.cost || 0,
          power: card.power,
          image_url: card.image_url || `https://via.placeholder.com/315x439/${getRarityColor(card.rarity_code || 'C').slice(1)}/ffffff?text=${encodeURIComponent(`${setCode}-${card.card_number}`)}`,
          price: card.price || 0,
          stock: card.stock || 0
        }));
        
        setCards(processedCards);
        const uniqueRarities = [...new Set(processedCards.map(card => card.rarity_code).filter(Boolean))];
        setRarities(uniqueRarities);
      } else {
        // API 실패시 샘플 데이터 사용
        const sampleCards = generateSampleCards(setCode);
        setCards(sampleCards);
        const uniqueRarities = [...new Set(sampleCards.map(card => card.rarity_code).filter(Boolean))];
        setRarities(uniqueRarities);
      }

      console.log('=== 데이터 로딩 완료 ===');
      
    } catch (err) {
      console.error('데이터 로딩 중 오류:', err);
      setError(err.message);
      
      setCardSet({
        id: 999,
        set_code: setCode,
        name: `Set ${setCode}`,
        name_kr: `세트 ${setCode}`,
        release_date: null,
        game_name: '카드 게임'
      });
      
      const sampleCards = generateSampleCards(setCode);
      setCards(sampleCards);
      const uniqueRarities = [...new Set(sampleCards.map(card => card.rarity_code).filter(Boolean))];
      setRarities(uniqueRarities);
      setLoading(false);
    } finally {
      setCardsLoading(false);
    }
  };
  
  const filterAndSortCards = () => {
    let filtered = cards.filter(card => {
      const matchesSearch = !searchTerm || 
        (card.name_kr && card.name_kr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (card.name && card.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        card.card_number.includes(searchTerm);
        
      const matchesRarity = selectedRarity === 'all' || card.rarity_code === selectedRarity;
      
      return matchesSearch && matchesRarity;
    });

    // 정렬
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'card_number':
          return a.card_number.localeCompare(b.card_number);
        case 'name':
          return (a.name_kr || a.name || '').localeCompare(b.name_kr || b.name || '');
        case 'rarity':
          return a.rarity_code.localeCompare(b.rarity_code);
        case 'cost':
          return (a.cost || 0) - (b.cost || 0);
        default:
          return 0;
      }
    });

    setFilteredCards(filtered);
  };

  const handleCardClick = (card) => {
    if (onCardClick) {
      onCardClick(card.card_number, setCode);
    }
  };

  const handleImageLoad = (cardId) => {
    setImagesLoaded(prev => new Set([...prev, cardId]));
  };

  // UI가 준비되지 않았으면 스켈레톤 표시
  if (!isUIReady || loading) {
    return <PageSkeleton onBack={onBack} />;
  }

  return (
    <PageWrapper isReady={true}>
      {/* 헤더 */}
      <AppBar position="sticky">
        <Toolbar>
          <IconButton color="inherit" onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 'bold', flexGrow: 1 }}>
            {cardSet?.name_kr || cardSet?.name || '카드 세트'}
          </Typography>
          <IconButton color="inherit" onClick={() => setShowFilters(!showFilters)}>
            <FilterListIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <ContentContainer maxWidth="xl">
        {/* 브레드크럼 */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link href="#" underline="hover" color="inherit" onClick={onBack}>
            카드 세트
          </Link>
          <Typography color="text.primary">
            {cardSet?.set_code} - {cardSet?.name_kr || cardSet?.name}
          </Typography>
        </Breadcrumbs>

        {/* 에러 표시 */}
        {error && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.50', border: 1, borderColor: 'error.200' }}>
            <Typography color="error.main">
              데이터 로딩 중 오류가 발생했습니다: {error}
            </Typography>
          </Paper>
        )}

        {/* 세트 정보 헤더 */}
        {cardSet && (
          <HeaderBox elevation={0}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.2)' }}>
                <CollectionsIcon />
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                  [{cardSet.set_code}] {cardSet.name_kr || cardSet.name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  {cardSet.name}
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Chip
                    icon={<CollectionsIcon />}
                    label={`${filteredCards.length}장`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    label={`출시일: ${formatDate(cardSet.release_date)}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    label={cardSet.game_name}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                </Stack>
              </Box>
            </Stack>
          </HeaderBox>
        )}

        {/* 검색 및 필터 바 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="카드 이름, 번호로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={8}>
              <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap" alignItems="center">
                {/* 희귀도 필터 */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>희귀도</InputLabel>
                  <Select
                    value={selectedRarity}
                    label="희귀도"
                    onChange={(e) => setSelectedRarity(e.target.value)}
                  >
                    <MenuItem value="all">전체</MenuItem>
                    {rarities.map(rarity => (
                      <MenuItem key={rarity} value={rarity}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: getRarityColor(rarity) 
                            }} 
                          />
                          {rarity}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* 정렬 옵션 */}
                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>정렬</InputLabel>
                  <Select
                    value={sortBy}
                    label="정렬"
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <MenuItem value="card_number">번호순</MenuItem>
                    <MenuItem value="name">이름순</MenuItem>
                    <MenuItem value="rarity">희귀도순</MenuItem>
                    <MenuItem value="cost">코스트순</MenuItem>
                  </Select>
                </FormControl>

                {/* 뷰 모드 */}
                <ToggleButtonGroup
                  value={viewMode}
                  exclusive
                  onChange={(e, value) => value && setViewMode(value)}
                  size="small"
                >
                  <ToggleButton value="grid">
                    <ViewModuleIcon />
                  </ToggleButton>
                  <ToggleButton value="list">
                    <ViewList />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Grid>
          </Grid>

          {/* 희귀도 필터 칩들 */}
          {showFilters && (
            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
              <Typography variant="subtitle2" gutterBottom>
                희귀도별 필터:
              </Typography>
              <Box>
                <FilterChip 
                  label="전체" 
                  selected={selectedRarity === 'all'}
                  onClick={() => setSelectedRarity('all')}
                />
                {rarities.map(rarity => (
                  <FilterChip
                    key={rarity}
                    label={rarity}
                    selected={selectedRarity === rarity}
                    onClick={() => setSelectedRarity(rarity)}
                    sx={{ 
                      borderColor: getRarityColor(rarity),
                      ...(selectedRarity === rarity && { 
                        bgcolor: getRarityColor(rarity),
                        color: 'white' 
                      })
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>

        {/* 결과 통계 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            총 {filteredCards.length}장의 카드
            {selectedRarity !== 'all' && ` (${selectedRarity} 희귀도)`}
          </Typography>
        </Box>

        {/* 카드 그리드/리스트 */}
        {viewMode === 'grid' ? (
          <FlexCardGrid 
            cards={filteredCards} 
            onCardClick={handleCardClick} 
            loading={cardsLoading}
            imagesLoaded={imagesLoaded}
            onImageLoad={handleImageLoad}
            isMobile={isMobile}
            isTablet={isTablet}
          />
        ) : (
          <CardList cards={filteredCards} onCardClick={handleCardClick} />
        )}
      </ContentContainer>
    </PageWrapper>
  );
};

// 유틸리티 함수들 (기존과 동일)
// formatDate, apiService, generateSampleCards, getRarityColor 등...
// 상수 정의
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

// 유틸리티 함수
const formatDate = (dateString) => {
  if (!dateString) return 'TBA';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  } catch {
    return 'TBA';
  }
};

// API 서비스
const apiService = {
  async fetchSetDetail(setCode) {
    const url = `${API_BASE_URL}/sets/?set_code=${setCode}&format=json`;
    console.log('세트 정보 API 호출:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('세트 정보 API 응답:', data);
    
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    
    if (data.results && Array.isArray(data.results) && data.results.length > 0) {
      return data.results[0];
    }
    
    if (data && data.set_code) {
      return data;
    }
    
    throw new Error('세트 정보를 찾을 수 없습니다');
  },

  async fetchSetCards(setCode) {
    const url = `${API_BASE_URL}/sets/${setCode}/cards/?format=json`;
    console.log('카드 목록 API 호출:', url);
    
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('카드 목록 API 응답:', data);
    
    if (Array.isArray(data)) {
      return data;
    }
    
    if (data.results && Array.isArray(data.results)) {
      return data.results;
    }
    
    return [];
  }
};

// 샘플 데이터 생성기
const generateSampleCards = (setCode, count = 24) => {
  const rarityList = ['C', 'UC', 'R', 'SR', 'SEC', 'L'];
  const cards = [];

  for (let i = 1; i <= count; i++) {
    const cardNumber = i.toString().padStart(3, '0');
    const rarity = rarityList[Math.floor(Math.random() * rarityList.length)];
    
    cards.push({
      id: i,
      card_number: cardNumber,
      name: `Sample Card ${cardNumber}`,
      name_kr: `샘플 카드 ${cardNumber}`,
      rarity_code: rarity,
      card_type: ['캐릭터', '이벤트', '스테이지'][Math.floor(Math.random() * 3)],
      cost: Math.floor(Math.random() * 10) + 1,
      power: rarity === 'L' ? null : Math.floor(Math.random() * 12000) + 1000,
      image_url: `https://via.placeholder.com/315x439/${getRarityColor(rarity).slice(1)}/ffffff?text=${encodeURIComponent(`${setCode}-${cardNumber}`)}`,
      price: Math.floor(Math.random() * 50000) + 1000,
      stock: Math.floor(Math.random() * 20)
    });
  }

  return cards;
};

// 카드 리스트 컴포넌트
const CardList = ({ cards, onCardClick }) => {
  if (cards.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          검색 조건에 맞는 카드가 없습니다
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      {cards.map((card, index) => (
        <Box
          key={card.id}
          sx={{ 
            p: 2, 
            borderBottom: index < cards.length - 1 ? 1 : 0, 
            borderColor: 'divider',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' }
          }}
          onClick={() => onCardClick(card)}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              component="img"
              src={card.image_url}
              alt={card.name_kr || card.name}
              sx={{ 
                width: 60, 
                height: 84, 
                objectFit: 'cover', 
                borderRadius: 1 
              }}
            />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                [{card.card_number}] {card.name_kr || card.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Chip 
                  label={card.rarity_code} 
                  size="small" 
                  sx={{ bgcolor: getRarityColor(card.rarity_code), color: 'white' }}
                />
                {card.price && (
                  <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                    ₩{card.price.toLocaleString()}
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>
        </Box>
      ))}
    </Paper>
  );
};

// Flex 컨테이너 (메인 래퍼)
const FlexContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  width: '100%',
  padding: theme.spacing(1),
}));

// 개별 카드 래퍼 (flex 아이템)
const CardWrapper = styled(Box)(({ theme }) => ({
  // 데스크탑: 6개 (calc((100% - 5*gap) / 6))
  flex: '0 0 calc(16.666% - 13.33px)',
  minWidth: 0, // flex 버그 방지
  
  // 반응형 설정
  [theme.breakpoints.down('md')]: {
    // 태블릿: 3개 (calc((100% - 2*gap) / 3))
    flex: '0 0 calc(33.333% - 10.67px)',
  },
  [theme.breakpoints.down('sm')]: {
    // 모바일: 2개 (calc((100% - 1*gap) / 2))
    flex: '0 0 calc(50% - 8px)',
  },
}));

// 카드 컨테이너
const StyledCard = styled(Card)(({ theme, rarity }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  backgroundColor: 'white',
  border: rarity === 'SR' || rarity === 'SEC' || rarity === 'L' ? 
    `2px solid ${getRarityColor(rarity)}` : 
    `1px solid ${theme.palette.divider}`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
    '& .card-overlay': {
      opacity: 1,
    }
  },
}));

// 카드 이미지 박스 (고정 비율)
const ImageBox = styled(Box)({
  position: 'relative',
  width: '100%',
  aspectRatio: '63/88', // 포켓몬 카드 비율
  overflow: 'hidden',
  backgroundColor: '#f5f5f5',
});

// 카드 이미지
const CardImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  transition: 'opacity 0.3s ease',
  display: 'block',
});

// 오버레이
const CardOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.8) 100%)',
  display: 'flex',
  alignItems: 'flex-end',
  justifyContent: 'center',
  padding: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2
}));

// 희귀도 색상 함수 (기존 함수 사용)
const getRarityColor = (rarity) => {
  const rarityColors = {
    'C': '#6B7280',
    'U': '#3B82F6', 
    'R': '#EF4444',
    'RR': '#8B5CF6',
    'SR': '#F59E0B',
    'SEC': '#EC4899',
    'L': '#10B981',
    'UC': '#059669'
  };
  return rarityColors[rarity] || '#6B7280';
};

// 스켈레톤 컴포넌트
const CardSkeleton = () => (
  <StyledCard>
    <ImageBox>
      <Skeleton 
        variant="rectangular" 
        width="100%" 
        height="100%" 
        animation="wave"
      />
    </ImageBox>
    <CardContent sx={{ p: 2, flex: 1 }}>
      <Skeleton variant="text" width="40%" height={16} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" height={20} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={16} />
    </CardContent>
  </StyledCard>
);

// 개별 카드 컴포넌트
const CardItem = ({ card, onCardClick, imagesLoaded, onImageLoad, index }) => (
  <CardWrapper>
    <Fade in timeout={300 + index * 30}>
      <StyledCard 
        rarity={card.rarity_code} 
        onClick={() => onCardClick(card)}
      >
        <ImageBox>
          {!imagesLoaded.has(card.id) && (
            <Skeleton 
              variant="rectangular" 
              width="100%" 
              height="100%" 
              animation="wave"
              sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            />
          )}
          <CardImage
            src={card.image_url}
            alt={card.name_kr || card.name}
            onLoad={() => onImageLoad(card.id)}
            style={{ 
              opacity: imagesLoaded.has(card.id) ? 1 : 0 
            }}
          />
          
          <CardOverlay className="card-overlay">
            <Tooltip title="클릭해서 상세 보기">
              <IconButton size="small" sx={{ color: 'white' }}>
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
          </CardOverlay>

          {/* 희귀도 배지 */}
          <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 3 }}>
            <Chip
              label={card.rarity_code}
              size="small"
              sx={{
                bgcolor: getRarityColor(card.rarity_code),
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.7rem'
              }}
            />
          </Box>

          {/* 재고 배지 */}
          {card.stock !== undefined && (
            <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 3 }}>
              <Badge 
                badgeContent={card.stock} 
                color={card.stock > 10 ? 'success' : card.stock > 0 ? 'warning' : 'error'}
                max={99}
              >
                <InventoryIcon sx={{ color: 'white', fontSize: 18 }} />
              </Badge>
            </Box>
          )}
        </ImageBox>

        <CardContent sx={{ p: 2, flex: 1, minHeight: '80px' }}>
          <Typography 
            variant="caption" 
            color="text.secondary" 
            display="block" 
            sx={{ mb: 0.5, fontSize: '0.7rem' }}
          >
            {card.card_number}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 'bold',
              fontSize: '0.85rem',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              minHeight: '2.6rem',
              mb: 1
            }}
          >
            {card.name_kr || card.name}
          </Typography>
          
          {card.price && (
            <Typography 
              variant="caption" 
              color="primary" 
              sx={{ 
                fontWeight: 'bold', 
                fontSize: '0.75rem',
                display: 'block'
              }}
            >
              ₩{card.price.toLocaleString()}
            </Typography>
          )}
        </CardContent>
      </StyledCard>
    </Fade>
  </CardWrapper>
);

// 메인 카드 그리드 컴포넌트
const FlexCardGrid = ({ cards, onCardClick, loading, imagesLoaded, onImageLoad }) => {
  // 스타일 로딩 상태 관리
  const [stylesLoaded, setStylesLoaded] = useState(false);

  useEffect(() => {
    // 스타일 로딩 완료 시점 감지
    const timer = setTimeout(() => setStylesLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // 스타일이 로딩되지 않았으면 빈 공간 표시
  if (!stylesLoaded) {
    return <Box sx={{ height: '400px', backgroundColor: '#f5f5f5' }} />;
  }

  if (loading) {
    return (
      <FlexContainer>
        {[...Array(24)].map((_, index) => (
          <CardSkeleton key={index} index={index} />
        ))}
      </FlexContainer>
    );
  }

  if (cards.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          검색 조건에 맞는 카드가 없습니다
        </Typography>
      </Paper>
    );
  }

  return (
    <FlexContainer>
      {cards.map((card, index) => (
        <CardItem
          key={card.id}
          card={card}
          onCardClick={onCardClick}
          imagesLoaded={imagesLoaded}
          onImageLoad={onImageLoad}
          index={index}
        />
      ))}
    </FlexContainer>
  );
};

export default CardSetDetail;