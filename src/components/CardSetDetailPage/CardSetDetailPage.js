import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardMedia,
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
  alpha
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

// CardDetailPage import (실제 프로젝트에서는)
// import CardDetailPage from '../CardDetailPage/CardDetailPage';

// 희귀도 색상 함수
const getRarityColor = (rarity) => {
  const colors = {
    'C': '#757575',    // 회색
    'UC': '#4caf50',   // 초록
    'R': '#2196f3',    // 파랑
    'SR': '#ff9800',   // 주황
    'SEC': '#9c27b0',  // 보라
    'L': '#f44336'     // 빨강
  };
  return colors[rarity] || '#757575';
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

const CardOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
  display: 'flex',
  alignItems: 'flex-end',
  padding: theme.spacing(1),
  opacity: 0,
  transition: 'opacity 0.3s ease',
  zIndex: 2
}));

const HeaderBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
}));

const FilterChip = styled(Chip)(({ theme, selected }) => ({
  margin: theme.spacing(0.5),
  transition: 'all 0.2s ease',
  ...(selected && {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  })
}));

// 메인 컴포넌트
const CardSetDetail = ({ setCode, onBack, onCardClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // 상태 관리
  const [cardSet, setCardSet] = useState(null);
  const [cards, setCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [sortBy, setSortBy] = useState('card_number');
  const [viewMode, setViewMode] = useState('grid');
  
  // 필터 옵션
  const [rarities, setRarities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (setCode) {
      loadSetDetail();
      loadSetCards();
    }
  }, [setCode]);

  useEffect(() => {
    filterAndSortCards();
  }, [cards, searchTerm, selectedRarity, sortBy]);

  // API 호출 함수들
  const loadSetDetail = async () => {
    try {
      // 세트 정보 로드 (실제 API 엔드포인트에 맞게 조정)
      setCardSet({
        id: 1,
        set_code: setCode,
        name: 'Two Legends',
        name_kr: '두 개의 전설',
        release_date: '2024-02-24',
        game_name: '원피스 카드 게임'
      });
    } catch (error) {
      console.error('세트 정보 로드 실패:', error);
    }
  };

  const loadSetCards = async () => {
    try {
      setLoading(true);
      
      // 실제 API 호출 시뮬레이션
      setTimeout(() => {
        const sampleCards = [];
        const rarityList = ['C', 'UC', 'R', 'SR', 'SEC', 'L'];
        const cardCount = setCode === 'OP08' ? 21 : setCode === 'OP07' ? 18 : 15;

        for (let i = 1; i <= cardCount; i++) {
          const cardNumber = i.toString().padStart(3, '0');
          const rarity = rarityList[Math.floor(Math.random() * rarityList.length)];
          
          sampleCards.push({
            id: i,
            card_number: cardNumber,
            name: `Card ${cardNumber}`,
            name_kr: `카드 ${cardNumber}`,
            rarity_code: rarity,
            card_type: ['캐릭터', '이벤트', '스테이지'][Math.floor(Math.random() * 3)],
            cost: Math.floor(Math.random() * 10) + 1,
            power: rarity === 'L' ? null : Math.floor(Math.random() * 12000) + 1000,
            image_url: `https://via.placeholder.com/300x420/${getRarityColor(rarity).slice(1)}/ffffff?text=${encodeURIComponent(`${setCode}-${cardNumber}`)}`,
            price: Math.floor(Math.random() * 50000) + 1000,
            stock: Math.floor(Math.random() * 20)
          });
        }
        
        setCards(sampleCards);
        
        // 희귀도 추출
        const uniqueRarities = [...new Set(sampleCards.map(card => card.rarity_code).filter(Boolean))];
        setRarities(uniqueRarities);
        setLoading(false);
      }, 500);
      
    } catch (error) {
      console.error('카드 목록 로드 실패:', error);
      setLoading(false);
    }
  };

  // 필터링 및 정렬
  const filterAndSortCards = () => {
    let filtered = cards.filter(card => {
      const matchesSearch = !searchTerm || 
        card.name_kr.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          return (a.name_kr || a.name).localeCompare(b.name_kr || b.name);
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
    // 카드 상세 페이지로 이동
    if (onCardClick) {
      onCardClick(card.card_number);
    }
  };

  if (loading && cards.length === 0) {
    return <LoadingSkeleton onBack={onBack} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
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

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* 브레드크럼 */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link href="#" underline="hover" color="inherit" onClick={onBack}>
            카드 세트
          </Link>
          <Typography color="text.primary">
            {cardSet?.set_code} - {cardSet?.name_kr || cardSet?.name}
          </Typography>
        </Breadcrumbs>

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
                    label={`출시일: ${cardSet.release_date || 'TBA'}`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  <Chip
                    label={cardSet.game_name || '원피스 카드 게임'}
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

        {/* 카드 그리드 */}
        {viewMode === 'grid' ? (
          <CardGrid cards={filteredCards} onCardClick={handleCardClick} loading={loading} />
        ) : (
          <CardList cards={filteredCards} onCardClick={handleCardClick} loading={loading} />
        )}
      </Container>
    </Box>
  );
};

// 카드 그리드 컴포넌트
const CardGrid = ({ cards, onCardClick, loading }) => {
  if (loading) {
    return (
      <Grid container spacing={2}>
        {[...Array(12)].map((_, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
            <Skeleton variant="rectangular" height={280} />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="60%" />
          </Grid>
        ))}
      </Grid>
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
    <Grid container spacing={2}>
      {cards.map((card, index) => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={card.id}>
          <Fade in timeout={300 + index * 50}>
            <StyledCardContainer 
              rarity={card.rarity_code} 
              onClick={() => onCardClick(card)}
            >
              <Box sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  image={card.image_url}
                  alt={card.name_kr || card.name}
                  sx={{ 
                    aspectRatio: '5/7',
                    objectFit: 'cover'
                  }}
                />
                
                <CardOverlay className="card-overlay">
                  <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                    <Tooltip title="클릭해서 상세 보기">
                      <IconButton size="small" sx={{ color: 'white' }}>
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </CardOverlay>

                {/* 희귀도 배지 */}
                <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                  <Chip
                    label={card.rarity_code}
                    size="small"
                    sx={{
                      bgcolor: getRarityColor(card.rarity_code),
                      color: 'white',
                      fontWeight: 'bold'
                    }}
                  />
                </Box>

                {/* 재고 배지 */}
                {card.stock !== undefined && (
                  <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
                    <Badge 
                      badgeContent={card.stock} 
                      color={card.stock > 10 ? 'success' : card.stock > 0 ? 'warning' : 'error'}
                      max={99}
                    >
                      <InventoryIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Badge>
                  </Box>
                )}
              </Box>

              <CardContent sx={{ p: 1, flex: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  {card.card_number}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: '0.85rem',
                    lineHeight: 1.2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {card.name_kr || card.name}
                </Typography>
                
                {card.price && (
                  <Typography variant="caption" color="primary" sx={{ fontWeight: 'bold' }}>
                    ₩{card.price.toLocaleString()}
                  </Typography>
                )}
              </CardContent>
            </StyledCardContainer>
          </Fade>
        </Grid>
      ))}
    </Grid>
  );
};

// 카드 리스트 컴포넌트
const CardList = ({ cards, onCardClick }) => {
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
              sx={{ width: 60, height: 84, objectFit: 'cover', borderRadius: 1 }}
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

// 로딩 스켈레톤
const LoadingSkeleton = ({ onBack }) => (
  <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
    {/* 헤더 스켈레톤 */}
    <AppBar position="sticky">
      <Toolbar>
        <IconButton color="inherit" onClick={onBack} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Skeleton variant="text" width={200} height={32} />
      </Toolbar>
    </AppBar>

    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* 브레드크럼 스켈레톤 */}
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 2 }} />
      
      {/* 헤더 박스 스켈레톤 */}
      <Skeleton variant="rectangular" height={200} sx={{ mb: 3, borderRadius: 2 }} />
      
      {/* 검색바 스켈레톤 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={40} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Skeleton variant="rectangular" width={120} height={40} />
              <Skeleton variant="rectangular" width={100} height={40} />
              <Skeleton variant="rectangular" width={80} height={40} />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* 결과 통계 스켈레톤 */}
      <Skeleton variant="text" width="20%" height={20} sx={{ mb: 2 }} />
      
      {/* 카드 그리드 스켈레톤 */}
      <Grid container spacing={2}>
        {[...Array(24)].map((_, index) => (
          <Grid item xs={6} sm={4} md={3} lg={2} key={index}>
            <Card>
              <Skeleton variant="rectangular" height={280} />
              <CardContent sx={{ p: 1 }}>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  </Box>
);

export default CardSetDetail;