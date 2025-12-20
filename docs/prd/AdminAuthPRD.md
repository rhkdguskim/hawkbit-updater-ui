# Admin & Authentication Feature Specification

## 1. 개요
**인증(Authentication)** 및 **권한(Authorization)** 기능의 상세 구현 계획을 정의한다.
hawkBit Management API는 별도의 사용자 관리 API를 제공하지 않으므로, **HTTP Basic Authentication**과 **UI 내부 Role Mapping**을 통해 보안 및 권한 제어를 수행한다.

## 2. 인증 (Authentication)

### 2.1 로그인 페이지 (Login UI)
- **경로**: `/login` (Public Route)
- **구성 요소**:
  - **ID Input**: 사용자 아이디 (`tenant` 정보는 별도 입력 없이 `username`에 포함되거나 고정됨을 가정하나, 현재는 단순 `username` 사용)
  - **Password Input**: 비밀번호
  - **Login Button**: 제출
- **동작 흐름**:
  1. 사용자가 ID/PW 입력 후 로그인 클릭.
  2. UI는 `Basic base64(id:pw)` 헤더를 생성. (admin/admin)
  3. `GET /rest/v1/userinfo` 호출로 인증 유효성 검증.
  4. **성공 (200)**:
     - `AuthStore`에 인증 정보 저장.
     - 대시보드(`/`)로 리다이렉트.
  5. **실패 (401)**:
     - "아이디 또는 비밀번호가 올바르지 않습니다." 에러 메시지 표시.
  6. 임시 계정 정책:
     - Admin: `mirero / mirero-0203`
     - Operator: `admin / admin`

### 2.2 세션 유지 (Session Persistence)
- **저장소**: `localStorage` (브라우저 새로고침 대응)
- **저장 데이터**:
  - `role`: UI 내부 매핑된 Role
- **보안 고려사항**:
  - Headless Browser 환경 특성상 Token 저장이 불가피함.
  - 로그아웃 시 스토리지 즉시 소거.

### 2.3 로그아웃
- **Trigger**: 헤더의 유저 프로필 -> 로그아웃 버튼.
- **Action**: `AuthStore` 초기화 및 `/login` 리다이렉트.

---

## 3. 권한 관리 (Authorization)

### 3.1 Role 정의
| Role | 설명 |
| :--- | :--- |
| **Admin** | 시스템 전체 제어 권한. (Forced Assign, Configuration 등) |
| **Operator** | 일반적인 운영 및 모니터링 권한. (Read-only, Soft Assign) |

### 3.2 Role Mapping 정책
서버 사용자 정보를 조회할 수 없으므로, **Username** 기반으로 UI 권한을 부여한다.

- **Admin**: `mirero`
- **Operator**: `admin` (기본값)

### 3.3 Permission Matrix (기능별 권한)

| Feature Category | Action | Admin | Operator | 비고 |
| :--- | :--- | :---: | :---: | :--- |
| **Dashboard** | View | ✅ | ✅ | |
| **Targets** | List / Detail View | ✅ | ✅ | |
| | **Assign** | ✅ | ✅ | Operator는 Soft Assign만 가능 (UI 제제) |
| | **Forced Assign** | ✅ | ❌ | Admin 전용 기능 |
| | Delete | ✅ | ❌ | |
| **Distributions** | View | ✅ | ✅ | |
| | Create / Edit | ✅ | ❌ | |
| | Upload Artifact | ✅ | ❌ | |
| **Rollouts** | View | ✅ | ✅ | |
| | Control (Pause/Resume) | ✅ | ❌ | |
| **System Config** | View | ✅ | ❌ | Admin 전용 메뉴 |

---

## 4. UI 구현 요구사항

### 4.1 Global Guard
- **AuthGuard**:
  - 로그인 상태가 아니면 모든 Protected Route 접근 시 `/login`으로 리다이렉트.
  - API 401 발생 시 자동으로 로그아웃 처리 및 리다이렉트.

### 4.2 Role Guard
- **RoleBasedGuard**:
  - 특정 Router 진입 시 사용자 Role 체크.
  - 권한 부족 시 `403 Forbidden` 페이지 또는 "접근 권한이 없습니다" Toast 표시 후 뒤로가기.

### 4.3 Element Level Control
- **메뉴 숨김**: `System Config` 메뉴는 Operator에게 **보이지 않음**.
- **버튼 비활성화**:
  - Operator 접속 시 `Delete Target`, `Force Assign` 버튼은 **Disabled** 또는 **Hidden** 처리.
  - Tooltip으로 "Admin 권한 필요" 안내.

## 5. API Error Handling
- **401 (Unauthorized)**: 인증 만료/실패 -> 로그인 이동.
- **403 (Forbidden)**: 서버 측 권한 거부 -> 에러 메시지 표시 (로그아웃 X).
