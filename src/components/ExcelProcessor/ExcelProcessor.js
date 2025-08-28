// TCGCardSets.jsx
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
  IconButton,
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
  Zoom,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Stack,
  styled,
  alpha
} from '@mui/material';

import {
  Search as SearchIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  CalendarMonth as CalendarIcon,
  NewReleases as NewReleasesIcon,
  TrendingUp as TrendingUpIcon,
  Collections as CollectionsIcon,
  SportsEsports as PokemonIcon,
  Sailing as OnePieceIcon,
  Pets as DigimonIcon,
  NavigateNext as NavigateNextIcon,
  ShoppingCart as ShoppingCartIcon,
  Sort as SortIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon
} from '@mui/icons-material';

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

// 메인 컴포넌트
const TCGCardSetsManager = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedGame, setSelectedGame] = useState('onepiece');
  const [cardSets, setCardSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('release_date');
  const [sortOrder, setSortOrder] = useState('desc');

  // 게임별 테마 색상
  const gameThemes = {
    pokemon: {
      primary: '#FFCB05',
      secondary: '#3B5BA7',
      accent: '#FF6B6B'
    },
    onepiece: {
      primary: '#FF0000',
      secondary: '#000080',
      accent: '#FFD700'
    },
    digimon: {
      primary: '#FFA500',
      secondary: '#4169E1',
      accent: '#32CD32'
    }
  };

  // 게임 정보
  const gameInfo = {
    pokemon: {
      title: '포켓몬 카드 게임',
      subtitle: 'Pokémon Trading Card Game',
      description: '1996년부터 시작된 세계적인 트레이딩 카드 게임',
      icon: <PokemonIcon />
    },
    onepiece: {
      title: '원피스 카드 게임',
      subtitle: 'ONE PIECE Card Game',
      description: '2022년 출시된 원피스 공식 트레이딩 카드 게임',
      icon: <OnePieceIcon />
    },
    digimon: {
      title: '디지몬 카드 게임',
      subtitle: 'DIGIMON Card Game',
      description: '2020년 리부트된 디지몬 트레이딩 카드 게임',
      icon: <DigimonIcon />
    }
  };

  useEffect(() => {
    fetchCardSets(selectedGame);
  }, [selectedGame]);

  const fetchCardSets = async (game) => {
    setLoading(true);
    // API 호출 시뮬레이션
    setTimeout(() => {
      setCardSets(generateSampleSets(game));
      setLoading(false);
    }, 500);
  };

  const handleGameChange = (event, newGame) => {
    if (newGame !== null) {
      setSelectedGame(newGame);
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

  // 필터링 및 정렬
  const filteredAndSortedSets = React.useMemo(() => {
    let filtered = cardSets.filter(set =>
      set.name_kr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      set.set_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'release_date') {
        comparison = new Date(a.release_date) - new Date(b.release_date);
      } else if (sortBy === 'name') {
        comparison = a.name_kr.localeCompare(b.name_kr);
      } else if (sortBy === 'cards') {
        comparison = a.total_cards - b.total_cards;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [cardSets, searchTerm, sortBy, sortOrder]);

  const currentGameInfo = gameInfo[selectedGame];
  const currentGameTheme = gameThemes[selectedGame];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* 헤더 */}
      <AppBar position="sticky" sx={{ 
        background: `linear-gradient(90deg, ${currentGameTheme.primary} 0%, ${currentGameTheme.secondary} 100%)` 
      }}>
        <Toolbar>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mr: 4 }}>
            TCG Database
          </Typography>
          
          <Tabs
            value={selectedGame}
            onChange={handleGameChange}
            textColor="inherit"
            TabIndicatorProps={{
              sx: { backgroundColor: 'white', height: 3 }
            }}
            sx={{ flexGrow: 1 }}
          >
            <StyledTab
              value="pokemon"
              label="포켓몬"
              icon={<PokemonIcon />}
              iconPosition="start"
            />
            <StyledTab
              value="onepiece"
              label="원피스"
              icon={<OnePieceIcon />}
              iconPosition="start"
            />
            <StyledTab
              value="digimon"
              label="디지몬"
              icon={<DigimonIcon />}
              iconPosition="start"
            />
          </Tabs>

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
          <Link href="#" underline="hover" color="inherit">
            홈
          </Link>
          <Link href="#" underline="hover" color="inherit">
            {currentGameInfo.title}
          </Link>
          <Typography color="text.primary">카드 세트</Typography>
        </Breadcrumbs>

        {/* 게임 헤더 */}
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
              {currentGameInfo.icon}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                {currentGameInfo.title}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                {currentGameInfo.subtitle}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2, opacity: 0.95 }}>
                {currentGameInfo.description}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Chip
                  icon={<CollectionsIcon />}
                  label={`${filteredAndSortedSets.length}개 세트`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
                <Chip
                  icon={<TrendingUpIcon />}
                  label={`총 ${filteredAndSortedSets.reduce((acc, set) => acc + set.total_cards, 0)}장`}
                  sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }}
                />
              </Stack>
            </Box>
          </Stack>
        </GameHeaderBox>

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
                  <ToggleButton value="cards">
                    카드수
                    {sortBy === 'cards' && (
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
        {loading ? (
          <LoadingSkeleton viewMode={viewMode} />
        ) : viewMode === 'grid' ? (
          <GridView sets={filteredAndSortedSets} />
        ) : (
          <ListView sets={filteredAndSortedSets} />
        )}
      </Container>
    </Box>
  );
};

