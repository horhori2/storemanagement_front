import React, { useState, useEffect } from 'react';
import {
  Box,
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
  Avatar,
  useTheme,
  useMediaQuery,
  Stack,
  styled,
  Alert,
  Snackbar,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  Collections as CollectionsIcon,
  SportsEsports as PokemonIcon,
  Sailing as OnePieceIcon,
  Pets as DigimonIcon,
  NavigateNext as NavigateNextIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

// 컴포넌트 imports (실제 프로젝트에서는 적절한 경로로 수정)
import CardSetDetail from '../CardSetDetailPage/CardSetDetailPage';
import CardDetailPage from '../CardDetailPage/CardDetailPage';

// API 설정
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

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
  },

  getSetDetail: async (setCode) => {
    return apiClient.get(`/sets/`, { set_code: setCode });
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

// 게시판 스타일 테이블 뷰 컴포넌트
const BoardView = ({ sets, onSetClick, sortBy, sortOrder, onSortChange }) => {
  const handleSort = (property) => {
    onSortChange(property);
  };

  const getSortIcon = (property) => {
    if (sortBy === property) {
      return sortOrder === 'desc' ? <ArrowDownIcon fontSize="small" /> : <ArrowUpIcon fontSize="small" />;
    }
    return null;
  };

  return (
    <TableContainer component={Paper} elevation={1}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.50' }}>
            <TableCell width="120">
              <Button
                onClick={() => handleSort('set_code')}
                sx={{ 
                  textTransform: 'none', 
                  color: 'text.primary',
                  fontWeight: 'bold',
                  justifyContent: 'flex-start',
                  p: 0
                }}
                endIcon={getSortIcon('set_code')}
              >
                세트 코드
              </Button>
            </TableCell>
            <TableCell>
              <Button
                onClick={() => handleSort('name')}
                sx={{ 
                  textTransform: 'none', 
                  color: 'text.primary',
                  fontWeight: 'bold',
                  justifyContent: 'flex-start',
                  p: 0
                }}
                endIcon={getSortIcon('name')}
              >
                세트명
              </Button>
            </TableCell>
            <TableCell width="120">
              <Button
                onClick={() => handleSort('release_date')}
                sx={{ 
                  textTransform: 'none', 
                  color: 'text.primary',
                  fontWeight: 'bold',
                  justifyContent: 'flex-start',
                  p: 0
                }}
                endIcon={getSortIcon('release_date')}
              >
                출시일
              </Button>
            </TableCell>
            <TableCell width="100" align="center">
              <Typography variant="subtitle2" fontWeight="bold">
                카드 수
              </Typography>
            </TableCell>
            <TableCell width="100" align="center">
              <Typography variant="subtitle2" fontWeight="bold">
                상태
              </Typography>
            </TableCell>
            <TableCell width="150" align="center">
              <Typography variant="subtitle2" fontWeight="bold">
                액션
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sets.map((set, index) => (
            <TableRow
              key={set.id}
              hover
              sx={{ 
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
                '&:last-child td': {
                  borderBottom: 0,
                }
              }}
              onClick={() => onSetClick(set.set_code)}
            >
              <TableCell>
                <Typography variant="body2" fontWeight="medium" color="primary">
                  {set.set_code}
                </Typography>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body1" fontWeight="medium">
                    {set.name_kr || set.name}
                  </Typography>
                  {set.name_kr && set.name && (
                    <Typography variant="body2" color="text.secondary">
                      {set.name}
                    </Typography>
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {utils.formatDate(set.release_date)}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Typography variant="body2">
                  {set.total_cards ? `${set.total_cards}장` : '-'}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {utils.isNew(set.release_date) && (
                  <Chip
                    label="NEW"
                    size="small"
                    color="error"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                )}
              </TableCell>
              <TableCell align="center">
                <Button
                  size="small"
                  variant="outlined"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetClick(set.set_code);
                  }}
                >
                  카드 목록
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      {sets.length === 0 && (
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            표시할 카드 세트가 없습니다.
          </Typography>
        </Box>
      )}
    </TableContainer>
  );
};

// 로딩 스켈레톤
const LoadingSkeleton = () => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'grey.50' }}>
            <TableCell width="120">
              <Skeleton variant="text" width="80%" />
            </TableCell>
            <TableCell>
              <Skeleton variant="text" width="60%" />
            </TableCell>
            <TableCell width="120">
              <Skeleton variant="text" width="70%" />
            </TableCell>
            <TableCell width="100">
              <Skeleton variant="text" width="60%" />
            </TableCell>
            <TableCell width="100">
              <Skeleton variant="text" width="50%" />
            </TableCell>
            <TableCell width="150">
              <Skeleton variant="text" width="70%" />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(8)].map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" />
              </TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="text" /></TableCell>
              <TableCell><Skeleton variant="rounded" width={40} height={20} /></TableCell>
              <TableCell><Skeleton variant="rounded" width={80} height={32} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
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
  
  // 페이지 상태 관리
  const [currentView, setCurrentView] = useState('sets'); // 'sets', 'cards', 'detail'
  const [selectedSetCode, setSelectedSetCode] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState(null);
  
  // 기존 상태들
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [cardSets, setCardSets] = useState([]);
  const [gameStats, setGameStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [cardSetsLoading, setCardSetsLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('release_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [error, setError] = useState('');

  // 초기 데이터 로딩
  useEffect(() => {
    loadGames();
  }, []);

  // 게임 변경시 카드 세트 로딩
  useEffect(() => {
    if (selectedGame && currentView === 'sets') {
      loadCardSets(selectedGame);
      loadGameStats(selectedGame);
    }
  }, [selectedGame, currentView]);

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
      // 게임 변경시 카드 세트 목록으로 돌아가기
      setCurrentView('sets');
      setSelectedSetCode(null);
      setSelectedCardNumber(null);
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

  // 네비게이션 핸들러들
  const handleSetClick = (setCode) => {
    setSelectedSetCode(setCode);
    setCurrentView('cards');
  };

  const handleCardClick = (cardNumber, setCode) => {
    setSelectedCardNumber(cardNumber);
    setSelectedSetCode(setCode); // 카드 상세에서 setCode도 필요
    setCurrentView('detail');
  };

  const handleBackToSets = () => {
    setCurrentView('sets');
    setSelectedSetCode(null);
    setSelectedCardNumber(null);
  };

  const handleBackToCards = () => {
    setCurrentView('cards');
    setSelectedCardNumber(null);
    // selectedSetCode는 유지
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
      } else if (sortBy === 'set_code') {
        comparison = a.set_code.localeCompare(b.set_code);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [cardSets, searchTerm, sortBy, sortOrder]);

  // 현재 게임 정보
  const currentGame = games.find(game => (game.slug || game.id) === selectedGame);
  const currentGameTheme = utils.getGameTheme(selectedGame);

  // 렌더링 분기
  if (currentView === 'detail') {
    return (
      <CardDetailPage 
        cardNumber={selectedCardNumber}
        setCode={selectedSetCode}
        onBack={handleBackToCards}
      />
    );
  }

  if (currentView === 'cards') {
    return (
      <CardSetDetail 
        setCode={selectedSetCode} 
        onBack={handleBackToSets}
        onCardClick={handleCardClick}
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

  // 카드 세트 목록 뷰 (기본 뷰)
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

        {/* 검색 바 */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
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
            
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" color="text.secondary">
                  총 {filteredAndSortedSets.length}개의 세트
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 카드 세트 목록 (게시판 스타일) */}
        {cardSetsLoading ? (
          <LoadingSkeleton />
        ) : filteredAndSortedSets.length === 0 ? (
          <ErrorDisplay 
            error={error} 
            onRetry={error ? handleRefresh : null} 
            searchTerm={searchTerm} 
          />
        ) : (
          <BoardView 
            sets={filteredAndSortedSets} 
            onSetClick={handleSetClick}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
          />
        )}
      </Container>
    </Box>
  );
};

export default TCGCardSetsManager;