# FR-01 Dashboard Improvement PRD (Operational Intelligence)

## 1. 개요 (Overview)

기존의 정적인 대시보드를 **"운영 인텔리전스(Operational Intelligence) 보드"**로 업그레이드한다.
단순한 현황 조회(Monitoring)를 넘어, **위기 감지(Risk Detection), 추세 분석(Trend Analysis), 의사결정 지원(Decision Support)**이 가능한 시각화 도구를 제공하는 것을 목표로 한다.

---

## 2. 목표 (Goals)

1.  **Single Page View (No Scroll):** 모든 핵심 지표를 **스크롤 없이 한 화면(100vh)**에서 파악할 수 있도록 밀도 높은 UI를 구성한다.
2.  **시인성 강화 (Visibility):** 추세(Trend)와 상태(Status)를 색상과 아이콘으로 직관적으로 전달한다.
3.  **위기 감지 (Risk Detection):** 실패 급증, 장기 미접속 등 이상 징후를 즉시 파악할 수 있게 한다.
4.  **현장감 (Liveness):** 실시간 티커(Ticker)를 통해 시스템이 살아서 움직이고 있음을 시각적으로 보여준다.

---

## 3. 상세 기능 요구사항 (Functional Requirements)

### FR-01-1 Smart KPI Cards (Top Row)

화면 최상단에 배치되는 핵심 지표 카드. 높이를 최소화하여 차트 영역을 확보한다.

*   **Layout:** 가로 일렬 배치 (Compact Horizontal Card).
*   **Metrics:**
    1.  **Availability:** Online 기기 비율 + Trend (`▲ 0.5%`)
    2.  **Success Rate:** 24시간 배포 성공률 + Trend (Sparkline 포함)
    3.  **Pending Actions:** 대기 중인 작업 수 (적체 상황 파악)
    4.  **Critical Errors:** 최근 발생한 치명적 오류 수 (Red Badge)

### FR-01-2 Operational Charts (Middle Row)

화면 중앙을 차지하는 메인 시각화 영역. `ResponsiveContainer`를 사용하여 남은 높이를 꽉 채운다.

*   **Left: Failure Analysis (35%)**
    *   최근 에러 추이 (Stacked Bar Chart).
    *   시간대별 에러 발생 패턴 파악.
*   **Center: Active Rollout Monitor (30%)**
    *   현재 진행 중인 가장 중요한 롤아웃 1건의 상세 상태.
    *   Gauge Chart로 전체 진행률 표시.
    *   Step Indicator로 현재 그룹 단계 표시.
*   **Right: Version Fragmentation Map (35%)**
    *   전체 기기 SW 버전 분포 (Treemap).
    *   파편화 심각도(Fragmentation Index) 표시.

### FR-01-5 Live Event Ticker (Bottom Bar)

화면 최하단에 고정된 뉴스 티커 스타일의 로그 뷰어.

*   **기능:** 중요 이벤트(Error, Rollout Start/Finish)를 텍스트로 흐르게 표시.
*   **Interaction:** 클릭 시 해당 로그의 상세 페이지로 모달 팝업 또는 이동.
*   **Style:** 검은 배경에 밝은 텍스트 (Terminal 느낌).

### FR-01-6 Focus Mode (Global Control)

관제 모니터링을 위한 전용 모드.

*   **Action:** 버튼 클릭 시 사이드바와 헤더를 숨기고 대시보드 컨텐츠만 **전체 화면(Full Screen)**으로 확장.
*   **Theme:** Focus Mode 진입 시 자동으로 Dark Mode 적용 (눈의 피로도 감소).

---

## 4. UI/UX 가이드라인

### 4.1 Color Palette (Semantic)
*   **Success:** `#52c41a` (Green)
*   **Warning:** `#faad14` (Yellow/Orange)
*   **Error:** `#ff4d4f` (Red)
*   **Info/Action:** `#1890ff` (Blue)
*   **Offline/Inactive:** `#bfbfbf` (Gray)

### 4.2 Accessibility
*   색상만으로 상태를 구분하지 않고, **아이콘(Icon)과 텍스트(Label)**를 병행 표기한다.
*   차트에는 툴팁(Tooltip)을 제공하여 정확한 수치를 확인할 수 있게 한다.

### 4.3 Layout Guidelines (Grid System)
스크롤 없는 100vh 구성을 위해 Grid 높이를 엄격히 제한한다.

*   **Container:** `height: calc(100vh - 64px)` (Header 제외)
*   **Grid:** CSS Grid 사용
    *   **Row 1 (KPI):** `flex: 0 0 120px` (약 15%)
    *   **Row 2 (Charts):** `flex: 1` (나머지 공간 자동 채움, 약 75%)
    *   **Row 3 (Ticker):** `flex: 0 0 40px` (약 10%)
*   **Overflow:** `overflow: hidden` (스크롤 방지)

---

## 5. 구현 계획 (Implementation Plan)

### Phase 1: Layout & Focus Mode
1.  **Grid Layout:** CSS Grid를 적용하여 높이 기반 레이아웃 구조 잡기.
2.  **Focus Mode:** Zustand Store에 `isFocusMode` 상태 추가 및 Layout 컴포넌트 제어.

### Phase 2: Widget Development
1.  **Compact KPI:** 높이가 낮은 가로형 카드 컴포넌트 개발.
2.  **Chart Integration:** Recharts `ResponsiveContainer`를 활용하여 Grid Cell 크기에 맞춰 자동 리사이징되도록 구현.
3.  **Live Ticker:** CSS Animation(`marquee`)을 활용한 텍스트 롤링 컴포넌트 구현.

### Phase 3: Data Binding
1.  **Polling Optimization:** 3개의 차트가 동시에 로딩되지 않도록 쿼리 시점 조절 또는 병렬 처리.
2.  **Mock Data:** 초기 개발 시 시각적 완성도를 위해 풍부한 Mock Data 활용.

---

## 6. Acceptance Criteria

- [ ] 브라우저 창 크기를 조절해도 **스크롤바가 생기지 않아야 한다** (반응형 리사이징).
- [ ] Focus Mode 버튼 클릭 시 전체 화면으로 전환되어야 한다.
- [ ] 하단 Ticker에 실시간(또는 최근) 로그가 흘러가야 한다.
- [ ] 모든 차트는 영역을 벗어나지 않고 비율을 유지해야 한다.
