# FR-08 Rollout Management PRD

## 1. 개요

Rollout을 통한 대규모 배포 모니터링 및 관리 기능을 제공한다.

---

## 2. UI Routes

| Route | 기능 |
|-------|------|
| `/rollouts` | Rollout 목록 |
| `/rollouts/:id` | Rollout 상세 (Groups 포함) |

---

## 3. API 엔드포인트

### 3.1 조회
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/rest/v1/rollouts` | Rollout 목록 |
| GET | `/rest/v1/rollouts/{rolloutId}` | Rollout 상세 |
| GET | `/rest/v1/rollouts/{rolloutId}/deploygroups` | Deploy Groups |
| GET | `/rest/v1/rollouts/{rolloutId}/deploygroups/{groupId}` | Group 상세 |
| GET | `/rest/v1/rollouts/{rolloutId}/deploygroups/{groupId}/targets` | Group Targets |

### 3.2 제어 (Admin)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/rest/v1/rollouts/{rolloutId}/start` | 시작 |
| POST | `/rest/v1/rollouts/{rolloutId}/pause` | 일시정지 |
| POST | `/rest/v1/rollouts/{rolloutId}/resume` | 재개 |
| POST | `/rest/v1/rollouts/{rolloutId}/approve` | 승인 |
| POST | `/rest/v1/rollouts/{rolloutId}/deny` | 거부 |

---

## 4. Rollout 상태

| Status | 설명 |
|--------|------|
| `creating` | 생성 중 |
| `ready` | 준비 완료 (시작 가능) |
| `starting` | 시작 중 |
| `running` | 실행 중 |
| `paused` | 일시정지 |
| `finished` | 완료 |
| `error` | 오류 |
| `waiting_for_approval` | 승인 대기 |

---

## 5. 권한

| Role | 권한 |
|------|------|
| Admin | 조회 + Start/Pause/Resume/Approve/Deny |
| Operator | 조회만 가능 |

---

## 6. 구현 체크리스트

### Phase 1 (MVP)
- [x] Rollout List 페이지
- [x] Rollout Detail 페이지
- [x] Deploy Groups 표시
- [x] 진행률 표시

### Phase 2 (Control)
- [x] Start Rollout
- [x] Pause / Resume
- [x] Approve / Deny

---

## 7. Acceptance Criteria

- [x] Rollout List Server Paging
- [x] 상태별 색상 구분
- [x] Group 진행률 Progress Bar
- [x] Admin만 제어 버튼 표시

