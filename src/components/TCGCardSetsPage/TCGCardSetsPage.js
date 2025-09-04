import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  CardActions,
  Grid,
  Typography,
  Container,
  Tabs,
  Tab,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  Button,
  AppBar,
  Toolbar,
  Skeleton,
  Breadcrumbs,
  Link,
  Badge,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Fade,
  Grow,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  Stack,
  styled,
  Alert,
  Snackbar,
  IconButton
} from '@mui/material';

import {
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  CalendarMonth as CalendarIcon,
  Collections as CollectionsIcon,
  SportsEsports as PokemonIcon,
  Sailing as OnePieceIcon,
  Pets as DigimonIcon,
  NavigateNext as NavigateNextIcon,
  ShoppingCart as ShoppingCartIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// CardSetDetail 컴포넌트 import (실제 프로젝트에서는)
import CardSetDetail from '../CardSetDetailPage/CardSetDetailPage';

// API 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// API 클라이언트
const apiClient = {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  },

  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }
};

// API 서비스 함수들
const apiService = {
  getTCGGames: async () => {
    return apiClient.get('/games/');
  },

  getCardSets: async (gameSlug) => {
    return apiClient.get(`/games/${gameSlug}/sets/`);
  },

  getGameStats: async (gameSlug) => {
    return apiClient.get(`/games/${gameSlug}/statistics/`);
  },

  getSetCards: async (setCode, params = {}) => {
    return apiClient.get(`/sets/${setCode}/cards/`, params);
  }
};

// 유틸리티 함수들
const utils = {
  formatDate: (dateString) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
  },

  isNew: (releaseDate) => {
    if (!releaseDate) return false;
    const date = new Date(releaseDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return date > threeMonthsAgo;
  },

  getGameIcon: (gameName) => {
    const name = gameName.toLowerCase();
    if (name.includes('pokemon') || name.includes('포켓몬')) return <PokemonIcon />;
    if (name.includes('onepiece') || name.includes('원피스') || name.includes('one piece')) return <OnePieceIcon />;
    if (name.includes('digimon') || name.includes('디지몬')) return <DigimonIcon />;
    return <CollectionsIcon />;
  },

  getGameTheme: (gameSlug) => {
    const themes = {
      pokemon: { primary: '#FFCB05', secondary: '#3B5BA7', accent: '#FF6B6B' },
      onepiece: { primary: '#FF0000', secondary: '#000080', accent: '#FFD700' },
      digimon: { primary: '#FFA500', secondary: '#4169E1', accent: '#32CD32' }
    };
    return themes[gameSlug] || { primary: '#1976d2', secondary: '#42a5f5', accent: '#FF6B6B' };
  }
};

// 커스텀 스타일 컴포넌트
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
  },
  cursor: 'pointer',
}));

const GameHeaderBox = styled(Paper)(({ theme, gamecolor }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  background: `linear-gradient(135deg, ${gamecolor?.primary || '#1976d2'} 0%, ${gamecolor?.secondary || '#42a5f5'} 100%)`,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  borderRadius: theme.spacing(2),
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
  }
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
  fontSize: theme.typography.pxToRem(15),
  marginRight: theme.spacing(1),
  '&.Mui-selected': {
    fontWeight: theme.typography.fontWeightBold,
  },
}));

// 그리드 뷰 컴포넌트
const GridView = ({ sets, onSetClick }) => {
  return (
    <Grid container spacing={3}>
      {sets.map((set, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={set.id}>
          <Grow in={true} timeout={300 + index * 100}>
            <StyledCard onClick={() => onSetClick(set.set_code)}>
              <CardActionArea sx={{ flexGrow: 1 }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={set.image_url || `https://via.placeholder.com/400x280/1976d2/ffffff?text=${encodeURIComponent(set.name_kr || set.name)}`}
                    alt={set.name_kr || set.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Stack 
                    direction="row" 
                    spacing={1} 
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8 
                    }}
                  >
                    {set.is_new && (
                      <Chip
                        label="NEW"
                        size="small"
                        sx={{ 
                          bgcolor: 'error.main', 
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    )}
                  </Stack>
                </Box>
                
                <CardContent>
                  <Typography variant="caption" color="text.secondary" display="block">
                    {set.set_code}
                  </Typography>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {set.name_kr || set.name}
                  </Typography>
                  {set.name_kr && set.name && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {set.name}
                    </Typography>
                  )}
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {utils.formatDate(set.release_date)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
              
              <Divider />
              
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetClick(set.set_code);
                  }}
                >
                  카드 목록
                </Button>
                <Button size="small" color="secondary">
                  상세 정보
                </Button>
              </CardActions>
            </StyledCard>
          </Grow>
        </Grid>
      ))}
    </Grid>
  );
};

