import './App.css';
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import UploadButton from './components/UploadButton/UploadButton';
import ExcelProcessor from './components/ExcelProcessor/ExcelProcessor';
import NaverStoreCardInfo from './components/NaverStoreCardInfo/NaverStoreCardInfo';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TopBar from './components/TopBar/TopBar';

function ApiCallComponent(props) {
    return (
      <>

      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">API 호출 테스트</h2>
      
      <button
        onClick={props.handleApiCall}
        disabled={props.loading}
        className={`w-full py-2 px-4 rounded font-medium transition-colors ${
          props.loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700'
        } text-white`}
      >
        {props.loading ? '로딩 중...' : 'API 호출하기'}
      </button>

      {/* 응답 데이터 표시 */}
      {props.data && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800 mb-2">응답 데이터:</h3>
          <pre className="text-sm text-green-700 overflow-auto">
            {JSON.stringify(props.data, null, 2)}
          </pre>
        </div>
      )}

      {/* 에러 메시지 표시 */}
      {props.error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800 mb-2">에러 발생:</h3>
          <p className="text-sm text-red-700">{props.error}</p>
        </div>
      )}
    </div>
      </>
    
    );
}

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApiCall = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/hello/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      console.log('API 응답:', result);
    } catch (err) {
      setError(err.message);
      console.error('API 호출 에러:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <BrowserRouter>

          <TopBar />
            <Routes>
            <Route path="/" element={<ApiCallComponent data={data} loading={loading} error={error} handleApiCall={handleApiCall} />}></Route>
            <Route path="/minimumPriceAdjust" element={<ExcelProcessor />}></Route>
            <Route path="/uploadTest" element={<UploadButton />}></Route>
            <Route path="/storeInfo" element={<NaverStoreCardInfo />}></Route>
          </Routes>


      </BrowserRouter>
    </div>
  );
}

export default App;
