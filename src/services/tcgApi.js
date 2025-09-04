// src/services/tcgApi.js
import { apiClient, API_CONFIG } from '../config/api';

export class TCGApiService {
  // ========== TCG Games ==========
  
  /**
   * 모든 TCG 게임 목록 조회
   * @returns {Promise<Array>} 게임 목록
   */
  static async getTCGGames() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.GAMES);
      return response.results || response; // DRF pagination 대응
    } catch (error) {
      throw new Error('게임 목록을 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 특정 게임 상세 정보 조회
   * @param {string} gameSlug - 게임 slug 또는 ID
   * @returns {Promise<Object>} 게임 상세 정보
   */
  static async getGameDetail(gameSlug) {
    try {
      return await apiClient.get(`${API_CONFIG.ENDPOINTS.GAMES}${gameSlug}/`);
    } catch (error) {
      throw new Error('게임 정보를 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 게임별 통계 조회
   * @param {string} gameSlug - 게임 slug 또는 ID
   * @returns {Promise<Object>} 통계 정보
   */
  static async getGameStatistics(gameSlug) {
    try {
      return await apiClient.get(`${API_CONFIG.ENDPOINTS.GAMES}${gameSlug}/statistics/`);
    } catch (error) {
      console.warn('게임 통계를 불러올 수 없습니다:', error.message);
      return {
        total_sets: 0,
        total_cards: 0,
        latest_set: null
      };
    }
  }

  // ========== Card Sets ==========

  /**
   * 특정 게임의 카드 세트 목록 조회
   * @param {string} gameSlug - 게임 slug 또는 ID
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise<Array>} 카드 세트 목록
   */
  static async getGameCardSets(gameSlug, params = {}) {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.GAMES}${gameSlug}/sets/`, params);
      return response.results || response;
    } catch (error) {
      throw new Error('카드 세트 목록을 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 모든 카드 세트 조회 (필터링 가능)
   * @param {Object} filters - 필터 옵션
   * @returns {Promise<Array>} 카드 세트 목록
   */
  static async getCardSets(filters = {}) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CARD_SETS, filters);
      return response.results || response;
    } catch (error) {
      throw new Error('카드 세트 목록을 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 특정 카드 세트 상세 정보 조회
   * @param {number} setId - 세트 ID
   * @returns {Promise<Object>} 세트 상세 정보
   */
  static async getCardSetDetail(setId) {
    try {
      return await apiClient.get(`${API_CONFIG.ENDPOINTS.CARD_SETS}${setId}/`);
    } catch (error) {
      throw new Error('카드 세트 정보를 불러올 수 없습니다: ' + error.message);
    }
  }

  // ========== Cards ==========

  /**
   * 카드 검색 (통합 검색)
   * @param {Object} searchParams - 검색 파라미터
   * @returns {Promise<Array>} 카드 목록
   */
  static async searchCards(searchParams = {}) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CARDS, searchParams);
      return {
        results: response.results || response,
        count: response.count || (response.results || response).length,
        next: response.next || null,
        previous: response.previous || null
      };
    } catch (error) {
      throw new Error('카드를 검색할 수 없습니다: ' + error.message);
    }
  }

  /**
   * 특정 세트의 카드 목록 조회
   * @param {string} setCode - 세트 코드
   * @param {Object} params - 쿼리 파라미터
   * @returns {Promise<Array>} 카드 목록
   */
  static async getSetCards(setCode, params = {}) {
    try {
      const response = await apiClient.get(`/sets/${setCode}/cards/`, params);
      return response.results || response;
    } catch (error) {
      throw new Error('세트 카드 목록을 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 카드 상세 정보 조회
   * @param {number} cardId - 카드 ID
   * @returns {Promise<Object>} 카드 상세 정보
   */
  static async getCardDetail(cardId) {
    try {
      return await apiClient.get(`${API_CONFIG.ENDPOINTS.CARDS}${cardId}/`);
    } catch (error) {
      throw new Error('카드 정보를 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 카드의 모든 버전 조회
   * @param {number} cardId - 카드 ID
   * @returns {Promise<Array>} 카드 버전 목록
   */
  static async getCardVersions(cardId) {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.CARDS}${cardId}/versions/`);
      return response.results || response;
    } catch (error) {
      throw new Error('카드 버전 정보를 불러올 수 없습니다: ' + error.message);
    }
  }

  // ========== Card Versions ==========

  /**
   * 카드 버전 목록 조회 (필터링 가능)
   * @param {Object} filters - 필터 옵션
   * @returns {Promise<Object>} 페이지네이션된 결과
   */
  static async getCardVersions(filters = {}) {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.CARD_VERSIONS, filters);
      return {
        results: response.results || response,
        count: response.count || (response.results || response).length,
        next: response.next || null,
        previous: response.previous || null
      };
    } catch (error) {
      throw new Error('카드 버전 목록을 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 카드 버전 상세 정보 조회
   * @param {number} versionId - 버전 ID
   * @returns {Promise<Object>} 버전 상세 정보
   */
  static async getCardVersionDetail(versionId) {
    try {
      return await apiClient.get(`${API_CONFIG.ENDPOINTS.CARD_VERSIONS}${versionId}/`);
    } catch (error) {
      throw new Error('카드 버전 정보를 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 카드 버전 가격 히스토리 조회
   * @param {number} versionId - 버전 ID
   * @param {number} days - 조회할 일수 (기본: 30일)
   * @returns {Promise<Array>} 가격 히스토리
   */
  static async getCardPriceHistory(versionId, days = 30) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.CARD_VERSIONS}${versionId}/price_history/`,
        { days }
      );
      return response.results || response;
    } catch (error) {
      throw new Error('가격 히스토리를 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 카드 버전 가격 트렌드 조회 (그래프용)
   * @param {number} versionId - 버전 ID
   * @param {number} days - 조회할 일수 (기본: 30일)
   * @returns {Promise<Array>} 가격 트렌드 데이터
   */
  static async getCardPriceTrend(versionId, days = 30) {
    try {
      const response = await apiClient.get(
        `${API_CONFIG.ENDPOINTS.CARD_VERSIONS}${versionId}/price_trend/`,
        { days }
      );
      return response.results || response;
    } catch (error) {
      throw new Error('가격 트렌드를 불러올 수 없습니다: ' + error.message);
    }
  }

  // ========== Inventory ==========

  /**
   * 재고 부족 상품 조회
   * @returns {Promise<Array>} 재고 부족 상품 목록
   */
  static async getLowStockItems() {
    try {
      const response = await apiClient.get(`${API_CONFIG.ENDPOINTS.INVENTORY}low_stock/`);
      return response.results || response;
    } catch (error) {
      throw new Error('재고 부족 상품을 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 재고 통계 조회
   * @returns {Promise<Object>} 재고 통계
   */
  static async getInventoryStatistics() {
    try {
      return await apiClient.get(`${API_CONFIG.ENDPOINTS.INVENTORY}statistics/`);
    } catch (error) {
      throw new Error('재고 통계를 불러올 수 없습니다: ' + error.message);
    }
  }

  /**
   * 카드 버전 재고 조정
   * @param {number} versionId - 버전 ID
   * @param {number} quantityChange - 변경할 수량 (양수: 입고, 음수: 출고)
   * @param {string} reason - 조정 사유
   * @returns {Promise<Object>} 조정 결과
   */
  static async adjustStock(versionId, quantityChange, reason = '') {
    try {
      return await apiClient.post(
        `${API_CONFIG.ENDPOINTS.CARD_VERSIONS}${versionId}/adjust_stock/`,
        { quantity_change: quantityChange, reason }
      );
    } catch (error) {
      throw new Error('재고 조정에 실패했습니다: ' + error.message);
    }
  }

  // ========== Price Management ==========

  /**
   * 카드 버전 가격 업데이트
   * @param {number} versionId - 버전 ID
   * @param {Object} priceData - 가격 정보
   * @returns {Promise<Object>} 업데이트된 가격 정보
   */
  static async updateCardPrice(versionId, priceData) {
    try {
      return await apiClient.post(
        `${API_CONFIG.ENDPOINTS.CARD_VERSIONS}${versionId}/update_price/`,
        priceData
      );
    } catch (error) {
      throw new Error('가격 업데이트에 실패했습니다: ' + error.message);
    }
  }

  // ========== Sales ==========

  /**
   * 판매 처리
   * @param {Object} saleData - 판매 데이터
   * @returns {Promise<Object>} 판매 결과
   */
  static async processSale(saleData) {
    try {
      return await apiClient.post(`${API_CONFIG.ENDPOINTS.SALES}process/`, saleData);
    } catch (error) {
      throw new Error('판매 처리에 실패했습니다: ' + error.message);
    }
  }

  /**
   * 매출 통계 조회
   * @param {string} period - 기간 (daily, weekly, monthly)
   * @returns {Promise<Object>} 매출 통계
   */
  static async getSalesStatistics(period = 'daily') {
    try {
      return await apiClient.get(`${API_CONFIG.ENDPOINTS.SALES}statistics/`, { period });
    } catch (error) {
      throw new Error('매출 통계를 불러올 수 없습니다: ' + error.message);
    }
  }

  // ========== Utility Methods ==========

  /**
   * 이미지 URL 생성 (플레이스홀더)
   * @param {string} text - 표시할 텍스트
   * @param {string} bgColor - 배경색 (hex, 기본값: 1976d2)
   * @param {string} textColor - 텍스트색 (hex, 기본값: ffffff)
   * @param {string} size - 크기 (기본값: 400x280)
   * @returns {string} 플레이스홀더 이미지 URL
   */
  static generatePlaceholderImage(text, bgColor = '1976d2', textColor = 'ffffff', size = '400x280') {
    return `https://via.placeholder.com/${size}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
  }

  /**
   * 날짜 포맷팅
   * @param {string} dateString - 날짜 문자열
   * @param {string} locale - 로케일 (기본값: ko-KR)
   * @returns {string} 포맷된 날짜
   */
  static formatDate(dateString, locale = 'ko-KR') {
    if (!dateString) return 'TBA';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  }

  /**
   * 가격 포맷팅
   * @param {number} price - 가격
   * @param {string} currency - 통화 (기본값: KRW)
   * @returns {string} 포맷된 가격
   */
  static formatPrice(price, currency = 'KRW') {
    if (price === null || price === undefined) return '가격 미정';
    
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: currency
    }).format(price);
  }
}

// 기본 export
export default TCGApiService;