# HawkBit 관리용 WebSocket API (실시간 데이터 동기화)

이 문서는 HawkBit 백엔드에서 제공하는 실시간 WebSocket Notification API를 정의합니다. 프론트엔드 애플리케이션(Updater UI)은 이 API를 통해 Polling 없이 데이터 변경 사항을 즉시 감지하여 UI를 동적으로 업데이트할 수 있습니다.

## 1. 연결 정보 (Connection)

*   **Endpoint:** `/ws/stomp`
*   **Protocol:** WebSocket over STOMP
*   **Fallback:** SockJS 지원

---

## 2. 토픽 및 이벤트 명세 (Topics & Events)

### A. 작업 (Action) - `/topic/events/actions`
Action의 전체 수명 주기(생성, 변경, 대량 작업)를 다룹니다.

| 상태 | `eventType` | `entityType` | 설명 | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **생성** | `CREATED` | `ACTION` | 새로운 배포 작업이 생성됨 | `{ "id": 123, "targetId": "d1", "status": "SCHEDULED" }` |
| **변경** | `UPDATE` | `ACTION` | 진행 상태가 변경됨 (RUNNING, FINISHED 등) | `{ "id": 123, "targetId": "d1", "status": "RUNNING" }` |
| **할당** | `UPDATE` | `ASSIGNMENT` | DS가 Target에 할당됨 (Action 생성 유발) | `{ "distributionSetId": 10, "totalActions": 5 }` |
| **대량작업**| `UPDATE` | `MULTI_ACTION`| 여러 타겟에 대한 일괄 작업(Assign/Cancel) 발생 | `{ "controllerIds": ["d1", "d2"], "actionIds": [1, 2] }` |

### B. 타겟 (Target) - `/topic/events/targets`
Target의 연결 및 상태 정보를 다룹니다.

| 상태 | `eventType` | `entityType` | 설명 | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **생성** | `CREATED` | `TARGET` | 새로운 Target 등록됨 | `{ "controllerId": "d1" }` |
| **변경** | `UPDATE` | `TARGET` | 연결(Online/Offline) 또는 배포 상태 변경 | `{ "controllerId": "d1", "status": "ONLINE" }` |
| **활동** | `POLL` | `TARGET` | Target이 서버에 접속(Polling)함 (Heartbeat) | `{ "controllerId": "d1" }` |

### C. 롤아웃 (Rollout) - `/topic/events/rollouts`
롤아웃 캠페인의 진행 상황을 다룹니다.

| 상태 | `eventType` | `entityType` | 설명 | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **변경** | `UPDATE` | `ROLLOUT` | Rollout 전체 상태 변경 | `{ "id": 100, "status": "RUNNING" }` |
| **그룹변경**| `UPDATE` | `ROLLOUT_GROUP`| 내부 그룹 상태 변경 | `{ "rolloutId": 100, "id": 201, "status": "READY" }` |
| **중단** | `STOPPED` | `ROLLOUT` | 에러 등으로 강제 중단됨 | `{ "id": 100, "status": "STOPPED" }` |

### D. 시스템 (System) - `/topic/events/system`
전역 설정 변경 사항을 알립니다.

| 상태 | `eventType` | `entityType` | 설명 | Payload |
| :--- | :--- | :--- | :--- | :--- |
| **설정변경**| `UPDATE` | `SYSTEM_CONFIG`| 테넌트 설정 값 변경 (예: Polling 주기) | `{ "key": "polling.interval", "value": "30000" }` |

### E. 리포지토리 (Repository) - `/topic/events/repository`
소프트웨어 모듈 및 배포 세트의 변경 사항.

| `eventType` | `entityClass` | 설명 |
| :--- | :--- | :--- |
| `CREATED` / `DELETED` | `DistributionSet` | 배포 세트 목록 변경 |
| `CREATED` / `DELETED` | `SoftwareModule` | 소프트웨어 모듈 목록 변경 |

### F. 다운로드 (Download) - `/topic/events/downloads`
*   `entityType`: `DOWNLOAD_PROGRESS`
*   `payload`: `{ "actionStatusId": 555, "shippedBytes": 1024 }`

---

## 3. 프론트엔드 연동 가이드

1.  **System Topic Handle**: `/topic/events/system`을 구독하여 전역 설정이 변경되면(예: 강제 Polling 모드 전환 등) 앱 설정을 즉시 갱신합니다.
2.  **Action Created Handle**: `CREATED` 이벤트를 받으면 '최근 배포' 위젯을 즉시 갱신하거나 사용자에게 Toast 알림을 띄웁니다.
3.  **Rollout Stopped Handle**: `STOPPED` 이벤트를 받으면 긴급 상황이므로 대시보드에 경고(Alert)를 표시합니다.
4.  **Target Poll Handle**: 타겟 상세 페이지나 목록에서 'Last Seen'을 실시간으로 갱신하여 사용자가 기기가 살아있는지 즉시 알 수 있게 합니다.
