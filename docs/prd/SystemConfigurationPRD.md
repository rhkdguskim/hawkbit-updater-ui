# FR-05 System Configuration PRD

## 1. 개요

시스템 테넌트 설정을 Read-only로 조회하는 기능을 제공한다.

---

## 2. UI Route

| Route | 기능 |
|-------|------|
| `/system/config` | System Configuration 조회 |

---

## 3. API

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/rest/v1/system/configs` | 시스템 설정 조회 |

---

## 4. 권한

| Role | 권한 |
|------|------|
| Admin | 조회 ✅ |
| Operator | 조회 ❌ (접근 불가) |

---

## 5. 표시 항목

| Key | 설명 |
|-----|------|
| `pollingTime` | Polling 주기 |
| `pollingOverdueTime` | Overdue 기준 시간 |
| `authentication.targettoken.enabled` | Target Token 인증 |
| `authentication.gatewaytoken.enabled` | Gateway Token 인증 |
| `rollout.approval.enabled` | Rollout 승인 필요 여부 |
| `repository.actions.autoclose.enabled` | Auto Close 설정 |

---

## 6. 구현 체크리스트

- [x] Configuration 페이지 구현
- [x] Admin 권한 체크
- [x] 설정 값 테이블 표시
- [x] 에러 시 Alert 표시

---

## 7. Acceptance Criteria

- [x] Read-only 조회
- [x] Admin 전용 접근
- [x] 실패 시 에러 표시
