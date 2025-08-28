import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  Button,
  TextField,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Container,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Badge,
  Tooltip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Drawer,
  FormControlLabel,
  Switch,
  Slider,
  Stack,
  Autocomplete,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Fab,
  Pagination,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Breadcrumbs,
  Link,
  Menu,
  ListItemIcon
} from '@mui/material';

import {
  Search as SearchIcon,
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterListIcon,
  Close as CloseIcon,
  AttachMoney as AttachMoneyIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  LocalOffer as LocalOfferIcon,
  BarChart as BarChartIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  MoreVert as MoreVertIcon,
  NavigateNext as NavigateNextIcon,
  Store as StoreIcon,
  QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';

import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';

// API 설정 (실제 환경에서는 환경변수로 관리)
const API_BASE_URL = 'http://localhost:8000/api';

// ==================== 메인 앱 컴포넌트 ====================
const TCGStoreManager = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [cart, setCart] = useState([]);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' });
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const showNotification = (message, severity = 'info') => {
    setNotification({ open: true, message, severity });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* 헤더 */}
      <AppBar position="sticky" color="primary" elevation={2}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 2 }}>
            <StoreIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            TCG Store Manager
          </Typography>
          <Badge badgeContent={cart.length} color="error">
            <IconButton color="inherit">
              <ShoppingCartIcon />
            </IconButton>
          </Badge>
          <IconButton color="inherit" sx={{ ml: 2 }}>
            <SettingsIcon />
          </IconButton>
        </Toolbar>
        <Tabs value={selectedTab} onChange={handleTabChange} textColor="inherit" indicatorColor="secondary" variant="scrollable">
          <Tab label="대시보드" icon={<DashboardIcon />} iconPosition="start" />
          <Tab label="카드 검색" icon={<SearchIcon />} iconPosition="start" />
          <Tab label="재고 관리" icon={<InventoryIcon />} iconPosition="start" />
          <Tab label="판매" icon={<ShoppingCartIcon />} iconPosition="start" />
          <Tab label="가격 분석" icon={<TrendingUpIcon />} iconPosition="start" />
        </Tabs>
      </AppBar>

      {/* 메인 컨텐츠 */}
      <Container maxWidth="xl" sx={{ flexGrow: 1, py: 3 }}>
        {selectedTab === 0 && <DashboardComponent showNotification={showNotification} />}
        {selectedTab === 1 && <CardSearchComponent cart={cart} setCart={setCart} showNotification={showNotification} />}
        {selectedTab === 2 && <InventoryManagement showNotification={showNotification} />}
        {selectedTab === 3 && <SalesComponent cart={cart} setCart={setCart} showNotification={showNotification} />}
        {selectedTab === 4 && <PriceAnalysis />}
      </Container>

      {/* 알림 스낵바 */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert severity={notification.severity} onClose={() => setNotification({ ...notification, open: false })}>
          {notification.message}
        </Alert>
      </Snackbar>

      {/* 사이드 메뉴 */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <SideMenu onClose={() => setDrawerOpen(false)} />
      </Drawer>
    </Box>
  );
};

