import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadButton from './components/UploadButton/UploadButton';
import ExcelProcessor from './components/ExcelProcessor/ExcelProcessor';
import NaverStoreCardInfo from './components/NaverStoreCardInfo/NaverStoreCardInfo';
import TopBar from './components/TopBar/TopBar';

function App() {

  return (
    <div className="App">
      <BrowserRouter>

          <TopBar />
            <Routes>
            <Route path="/minimumPriceAdjust" element={<ExcelProcessor />}></Route>
            <Route path="/uploadTest" element={<UploadButton />}></Route>
            <Route path="/storeInfo" element={<NaverStoreCardInfo />}></Route>
          </Routes>


      </BrowserRouter>
    </div>
  );
}

export default App;
