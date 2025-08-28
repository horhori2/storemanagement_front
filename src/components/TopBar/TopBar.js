import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import StoreIcon from "@mui/icons-material/Store";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Link } from "react-router-dom";

export default function TopBar() {
    const navItems = [
        { 
            path: "/", 
            label: "Home", 
            koreanLabel: "홈",
            icon: <HomeIcon sx={{ mr: 1 }} />
        },
        { 
            path: "/minimumPriceAdjust", 
            label: "최저가 검색 및 가격, 재고 수정", 
            icon: <SearchIcon sx={{ mr: 1 }} />
        },
        { 
            path: "/storeManagement", 
            label: "재고 확인 및 최저가 확인", 
            icon: <StoreIcon sx={{ mr: 1 }} />
        },
        { 
            path: "/excelProcessor", 
            label: "엑셀 업로드 테스트", 
            koreanLabel: "업로드 테스트",
            icon: <CloudUploadIcon sx={{ mr: 1 }} />
        }
    ];

    return (
        <AppBar 
            position="static" 
            elevation={2}
            sx={{ 
                backgroundColor: '#1976d2',
                background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)'
            }}
        >
            <Toolbar>
                <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography
                        variant="h5"
                        component="div"
                        sx={{
                            mr: 4,
                            fontWeight: 'bold',
                            color: 'white',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                        }}
                    >
                        화성스토어 관리
                    </Typography>
                    
                    <Stack direction="row" spacing={1}>
                        {navItems.map((item) => (
                            <Button
                                key={item.path}
                                component={Link}
                                to={item.path}
                                sx={{
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    textTransform: 'none',
                                    fontSize: '0.95rem',
                                    fontWeight: '500',
                                    px: 2,
                                    py: 1,
                                    borderRadius: 2,
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                                        transform: 'translateY(-1px)',
                                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                                    },
                                    '&:active': {
                                        transform: 'translateY(0px)'
                                    }
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </Button>
                        ))}
                    </Stack>
                </Box>
            </Toolbar>
        </AppBar>
    );
}