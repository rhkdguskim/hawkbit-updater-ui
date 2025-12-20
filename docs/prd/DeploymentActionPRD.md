# FR-04 Deployment & Action Control PRD

## 1. 개요

배포(Deployment) 수행 및 Action 상태 관리를 위한 기능을 제공한다.
Target에 Distribution Set을 할당하고, 생성된 Action의 상태를 추적/제어한다.

---

## 2. UI Routes

| Route | 기능 |
|-------|------|
| `/actions` | 전체 Action 목록 조회 |
| `/actions/:id` | Action 상세 조회 |
| `/targets/:id/actions` | Target별 Action History (기존 구현됨) |

---

## 3. API 엔드포인트

### 3.1 Action 조회
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/rest/v1/actions` | 전체 Action 목록 |
| GET | `/rest/v1/actions/{actionId}` | Action 상세 |
| GET | `/rest/v1/targets/{targetId}/actions` | Target의 Action History |
| GET | `/rest/v1/targets/{targetId}/actions/{actionId}/status` | Action Status 목록 |

### 3.2 Action 제어 (Admin 전용)
| Method | Endpoint | 설명 |
|--------|----------|------|
| PUT | `/rest/v1/targets/{targetId}/actions/{actionId}` | Action 업데이트 (forceType 변경) |
| DELETE | `/rest/v1/targets/{targetId}/actions/{actionId}` | Action 취소 |
| PUT | `/rest/v1/targets/{targetId}/actions/{actionId}/confirmation` | Confirm/Deny |

---

## 4. 기능 요구사항

### FR-04-1 Action List
- 전체 Action 목록 조회
- Pagination, Filtering (FIQL)
- 상태별 필터 (Pending, Running, Finished, Error, Canceled)

### FR-04-2 Action Detail
- Action 기본 정보 표시
- Action Status History (Timeline)
- 연관 Target 및 Distribution Set 정보

### FR-04-3 Action Control (Admin)
| 작업 | 조건 | API |
|------|------|-----|
| Soft → Forced 전환 | Running 상태 | `PUT /actions/{id}` + `forceType: forced` |
| Cancel | Running/Pending 상태 | `DELETE /actions/{id}` |
| Confirm | Confirmation 대기 중 | `PUT /actions/{id}/confirmation` + `confirmation: confirmed` |
| Deny | Confirmation 대기 중 | `PUT /actions/{id}/confirmation` + `confirmation: denied` |

---

## 5. Action 상태

```
Pending → Running → Finished
                  ↘ Error
                  ↘ Canceled (Admin Cancel)
```

| Status | 설명 |
|--------|------|
| `pending` | 대기 중 |
| `running` | 실행 중 |
| `finished` | 완료 |
| `error` | 오류 |
| `canceled` | 취소됨 |
| `wait_for_confirmation` | 확인 대기 |

---

## 6. 권한

| Role | 권한 |
|------|------|
| Admin | 조회 + Force/Cancel/Confirm/Deny |
| Operator | 조회만 가능 |

---

## 7. 구현 체크리스트

### Phase 1 (MVP)
- [x] Action List 페이지 (Pagination, Filter)
- [x] Action Detail 페이지
- [x] Action Status Timeline

### Phase 2 (Control)
- [x] Force Action (Soft → Forced)
- [x] Cancel Action
- [x] Confirm / Deny Action

---

## 8. Acceptance Criteria

- [x] Action List는 Server Paging 적용
- [x] 상태별 색상 구분 (Finished: green, Error: red, etc.)
- [x] Admin만 Control 버튼 표시
- [x] Cancel 시 확인 모달 표시
- [ ] 409 에러 시 새로고침 유도

