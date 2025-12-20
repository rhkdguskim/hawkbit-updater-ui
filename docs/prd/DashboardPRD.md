# FR-01 Dashboard Functional Specification

## 1. 개요 (Overview)
운영자가 시스템의 **전체 상태를 한눈에 파악**할 수 있는 대시보드를 제공한다.
빠른 상태 인지를 위해 **핵심 지표(KPI)** 와 **실시간 상태 차트**를 배치한다.

## 2. 주요 기능 (Features)

### 2.1 KPI Cards (핵심 지표)
상단에 배치하여 즉각적인 현황 파악을 돕는다. 각 카드는 **Skeleton Loading**과 **에러 상태**를 독립적으로 관리한다.

1.  **Total Targets**
    *   시스템에 등록된 전체 Target 수.
    *   **Data Source**: `GET /rest/v1/targets` (Total Count from response header or body metadata)
2.  **Online Targets**
    *   현재 연결된(Polling 중인) Target 수.
    *   **Data Source**: `GET /rest/v1/targets?q=pollStatus.overdue==false`
3.  **Offline Targets**
    *   연결이 끊긴(Overdue) Target 수.
    *   **Data Source**: `GET /rest/v1/targets?q=pollStatus.overdue==true`
    *   **UI Alert**: 일정 비율 이상 시 붉은색 강조.
4.  **Recent Success Rate (24h)**
    *   최근 24시간 동안 발생한 Action의 성공률.
    *   **Data Source**: `GET /rest/v1/actions` (Filter by `createdAt` & `status`)
    *   **Calculation**: `Finished / (Finished + Error) * 100`

### 2.2 Device Status Chart (도넛 차트)
*   Online vs Offline 비율을 시각화.
*   **Library**: `Recharts` (Pie/Donut)
*   **Color**: Online(Green/Primary), Offline(Red/Grey)

### 2.3 Recent Activity Chart (바 차트)
*   최근 7일(또는 24시간) 동안의 배포(Action) 상태 추이.
*   X축: 시간/날짜, Y축: Action 수
*   Stacked Bar: Finished vs Error vs Running

## 3. 데이터 패칭 전략 (Data Strategy)
*   **Polling**: 대시보드는 실시간성이 중요하므로 **10초~30초** 간격의 Polling을 수행한다.
*   **Concurrent Fetching**: 각 지표는 병렬로 요청하여 빠른 로딩을 지원한다 (React Query `useQueries` 활용).
*   **Error Handling**: 특정 지표 실패 시 전체 화면이 아닌 해당 카드만 재시도/에러 표시.

## 4. UI/UX 요구사항
*   **Layout**: `Ant Design` Grid System (Responsive).
*   **Skeleton**: 데이터 로딩 중 흔들리는 스켈레톤 UI 제공.
*   **Responsiveness**: Mobile 환경에서는 KPI 카드를 세로로 적체(Stacking).

## 5. API Reference
| Metric | API Endpoint | Query Param / Logic |
| :--- | :--- | :--- |
| **Total Count** | `GET /rest/v1/targets` | `limit=1` & take `total` metadata |
| **Online** | `GET /rest/v1/targets` | `q=pollStatus.overdue==false` & take `total` |
| **Offline** | `GET /rest/v1/targets` | `q=pollStatus.overdue==true` & take `total` |
| **Actions** | `GET /rest/v1/actions` | `limit=100` (Analyze in client or use RSQL if supported) |

## 6. 권한 (Authorization)
*   **Admin/Operator**: 모두 조회 가능 (Read-only).
