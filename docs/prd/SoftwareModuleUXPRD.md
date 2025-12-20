# FR-03-UX Software Module UX Improvement PRD

## 1. 개요 (Overview)
Software Module(소프트웨어 모듈) 관리 기능의 **사용자 경험(UX)과 시각적 표현(UI)**을 개선한다.
단순한 데이터 관리를 넘어, **패키지 자산(Asset) 관리**의 느낌을 주도록 시각화를 강화한다.

---

## 2. 목표 (Goals)
1.  **Visual Recognition:** 모듈의 타입(OS, Firmware, App)을 아이콘과 색상으로 즉시 구분한다.
2.  **Effortless Upload:** 파일 업로드를 더 직관적이고 매끄럽게 만든다.
3.  **Metadata Usability:** 복잡한 메타데이터 편집을 쉽게 만든다.

---

## 3. 개선 상세 (Detailed Features)

### 3.1 Card-based Grid View (옵션 제공)
기존 테이블 뷰 외에 **카드 그리드 뷰**를 제공하여 자산 관리 느낌을 강화한다.

*   **UI 구성:**
    *   **Header:** 모듈 타입 아이콘 (OS=Chip, App=Box, Firmware=Microchip) + 이름
    *   **Body:** 버전 (크게 강조), Vendor, Description 요약
    *   **Footer:** Artifact 수, 생성일, Action 버튼 (수정/삭제)
    *   **Color Coding:** 타입별 상단 테두리 색상 구분 (OS=Blue, App=Green)

### 3.2 Enhanced Artifact Upload
파일 업로드 경험을 현대화한다.

*   **Drop Zone:** 상세 페이지 진입 시 눈에 띄는 "Drag files here" 영역 제공.
*   **File Type Auto-detection:** 업로드된 파일의 확장자를 분석하여 아이콘 표시 (`.zip`, `.tar`, `.bin`, `.jar` 등).
*   **Size Formatting:** 바이트 단위가 아닌 사람이 읽기 쉬운 단위(KB, MB, GB)로 자동 변환 표시.
*   **Progress Visualization:** 업로드 진행률을 원형 또는 바 형태로 명확히 표시.

### 3.3 Smart Metadata Editor
Key-Value 쌍 입력을 개선한다.

*   **Tag Input Style:** 엔터를 치면 태그처럼 변환되는 UI.
*   **Auto-complete (Future):** 자주 사용하는 Key(예: `reboot_required`, `install_path`) 자동 완성 제안.
*   **Validation:** 빈 Key 저장 방지 및 중복 Key 경고.

---

## 4. UI/UX 가이드라인

### 4.1 Icons (Module Types)
*   **OS:** `<HddOutlined />` or Custom Chip Icon
*   **Application:** `<AppstoreOutlined />`
*   **Firmware:** `<ApiOutlined />`
*   **Configuration:** `<SettingOutlined />`

### 4.2 Colors
*   **OS:** Primary Blue (`#1890ff`)
*   **App:** Success Green (`#52c41a`)
*   **Firmware:** Warning Orange (`#faad14`)

---

## 5. 구현 체크리스트

### Phase 1: Visual Enhancement
- [ ] Module Type별 아이콘 및 색상 매핑 유틸리티 구현
- [ ] Software Module List에 아이콘 적용 (Table View)
- [ ] Artifact 파일 타입별 아이콘 적용

### Phase 2: Grid View & Upload
- [ ] List View Toggle (Table <-> Grid) 기능 구현
- [ ] Module Card 컴포넌트 개발
- [ ] AntD `Dragger` 컴포넌트 스타일링 커스터마이징

### Phase 3: Metadata UX
- [ ] Metadata Editor 컴포넌트 고도화 (Tag 방식 또는 Editable Table)
