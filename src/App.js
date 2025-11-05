// import './App.css';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TopBar from './components/TopBar/TopBar';

import MinimumPriceAdjust from './components/MinimumPriceAdjust/MinimumPriceAdjust';
// import TCGCardManager from './components/TCGCardManager/TCGCardManager';


function App() {

  return (
    <div className="App">
      <BrowserRouter>

          <TopBar />
          
          <Routes>
            <Route path="/minimumPriceAdjust" element={<MinimumPriceAdjust />}></Route>
          </Routes>


      </BrowserRouter>
    </div>
  );
}

export default App;