// 리스트 뷰 컴포넌트
const ListView = ({ sets, onSetClick }) => {
  return (
    <Paper>
      <List>
        {sets.map((set, index) => (
          <Fade in={true} timeout={300 + index * 50} key={set.id}>
            <Box>
              <ListItem
                sx={{
                  py: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
                onClick={() => onSetClick(set.set_code)}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={set.image_url || `https://via.placeholder.com/80x80/1976d2/ffffff?text=${encodeURIComponent((set.name_kr || set.name).substring(0, 2))}`}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        {set.set_code}
                      </Typography>
                      {set.is_new && (
                        <Chip label="NEW" size="small" color="error" />
                      )}
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {set.name_kr || set.name}
                      </Typography>
                      {set.name_kr && set.name && (
                        <Typography variant="body2" color="text.secondary">
                          {set.name}
                        </Typography>
                      )}
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          📅 {utils.formatDate(set.release_date)}
                        </Typography>
                        {set.game_name && (
                          <Typography variant="body2" color="text.secondary">
                            게임: {set.game_name}
                          </Typography>
                        )}
                      </Stack>
                    </>
                  }
                />
                
                <Stack direction="row" spacing={1}>
                  <Button 
                    variant="outlined" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSetClick(set.set_code);
                    }}
                  >
                    카드 목록
                  </Button>
                  <Button variant="contained" size="small">
                    상세 정보
                  </Button>
                </Stack>
              </ListItem>
              {index < sets.length - 1 && <Divider />}
            </Box>
          </Fade>
        ))}
      </List>
    </Paper>
  );
};