// 그리드 뷰 컴포넌트
const GridView = ({ sets }) => {
  return (
    <Grid container spacing={3}>
      {sets.map((set, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={set.id}>
          <Grow in={true} timeout={300 + index * 100}>
            <StyledCard>
              <CardActionArea sx={{ flexGrow: 1 }}>
                <Box sx={{ position: 'relative' }}>
                  <CardMedia
                    component="img"
                    height="240"
                    image={set.logo_url}
                    alt={set.name_kr}
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
                    {set.isNew && (
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
                    {set.isPreOrder && (
                      <Chip
                        label="예약판매"
                        size="small"
                        sx={{ 
                          bgcolor: 'warning.main', 
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
                    {set.name_kr}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {set.name}
                  </Typography>
                  
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {set.release_date}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${set.total_cards}장`}
                      size="small"
                      variant="outlined"
                      color="primary"
                    />
                  </Stack>
                </CardContent>
              </CardActionArea>
              
              <Divider />
              
              <CardActions>
                <Button size="small" color="primary">
                  카드 목록
                </Button>
                <Button size="small" color="secondary">
                  가격 확인
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
const ListView = ({ sets }) => {
  return (
    <Paper>
      <List>
        {sets.map((set, index) => (
          <Fade in={true} timeout={300 + index * 50} key={set.id}>
            <Box>
              <ListItem
                sx={{
                  py: 2,
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    variant="rounded"
                    src={set.logo_url}
                    sx={{ width: 80, height: 80, mr: 2 }}
                  />
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        {set.set_code}
                      </Typography>
                      {set.isNew && (
                        <Chip label="NEW" size="small" color="error" />
                      )}
                      {set.isPreOrder && (
                        <Chip label="예약판매" size="small" color="warning" />
                      )}
                    </Stack>
                  }
                  secondary={
                    <>
                      <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                        {set.name_kr}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {set.name}
                      </Typography>
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          📅 {set.release_date}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          카드 수: {set.total_cards}장
                        </Typography>
                      </Stack>
                    </>
                  }
                />
                
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" size="small">
                    카드 목록
                  </Button>
                  <Button variant="contained" size="small">
                    가격 확인
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

// 샘플 데이터 생성
const generateSampleSets = (game) => {
  const setsData = {
    pokemon: [
      {
        id: 1,
        set_code: 'SV5',
        name: 'Cyber Judge',
        name_kr: '사이버 저지',
        release_date: '2024-01-26',
        total_cards: 108,
        isNew: true,
        isPreOrder: false,
        logo_url: 'https://via.placeholder.com/400x280/FFCB05/3B5BA7?text=사이버+저지'
      },
      {
        id: 2,
        set_code: 'SV4',
        name: 'Paradox Rift',
        name_kr: '패러독스 리프트',
        release_date: '2023-11-03',
        total_cards: 266,
        isNew: false,
        isPreOrder: false,
        logo_url: 'https://via.placeholder.com/400x280/4ECDC4/FFFFFF?text=패러독스+리프트'
      },
      // ... 더 많은 포켓몬 세트
    ],
    onepiece: [
      {
        id: 1,
        set_code: 'OP08',
        name: 'Two Legends',
        name_kr: '두 개의 전설',
        release_date: '2024-02-24',
        total_cards: 121,
        isNew: true,
        isPreOrder: true,
        logo_url: 'https://via.placeholder.com/400x280/FF0000/FFFFFF?text=두+개의+전설'
      },
      {
        id: 2,
        set_code: 'OP07',
        name: '500 Years in the Future',
        name_kr: '500년 후의 미래',
        release_date: '2023-11-25',
        total_cards: 118,
        isNew: true,
        isPreOrder: false,
        logo_url: 'https://via.placeholder.com/400x280/000080/FFFFFF?text=500년+후의+미래'
      },
      // ... 더 많은 원피스 세트
    ],
    digimon: [
      {
        id: 1,
        set_code: 'BT15',
        name: 'Exceed Apocalypse',
        name_kr: '익시드 아포칼립스',
        release_date: '2024-01-19',
        total_cards: 102,
        isNew: true,
        isPreOrder: false,
        logo_url: 'https://via.placeholder.com/400x280/4169E1/FFFFFF?text=익시드+아포칼립스'
      },
      // ... 더 많은 디지몬 세트
    ]
  };

  // 전체 세트 데이터 반환
  const fullSetsData = {
    pokemon: [...setsData.pokemon,
      { id: 3, set_code: 'SV3', name: 'Obsidian Flames', name_kr: '옵시디언 플레임', release_date: '2023-08-11', total_cards: 230, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/95E1D3/FFFFFF?text=옵시디언+플레임' },
      { id: 4, set_code: 'SV2', name: 'Paldea Evolved', name_kr: '팔데아 이볼브드', release_date: '2023-06-09', total_cards: 279, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/F3A683/FFFFFF?text=팔데아+이볼브드' }
    ],
    onepiece: [...setsData.onepiece,
      { id: 3, set_code: 'OP06', name: 'Wings of the Captain', name_kr: '날개를 펼친 선장', release_date: '2023-08-26', total_cards: 116, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/FFA500/FFFFFF?text=날개를+펼친+선장' },
      { id: 4, set_code: 'OP05', name: 'Awakening of the New Era', name_kr: '신시대의 주역', release_date: '2023-05-27', total_cards: 115, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/008000/FFFFFF?text=신시대의+주역' },
      { id: 5, set_code: 'OP04', name: 'Kingdoms of Intrigue', name_kr: '음모의 왕국', release_date: '2023-02-25', total_cards: 114, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/800080/FFFFFF?text=음모의+왕국' },
      { id: 6, set_code: 'OP03', name: 'Pillars of Strength', name_kr: '강자의 기둥', release_date: '2022-11-12', total_cards: 113, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/FF1493/FFFFFF?text=강자의+기둥' },
      { id: 7, set_code: 'OP02', name: 'Paramount War', name_kr: '정상결전', release_date: '2022-08-06', total_cards: 121, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/00CED1/FFFFFF?text=정상결전' },
      { id: 8, set_code: 'OP01', name: 'Romance Dawn', name_kr: '로맨스 던', release_date: '2022-07-22', total_cards: 121, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/FF4500/FFFFFF?text=로맨스+던' }
    ],
    digimon: [...setsData.digimon,
      { id: 2, set_code: 'BT14', name: 'Blast Ace', name_kr: '블래스트 에이스', release_date: '2023-10-13', total_cards: 102, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/FFA500/FFFFFF?text=블래스트+에이스' },
      { id: 3, set_code: 'BT13', name: 'Versus Royal Knights', name_kr: '버서스 로열 나이츠', release_date: '2023-07-28', total_cards: 102, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/FF6347/FFFFFF?text=버서스+로열+나이츠' },
      { id: 4, set_code: 'BT12', name: 'Across Time', name_kr: '어크로스 타임', release_date: '2023-04-28', total_cards: 112, isNew: false, isPreOrder: false, logo_url: 'https://via.placeholder.com/400x280/32CD32/FFFFFF?text=어크로스+타임' }
    ]
  };

  return fullSetsData[game] || [];
};

export default TCGCardSetsManager;