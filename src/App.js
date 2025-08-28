import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar/TopBar';

import MinimumPriceAdjust from './components/MinimumPriceAdjust/MinimumPriceAdjust';
import TCGStoreManager from './components/StoreManagement/StoreManagement';
import ExcelProcessor from './components/ExcelProcessor/ExcelProcessor';


function App() {

  return (
    <div className="App">
      <BrowserRouter>

          <TopBar />
          
          <Routes>
            <Route path="/minimumPriceAdjust" element={<MinimumPriceAdjust />}></Route>
            <Route path="/storeManagement" element={<TCGStoreManager />}></Route>
            <Route path="/excelProcessor" element={<ExcelProcessor />}></Route>
          </Routes>


      </BrowserRouter>
    </div>
  );
}

export default App;
