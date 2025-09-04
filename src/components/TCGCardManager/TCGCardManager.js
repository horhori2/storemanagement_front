import React, { useState, useEffect } from 'react';
import TCGCardSetsManager from '../TCGCardSetsPage/TCGCardSetsPage';
import CardSetDetail from '../CardSetDetailPage/CardSetDetailPage';
import CardDetailPage from '../CardDetailPage/CardDetailPage';

// 페이지 타입 정의
const PAGE_TYPES = {
  CARD_SETS: 'CARD_SETS',
  SET_DETAIL: 'SET_DETAIL', 
  CARD_DETAIL: 'CARD_DETAIL'
};



// 메인 통합 컴포넌트
const TCGCardManager = () => {
  // 네비게이션 상태
  const [currentPage, setCurrentPage] = useState(PAGE_TYPES.CARD_SETS);
  const [selectedSetCode, setSelectedSetCode] = useState(null);
  const [selectedCardNumber, setSelectedCardNumber] = useState(null);
  const [navigationStack, setNavigationStack] = useState([]);

  // 카드 세트 목록으로 이동
  const goToCardSets = () => {
    setCurrentPage(PAGE_TYPES.CARD_SETS);
    setSelectedSetCode(null);
    setSelectedCardNumber(null);
    setNavigationStack([]);
  };

  // 카드 세트 상세로 이동
  const goToSetDetail = (setCode) => {
    setNavigationStack([{ page: currentPage, setCode: selectedSetCode, cardNumber: selectedCardNumber }]);
    setCurrentPage(PAGE_TYPES.SET_DETAIL);
    setSelectedSetCode(setCode);
    setSelectedCardNumber(null);
  };

  // 카드 상세로 이동
  const goToCardDetail = (cardNumber) => {
    setNavigationStack(prev => [...prev, { page: currentPage, setCode: selectedSetCode, cardNumber: selectedCardNumber }]);
    setCurrentPage(PAGE_TYPES.CARD_DETAIL);
    setSelectedCardNumber(cardNumber);
  };

  // 뒤로 가기
  const goBack = () => {
    if (navigationStack.length > 0) {
      const previousState = navigationStack[navigationStack.length - 1];
      setNavigationStack(prev => prev.slice(0, -1));
      setCurrentPage(previousState.page);
      setSelectedSetCode(previousState.setCode);
      setSelectedCardNumber(previousState.cardNumber);
    } else {
      goToCardSets();
    }
  };

  // 현재 페이지에 따른 렌더링
  if (currentPage === PAGE_TYPES.SET_DETAIL && selectedSetCode) {
    return (
      <CardSetDetail
        setCode={selectedSetCode}
        onBack={goBack}
        onCardClick={goToCardDetail}
      />
    );
  }

  if (currentPage === PAGE_TYPES.CARD_DETAIL && selectedCardNumber && selectedSetCode) {
    return (
      <CardDetailPage
        cardNumber={selectedCardNumber}
        setCode={selectedSetCode}
        onBack={goBack}
      />
    );
  }

  // 기본: 카드 세트 목록 (기존 TCGCardSetsManager 로직)
  return (
    <TCGCardSetsManager onSetClick={goToSetDetail} />
  );
};


export default TCGCardManager;