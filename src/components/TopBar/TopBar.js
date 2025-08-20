import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link } from "react-router-dom";




export default function TopBar() {


    return (
        <>
            <Stack direction="row" spacing={2}>
                <Link to="/"><Typography variant='h4'>Home</Typography></Link>
                <Link to="/minimumPriceAdjust"><Typography variant='h4'>최저가 검색 적용</Typography></Link>
                <Link to="/storeInfo"><Typography variant='h4'>스토어 재고확인</Typography></Link>
                <Link to="/uploadTest"><Typography variant='h4'>uploadTest</Typography></Link>
            </Stack>
        </>
    )
}