// ==================== 대시보드 컴포넌트 ====================
const DashboardComponent = ({ showNotification }) => {
  const [stats, setStats] = useState({
    totalCards: 0,
    totalValue: 0,
    lowStock: 0,
    todaySales: 0
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        대시보드
      </Typography>
      
      <Grid container spacing={3}>
        {/* 통계 카드들 */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">총 카드 종류</Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                {stats.totalCards.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">총 재고 가치</Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                ₩{(stats.totalValue / 10000).toFixed(0)}만
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">재고 부족</Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                {stats.lowStock}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6">오늘 매출</Typography>
              <Typography variant="h3" sx={{ mt: 2, fontWeight: 'bold' }}>
                ₩{(stats.todaySales / 10000).toFixed(0)}만
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* 차트 영역 */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>매출 추이</Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={generateSampleData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Area type="monotone" dataKey="sales" stroke="#1976d2" fill="#1976d2" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* 베스트셀러 */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>베스트셀러 TOP 5</Typography>
            <List>
              {[1, 2, 3, 4, 5].map((item) => (
                <ListItem key={item} divider>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>{item}</Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    primary={`샘플 카드 ${item}`}
                    secondary={`판매: ${100 - item * 10}장`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ==================== 카드 검색 컴포넌트 ====================
const CardSearchComponent = ({ cart, setCart, showNotification }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    game: 'all',
    set: 'all',
    rarity: 'all',
    inStock: false,
    priceMin: 0,
    priceMax: 1000000
  });
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCard, setSelectedCard] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);

  // 샘플 데이터
  useEffect(() => {
    setCards(generateSampleCards());
  }, []);

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      if (searchTerm && !card.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (filters.game !== 'all' && card.game !== filters.game) return false;
      if (filters.inStock && card.stock === 0) return false;
      if (card.price < filters.priceMin || card.price > filters.priceMax) return false;
      return true;
    });
  }, [cards, searchTerm, filters]);

  const addToCart = (card) => {
    setCart([...cart, card]);
    showNotification(`${card.name}을(를) 장바구니에 추가했습니다`, 'success');
  };

  return (
    <Box>
      {/* 검색 헤더 */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
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
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>게임</InputLabel>
            <Select
              value={filters.game}
              label="게임"
              onChange={(e) => setFilters({ ...filters, game: e.target.value })}
            >
              <MenuItem value="all">전체</MenuItem>
              <MenuItem value="pokemon">포켓몬</MenuItem>
              <MenuItem value="onepiece">원피스</MenuItem>
              <MenuItem value="digimon">디지몬</MenuItem>
            </Select>
          </FormControl>
          <FormControlLabel
            control={
              <Switch
                checked={filters.inStock}
                onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
              />
            }
            label="재고있음"
          />
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
          >
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {/* 카드 목록 */}
      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rectangular" height={300} />
            </Grid>
          ))}
        </Grid>
      ) : viewMode === 'grid' ? (
        <Grid container spacing={2}>
          {filteredCards.map((card) => (
            <Grid item xs={12} sm={6} md={3} lg={2} key={card.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={card.image}
                  alt={card.name}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedCard(card);
                    setDetailDialog(true);
                  }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {card.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.cardNumber}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={card.rarity}
                      size="small"
                      color={card.rarity === 'SR' ? 'warning' : 'default'}
                      sx={{ mr: 0.5 }}
                    />
                    {card.stock > 0 ? (
                      <Chip label={`재고: ${card.stock}`} size="small" color="success" />
                    ) : (
                      <Chip label="품절" size="small" color="error" />
                    )}
                  </Box>
                  <Typography variant="h6" sx={{ mt: 1, fontWeight: 'bold' }}>
                    ₩{card.price.toLocaleString()}
                  </Typography>
                </CardContent>
                <Box sx={{ p: 1 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="small"
                    disabled={card.stock === 0}
                    onClick={() => addToCart(card)}
                  >
                    장바구니 추가
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>이미지</TableCell>
                <TableCell>카드명</TableCell>
                <TableCell>번호</TableCell>
                <TableCell>레어도</TableCell>
                <TableCell align="right">재고</TableCell>
                <TableCell align="right">가격</TableCell>
                <TableCell align="center">작업</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredCards.map((card) => (
                <TableRow key={card.id} hover>
                  <TableCell>
                    <Avatar src={card.image} variant="rounded" />
                  </TableCell>
                  <TableCell>{card.name}</TableCell>
                  <TableCell>{card.cardNumber}</TableCell>
                  <TableCell>
                    <Chip label={card.rarity} size="small" />
                  </TableCell>
                  <TableCell align="right">
                    {card.stock > 0 ? (
                      <Chip label={card.stock} size="small" color="success" />
                    ) : (
                      <Chip label="품절" size="small" color="error" />
                    )}
                  </TableCell>
                  <TableCell align="right">₩{card.price.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      variant="contained"
                      disabled={card.stock === 0}
                      onClick={() => addToCart(card)}
                    >
                      추가
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* 카드 상세 다이얼로그 */}
      {selectedCard && (
        <CardDetailDialog
          card={selectedCard}
          open={detailDialog}
          onClose={() => setDetailDialog(false)}
          onAddToCart={addToCart}
        />
      )}
    </Box>
  );
};

// ==================== 재고 관리 컴포넌트 ====================
const InventoryManagement = ({ showNotification }) => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustDialog, setAdjustDialog] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState(0);
  const [adjustReason, setAdjustReason] = useState('');

  useEffect(() => {
    setInventoryItems(generateSampleInventory());
  }, []);

  const handleAdjustStock = () => {
    // API 호출
    showNotification(`재고가 조정되었습니다: ${selectedItem.name} ${adjustAmount > 0 ? '+' : ''}${adjustAmount}`, 'success');
    setAdjustDialog(false);
    setAdjustAmount(0);
    setAdjustReason('');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          재고 관리
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button variant="contained" startIcon={<UploadIcon />}>
            엑셀 업로드
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />}>
            엑셀 다운로드
          </Button>
          <Button variant="contained" color="success" startIcon={<QrCodeScannerIcon />}>
            바코드 스캔
          </Button>
        </Stack>
      </Box>

      {/* 재고 알림 */}
      <Alert severity="warning" sx={{ mb: 2 }}>
        <Typography variant="subtitle2">
          재고 부족 경고: 5개 상품이 최소 재고 수준 이하입니다
        </Typography>
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>카드 번호</TableCell>
              <TableCell>카드명</TableCell>
              <TableCell>레어도</TableCell>
              <TableCell align="right">현재 재고</TableCell>
              <TableCell align="right">예약</TableCell>
              <TableCell align="right">가용 재고</TableCell>
              <TableCell align="right">최소 재고</TableCell>
              <TableCell>위치</TableCell>
              <TableCell align="center">작업</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {inventoryItems.map((item) => (
              <TableRow 
                key={item.id}
                sx={{ 
                  bgcolor: item.currentStock <= item.minStock ? 'error.light' : 'inherit',
                  '&:hover': { bgcolor: 'action.hover' }
                }}
              >
                <TableCell>{item.cardNumber}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {item.name}
                    {item.isNew && <Chip label="NEW" size="small" color="primary" />}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip label={item.rarity} size="small" />
                </TableCell>
                <TableCell align="right">
                  <Typography 
                    color={item.currentStock <= item.minStock ? 'error' : 'inherit'}
                    fontWeight={item.currentStock <= item.minStock ? 'bold' : 'normal'}
                  >
                    {item.currentStock}
                  </Typography>
                </TableCell>
                <TableCell align="right">{item.reserved}</TableCell>
                <TableCell align="right">
                  <Typography fontWeight="bold">
                    {item.currentStock - item.reserved}
                  </Typography>
                </TableCell>
                <TableCell align="right">{item.minStock}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1}>
                    <Tooltip title="재고 조정">
                      <IconButton 
                        size="small"
                        onClick={() => {
                          setSelectedItem(item);
                          setAdjustDialog(true);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="이동">
                      <IconButton size="small">
                        <InventoryIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 재고 조정 다이얼로그 */}
      <Dialog open={adjustDialog} onClose={() => setAdjustDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>재고 조정</DialogTitle>
        <DialogContent>
          {selectedItem && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                {selectedItem.name} ({selectedItem.cardNumber})
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                현재 재고: {selectedItem.currentStock}
              </Typography>
              <TextField
                fullWidth
                type="number"
                label="조정 수량"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(parseInt(e.target.value))}
                helperText="양수는 입고, 음수는 출고"
                sx={{ mt: 2, mb: 2 }}
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="조정 사유"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdjustDialog(false)}>취소</Button>
          <Button variant="contained" onClick={handleAdjustStock}>확인</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ==================== 판매 컴포넌트 ====================
const SalesComponent = ({ cart, setCart, showNotification }) => {
  const [customerInfo, setCustomerInfo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const totalAmount = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);

  const processSale = () => {
    if (cart.length === 0) {
      showNotification('장바구니가 비어있습니다', 'warning');
      return;
    }
    // API 호출
    showNotification('판매가 처리되었습니다', 'success');
    setCart([]);
    setCustomerInfo('');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        판매
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              장바구니
            </Typography>
            {cart.length === 0 ? (
              <Alert severity="info">장바구니가 비어있습니다</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>카드명</TableCell>
                      <TableCell>번호</TableCell>
                      <TableCell align="right">단가</TableCell>
                      <TableCell align="center">수량</TableCell>
                      <TableCell align="right">소계</TableCell>
                      <TableCell align="center">삭제</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.cardNumber}</TableCell>
                        <TableCell align="right">₩{item.price.toLocaleString()}</TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity || 1}
                            onChange={(e) => {
                              const newCart = [...cart];
                              newCart[index].quantity = parseInt(e.target.value) || 1;
                              setCart(newCart);
                            }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          ₩{(item.price * (item.quantity || 1)).toLocaleString()}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setCart(cart.filter((_, i) => i !== index));
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              결제 정보
            </Typography>
            <TextField
              fullWidth
              label="고객 정보"
              value={customerInfo}
              onChange={(e) => setCustomerInfo(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>결제 방법</InputLabel>
              <Select
                value={paymentMethod}
                label="결제 방법"
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <MenuItem value="cash">현금</MenuItem>
                <MenuItem value="card">카드</MenuItem>
                <MenuItem value="transfer">계좌이체</MenuItem>
              </Select>
            </FormControl>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                상품 수: {cart.length}개
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 'bold' }}>
                총액: ₩{totalAmount.toLocaleString()}
              </Typography>
            </Box>
            
            <Button
              fullWidth
              variant="contained"
              size="large"
              onClick={processSale}
              disabled={cart.length === 0}
            >
              결제 처리
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ==================== 가격 분석 컴포넌트 ====================
const PriceAnalysis = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);

  useEffect(() => {
    setPriceHistory(generatePriceHistory());
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
        가격 분석
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              가격 추이 그래프
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={priceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip />
                <Legend />
                <Line type="monotone" dataKey="avgPrice" stroke="#8884d8" name="평균가" />
                <Line type="monotone" dataKey="minPrice" stroke="#82ca9d" name="최저가" />
                <Line type="monotone" dataKey="maxPrice" stroke="#ffc658" name="최고가" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              가격 급등 카드
            </Typography>
            <List>
              {[
                { name: '피카츄 VMAX', change: '+25%', price: '₩150,000' },
                { name: '루피 리더 패러렐', change: '+18%', price: '₩280,000' },
                { name: '뮤츠 GX', change: '+15%', price: '₩95,000' },
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.name}
                    secondary={`현재가: ${item.price}`}
                  />
                  <Chip 
                    label={item.change} 
                    color="success" 
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              가격 급락 카드
            </Typography>
            <List>
              {[
                { name: '이상해씨', change: '-12%', price: '₩8,000' },
                { name: '조로 SR', change: '-8%', price: '₩45,000' },
                { name: '파이리', change: '-5%', price: '₩12,000' },
              ].map((item, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={item.name}
                    secondary={`현재가: ${item.price}`}
                  />
                  <Chip 
                    label={item.change} 
                    color="error" 
                    size="small"
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

// ==================== 카드 상세 다이얼로그 컴포넌트 ====================
const CardDetailDialog = ({ card, open, onClose, onAddToCart }) => {
  const [tabValue, setTabValue] = useState(0);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{card.name}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Box sx={{ textAlign: 'center' }}>
              <img 
                src={card.image} 
                alt={card.name} 
                style={{ width: '100%', maxWidth: 300, borderRadius: 8 }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={7}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                카드 번호
              </Typography>
              <Typography variant="h6">{card.cardNumber}</Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Chip label={card.game} sx={{ mr: 1 }} />
              <Chip label={card.rarity} color="primary" sx={{ mr: 1 }} />
              {card.isFoil && <Chip label="포일" color="secondary" />}
            </Box>

            <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
              <Tab label="가격 정보" />
              <Tab label="재고 정보" />
              <Tab label="가격 추이" />
            </Tabs>

            <Box sx={{ mt: 2 }}>
              {tabValue === 0 && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2 }}>
                    ₩{card.price.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    시장 평균가: ₩{(card.price * 1.1).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    온라인 최저가: ₩{(card.price * 0.9).toLocaleString()}
                  </Typography>
                </Box>
              )}
              {tabValue === 1 && (
                <Box>
                  <Typography variant="body1">
                    현재 재고: {card.stock}장
                  </Typography>
                  <Typography variant="body1">
                    예약: 0장
                  </Typography>
                  <Typography variant="body1">
                    위치: A-12
                  </Typography>
                </Box>
              )}
              {tabValue === 2 && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    최근 30일 가격 변동
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={generatePriceHistory().slice(0, 7)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip />
                      <Line type="monotone" dataKey="avgPrice" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
        <Button 
          variant="contained" 
          onClick={() => {
            onAddToCart(card);
            onClose();
          }}
          disabled={card.stock === 0}
        >
          장바구니 추가
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// ==================== 사이드 메뉴 컴포넌트 ====================
const SideMenu = ({ onClose }) => {
  return (
    <Box sx={{ width: 250, p: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        메뉴
      </Typography>
      <List>
        <ListItem button>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="대시보드" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <InventoryIcon />
          </ListItemIcon>
          <ListItemText primary="재고 관리" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <ShoppingCartIcon />
          </ListItemIcon>
          <ListItemText primary="판매 관리" />
        </ListItem>
        <ListItem button>
          <ListItemIcon>
            <BarChartIcon />
          </ListItemIcon>
          <ListItemText primary="보고서" />
        </ListItem>
        <Divider sx={{ my: 1 }} />
        <ListItem button>
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="설정" />
        </ListItem>
      </List>
    </Box>
  );
};

// ==================== 유틸리티 함수들 ====================
const generateSampleCards = () => {
  const games = ['포켓몬', '원피스', '디지몬'];
  const rarities = ['C', 'UC', 'R', 'SR', 'HR', 'UR'];
  const cards = [];
  
  for (let i = 1; i <= 20; i++) {
    cards.push({
      id: i,
      name: `샘플 카드 ${i}`,
      cardNumber: `ST01-${String(i).padStart(3, '0')}`,
      game: games[i % 3],
      rarity: rarities[i % rarities.length],
      price: Math.floor(Math.random() * 50000) + 1000,
      stock: Math.floor(Math.random() * 20),
      image: `https://via.placeholder.com/200x280?text=Card${i}`,
      isFoil: i % 3 === 0
    });
  }
  
  return cards;
};

const generateSampleInventory = () => {
  const items = [];
  for (let i = 1; i <= 10; i++) {
    items.push({
      id: i,
      cardNumber: `OP01-${String(i).padStart(3, '0')}`,
      name: `카드 ${i}`,
      rarity: ['C', 'UC', 'R', 'SR'][i % 4],
      currentStock: Math.floor(Math.random() * 50),
      reserved: Math.floor(Math.random() * 5),
      minStock: 5,
      location: `A-${i}`,
      isNew: i <= 3
    });
  }
  return items;
};

const generateSampleData = () => {
  const data = [];
  const days = ['월', '화', '수', '목', '금', '토', '일'];
  
  days.forEach((day, index) => {
    data.push({
      date: day,
      sales: Math.floor(Math.random() * 1000000) + 500000,
    });
  });
  
  return data;
};

const generatePriceHistory = () => {
  const history = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    history.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      avgPrice: Math.floor(Math.random() * 20000) + 30000,
      minPrice: Math.floor(Math.random() * 15000) + 25000,
      maxPrice: Math.floor(Math.random() * 25000) + 35000,
    });
  }
  
  return history;
};

export default TCGStoreManager;