// 로딩 스켈레톤
const LoadingSkeleton = ({ viewMode }) => {
  if (viewMode === 'grid') {
    return (
      <Grid container spacing={3}>
        {[...Array(8)].map((_, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card>
              <Skeleton variant="rectangular" height={240} />
              <CardContent>
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
                <Stack direction="row" justifyContent="space-between" sx={{ mt: 2 }}>
                  <Skeleton variant="text" width="30%" />
                  <Skeleton variant="rounded" width={60} height={24} />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Paper>
      <List>
        {[...Array(5)].map((_, index) => (
          <Box key={index}>
            <ListItem sx={{ py: 2 }}>
              <ListItemAvatar>
                <Skeleton variant="rounded" width={80} height={80} sx={{ mr: 2 }} />
              </ListItemAvatar>
              <ListItemText
                primary={<Skeleton variant="text" width="20%" />}
                secondary={
                  <>
                    <Skeleton variant="text" width="40%" />
                    <Skeleton variant="text" width="30%" />
                    <Skeleton variant="text" width="50%" />
                  </>
                }
              />
              <Stack direction="row" spacing={1}>
                <Skeleton variant="rounded" width={80} height={32} />
                <Skeleton variant="rounded" width={80} height={32} />
              </Stack>
            </ListItem>
            {index < 4 && <Divider />}
          </Box>
        ))}
      </List>
    </Paper>
  );
};

// 에러 표시 컴포넌트
const ErrorDisplay = ({ error, onRetry, searchTerm }) => {
  return (
    <Paper sx={{ p: 4, textAlign: 'center' }}>
      <ErrorIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
      <Typography variant="h6" color="text.secondary">
        {error ? '데이터를 불러오는데 실패했습니다' : '카드 세트를 찾을 수 없습니다'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        {error 
          ? error
          : searchTerm 
            ? '검색어를 확인하거나 다른 게임을 선택해보세요.' 
            : '이 게임에는 아직 등록된 세트가 없습니다.'
        }
      </Typography>
      {error && onRetry && (
        <Button 
          variant="outlined" 
          onClick={onRetry} 
          sx={{ mt: 2 }}
          startIcon={<RefreshIcon />}
        >
          다시 시도
        </Button>
      )}
    </Paper>
  );
};

// 메인 컴포넌트
const TCGCardSetsManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // 상태 관리
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [cardSets, setCardSets] = useState([]);
  const [gameStats, setGameStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [cardSetsLoading, setCardSetsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('release_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');
  const [selectedCardNumber, setSelectedCardNumber] = useState(null);
  
  // 카드 세트 상세 페이지 관련 상태
  const [selectedSetCode, setSelectedSetCode] = useState(null);

  // 초기 데이터 로딩
  useEffect(() => {
    loadGames();
  }, []);

  // 게임 변경시 카드 세트 로딩
  useEffect(() => {
    if (selectedGame && !selectedSetCode) {
      loadCardSets(selectedGame);
      loadGameStats(selectedGame);
    }
  }, [selectedGame, selectedSetCode]);

  // API 호출 함수들
  const loadGames = async () => {
    try {
      setLoading(true);
      setError('');
      const gamesData = await apiService.getTCGGames();
      setGames(gamesData);
      
      // 첫 번째 게임을 기본 선택
      if (gamesData.length > 0) {
        setSelectedGame(gamesData[0].slug || gamesData[0].id);
      }
    } catch (err) {
      setError('게임 목록을 불러오는데 실패했습니다: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadCardSets = async (gameSlug) => {
    try {
      setCardSetsLoading(true);
      setError('');
      const setsData = await apiService.getCardSets(gameSlug);
      
      // 데이터에 is_new 속성 추가
      const setsWithNewFlag = setsData.map(set => ({
        ...set,
        is_new: utils.isNew(set.release_date)
      }));
      
      setCardSets(setsWithNewFlag);
    } catch (err) {
      setError('카드 세트 목록을 불러오는데 실패했습니다: ' + err.message);
      setCardSets([]);
    } finally {
      setCardSetsLoading(false);
    }
  };

  const loadGameStats = async (gameSlug) => {
    try {
      setStatsLoading(true);
      const stats = await apiService.getGameStats(gameSlug);
      setGameStats(stats);
    } catch (err) {
      console.error('통계 로딩 실패:', err);
      setGameStats({
        total_sets: 0,
        total_cards: 0,
        latest_set: null
      });
    } finally {
      setStatsLoading(false);
    }
  };

  // 이벤트 핸들러들
  const handleGameChange = (event, newGameSlug) => {
    if (newGameSlug !== null) {
      setSelectedGame(newGameSlug);
      setSelectedSetCode(null);
      setSearchTerm('');
    }
  };

  const handleSortChange = (newSort) => {
    if (sortBy === newSort) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSort);
      setSortOrder('desc');
    }
  };

  const handleRefresh = () => {
    if (selectedGame) {
      loadCardSets(selectedGame);
      loadGameStats(selectedGame);
    }
  };

  const handleSetClick = (setCode) => {
    setSelectedSetCode(setCode);
  };

  const handleCardClick = (cardNumber) => {
    setSelectedCardNumber(cardNumber);
  };

  const handleBackFromCard = () => {
    setSelectedCardNumber(null);
  };

  const handleBackToSets = () => {
    setSelectedSetCode(null);
  };

  // 필터링 및 정렬
  const filteredAndSortedSets = React.useMemo(() => {
    let filtered = cardSets.filter(set =>
      (set.name_kr || set.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.set_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'release_date') {
        comparison = new Date(a.release_date || '1900-01-01') - new Date(b.release_date || '1900-01-01');
      } else if (sortBy === 'name') {
        comparison = (a.name_kr || a.name).localeCompare(b.name_kr || b.name);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [cardSets, searchTerm, sortBy, sortOrder]);

  // 현재 게임 정보
  const currentGame = games.find(game => (game.slug || game.id) === selectedGame);
  const currentGameTheme = utils.getGameTheme(selectedGame);

  // 카드 세트 상세 페이지 렌더링
  if (selectedSetCode) {
    return (
      <CardSetDetail 
        setCode={selectedSetCode} 
        onBack={handleBackToSets}
        gameInfo={currentGame}
      />
    );
  }

  // 초기 로딩 중일 때
  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <Skeleton variant="rectangular" width={200} height={60} />
          <Typography>게임 목록을 불러오는 중...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* 에러 알림 */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      {/* 헤더 */}
      <AppBar position="sticky" sx={{ 
        background: `linear-gradient(90deg, ${currentGameTheme.primary} 0%, ${currentGameTheme.secondary} 100%)` 
      }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 4 }}>
            TCG Database
          </Typography>
          
          {games.length > 0 && (
            <Tabs
              value={selectedGame}
              onChange={handleGameChange}
              textColor="inherit"
              TabIndicatorProps={{
                sx: { backgroundColor: 'white', height: 3 }
              }}
              sx={{ flexGrow: 1 }}
            >
              {games.map((game) => (
                <StyledTab
                  key={game.id}
                  value={game.slug || game.id}
                  label={game.name_kr || game.name}
                  icon={utils.getGameIcon(game.name)}
                  iconPosition="start"
                />
              ))}
            </Tabs>
          )}

          <IconButton color="inherit" onClick={handleRefresh} disabled={cardSetsLoading}>
            <RefreshIcon />
          </IconButton>

          <IconButton color="inherit">
            <Badge badgeContent={3} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* 브레드크럼 */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2 }}>
          <Link href="#" underline="hover" color="inherit">홈</Link>
          <Link href="#" underline="hover" color="inherit">
            {currentGame?.name_kr || currentGame?.name}
          </Link>
          <Typography color="text.primary">카드 세트</Typography>
        </Breadcrumbs>

        {/* 게임 헤더 */}
        {currentGame && (
          <GameHeaderBox gamecolor={currentGameTheme} elevation={0}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Avatar 
                sx={{ 
                  width: 60, 
                  height: 60, 
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {utils.getGameIcon(currentGame.name)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {currentGame.name_kr || currentGame.name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                  {currentGame.name}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap">
                  <Chip
                    icon={<CollectionsIcon />}
                    label={`${filteredAndSortedSets.length}개 세트`}
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                  />
                  {!statsLoading && gameStats.total_sets && (
                    <Chip
                      label={`총 ${gameStats.total_sets}개 세트`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  )}
                  {!statsLoading && gameStats.total_cards && (
                    <Chip
                      label={`${gameStats.total_cards.toLocaleString()}장`}
                      sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                  )}
                  {statsLoading && (
                    <Skeleton variant="rounded" width={100} height={24} sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} />
                  )}
                </Stack>
              </Box>
            </Stack>
          </GameHeaderBox>
        )}

        {/* 검색 및 필터 바 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="세트 이름, 코드로 검색..."
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
            
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                <ToggleButtonGroup
                  value={sortBy}
                  exclusive
                  onChange={(e, value) => value && handleSortChange(value)}
                  size="small"
                >
                  <ToggleButton value="release_date">
                    <CalendarIcon sx={{ mr: 0.5 }} />
                    출시일
                    {sortBy === 'release_date' && (
                      sortOrder === 'desc' ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />
                    )}
                  </ToggleButton>
                  <ToggleButton value="name">
                    이름순
                    {sortBy === 'name' && (
                      sortOrder === 'desc' ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />
                    )}
                  </ToggleButton>
                </ToggleButtonGroup>
                
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
                    <ViewListIcon />
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* 카드 세트 목록 */}
        {cardSetsLoading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : filteredAndSortedSets.length === 0 ? (
          <ErrorDisplay 
            error={error} 
            onRetry={error ? handleRefresh : null} 
            searchTerm={searchTerm} 
          />
        ) : viewMode === 'grid' ? (
          <GridView sets={filteredAndSortedSets} onSetClick={handleSetClick} />
        ) : (
          <ListView sets={filteredAndSortedSets} onSetClick={handleSetClick} />
        )}
      </Container>
    </Box>
  );
};

export default TCGCardSetsManager;