# FR-02 Target Management Functional Specification

## 1. 개요 (Overview)
**Target**은 hawkBit에서 관리되는 개별 디바이스를 나타낸다. 
본 기능은 Target의 **목록 조회**, **상세 정보 확인**, **CRUD 작업**, 그리고 **Distribution Set 배포(Assign)**를 제공한다.

---

## 2. 기능 상세 (Features)

### 2.1 FR-02-1: Target List (목록 조회)

#### 2.1.1 UI 구성
- **검색 영역**:
  - 텍스트 검색: `targetId` 또는 `name` 기반 검색
  - *(Phase 2)* FIQL 고급 검색 지원
- **테이블 컬럼**:
  | Column | Description | Sortable |
  | :--- | :--- | :---: |
  | **Target ID** | Target 고유 ID | ✅ |
  | **Name** | 표시명 | ✅ |
  | **Status** | Online/Offline 상태 아이콘 | ❌ |
  | **Installed DS** | 현재 설치된 Distribution Set 이름 | ❌ |
  | **Last Updated** | 마지막 업데이트 시각 | ✅ |
  | **Actions** | 상세보기/삭제 버튼 | ❌ |
- **Pagination**: Server-side Paging (Ant Design Table)
  - Page Size: `[10, 20, 50]`
  - Default: `20`

#### 2.1.2 데이터 전략
- **API**: `GET /rest/v1/targets`
- **Query Params**:
  - `offset`, `limit`: Pagination
  - `sort`: Sorting (e.g., `name:ASC`)
  - `q`: FIQL 검색 쿼리 (e.g., `name==*device*`)
- **Polling**: *(Optional)* 30초 간격 자동 새로고침

#### 2.1.3 Acceptance Criteria
- [ ] Server-side Paging 필수 구현
- [ ] 필터/검색 변경 시 `offset=0`으로 초기화
- [ ] 권한 부족(403) 시 Action 버튼 숨김/비활성화
- [ ] Loading/Error/Empty State 처리

---

### 2.2 FR-02-2: Target Detail (상세 조회)

#### 2.2.1 UI 구성
상세 페이지는 **탭(Tab)** 구조로 구성된다.

| Tab | Content | API |
| :--- | :--- | :--- |
| **Overview** | Controller ID, Name, Description, Address, Poll Time | `GET /rest/v1/targets/{targetId}` |
| **Attributes** | Target Attributes (Key-Value) | `GET /rest/v1/targets/{targetId}/attributes` |
| **Installed DS** | 설치된 Distribution Set 정보 | `GET /rest/v1/targets/{targetId}/installedDS` |
| **Assigned DS** | 할당된 Distribution Set 정보 | `GET /rest/v1/targets/{targetId}/assignedDS` |
| **Actions** | Action History (Status, Type, Time) | `GET /rest/v1/targets/{targetId}/actions` |
| **Metadata** | Metadata (Key-Value) | `GET /rest/v1/targets/{targetId}/metadata` |
| **Tags** | Target에 연결된 Tag 목록 | `GET /rest/v1/targets/{targetId}/tags` |

#### 2.2.2 데이터 전략
- 각 탭은 **Lazy Loading**으로 선택 시에만 API 호출
- Action 클릭 시 Action 상세 페이지로 이동

#### 2.2.3 Acceptance Criteria
- [ ] 탭 Lazy Loading 구현
- [ ] Action 클릭 → `/targets/{id}/actions/{actionId}` 이동
- [ ] 404 응답 시 목록으로 안전 복귀 + Toast 알림

---

### 2.3 FR-02-3: Target CRUD & Assign

#### 2.3.1 Create Target
- **Trigger**: 목록 페이지 "Add Target" 버튼
- **Form Fields**:
  - `controllerId` (Required, Unique)
  - `name` (Optional)
  - `description` (Optional)
- **API**: `POST /rest/v1/targets` (body에 controllerId 포함)

#### 2.3.2 Update Target
- **Trigger**: 상세 페이지 "Edit" 버튼
- **Editable Fields**: `name`, `description`
- **API**: `PUT /rest/v1/targets/{targetId}`

#### 2.3.3 Delete Target
- **Trigger**: 목록 Action 또는 상세 페이지 "Delete" 버튼
- **Confirm**: Modal 확인 후 삭제
- **API**: `DELETE /rest/v1/targets/{targetId}`
- **권한**: Admin Only (Operator 버튼 숨김)

#### 2.3.4 Assign Distribution Set
- **Trigger**: 상세 페이지 "Assign DS" 버튼
- **Flow**:
  1. Distribution Set 선택 Modal
  2. Assign Type 선택: `soft` (Operator) / `forced` (Admin only)
  3. 확인 후 배포
- **API**: `POST /rest/v1/targets/{targetId}/assignedDS`
- **Body**:
  ```json
  {
    "id": <distributionSetId>,
    "type": "soft" | "forced"
  }
  ```

#### 2.3.5 Metadata Management *(Phase 2)*
- **조회**: `GET /rest/v1/targets/{targetId}/metadata`
- **생성**: `POST /rest/v1/targets/{targetId}/metadata`
- **수정**: `PUT /rest/v1/targets/{targetId}/metadata/{metadataKey}`
- **삭제**: `DELETE /rest/v1/targets/{targetId}/metadata/{metadataKey}`
- **권한**: Admin Only

#### 2.3.6 AutoConfirm Management *(Phase 2)*
- **상태 조회**: `GET /rest/v1/targets/{targetId}/autoConfirm`
- **활성화**: `POST /rest/v1/targets/{targetId}/autoConfirm/activate`
- **비활성화**: `POST /rest/v1/targets/{targetId}/autoConfirm/deactivate`
- **설명**: AutoConfirm 활성화 시 Action이 자동으로 Confirm 처리됨
- **권한**: Admin Only

#### 2.3.7 Target Type Assignment *(Phase 2)*
- **할당**: `POST /rest/v1/targets/{targetId}/targettype`
- **해제**: `DELETE /rest/v1/targets/{targetId}/targettype`
- **권한**: Admin Only

#### 2.3.8 Acceptance Criteria
- [ ] 삭제 시 Confirm Modal 필수
- [ ] 409 Conflict 발생 시 재시도 안내 (새로고침 후 재시도)
- [ ] Assign 시 Operator는 `forced` 옵션 비활성화
- [ ] 성공/실패 Toast 메시지

---

## 3. 권한 매트릭스 (Permission Matrix)

| Action | Admin | Operator |
| :--- | :---: | :---: |
| View Target List | ✅ | ✅ |
| View Target Detail | ✅ | ✅ |
| Create Target | ✅ | ❌ |
| Update Target | ✅ | ❌ |
| Delete Target | ✅ | ❌ |
| Assign DS (Soft) | ✅ | ✅ |
| Assign DS (Forced) | ✅ | ❌ |
| Manage Metadata | ✅ | ❌ |
| Manage AutoConfirm | ✅ | ❌ |
| Assign Target Type | ✅ | ❌ |

---

## 4. 라우팅 및 API 매핑 (Routing & API Mapping)

### 4.1 UI Routes (Frontend)
| UI Route | Component | Description |
| :--- | :--- | :--- |
| `/targets` | `TargetList` | Target 목록 |
| `/targets/:id` | `TargetDetail` | Target 상세 |
| `/targets/new` | `TargetForm` | Target 생성 |
| `/targets/:id/edit` | `TargetForm` | Target 수정 |

### 4.2 API Endpoints (Backend - hawkBit)
| Action | Method | API Endpoint |
| :--- | :--- | :--- |
| List Targets | `GET` | `/rest/v1/targets` |
| Get Target | `GET` | `/rest/v1/targets/{targetId}` |
| Create Target | `POST` | `/rest/v1/targets` |
| Update Target | `PUT` | `/rest/v1/targets/{targetId}` |
| Delete Target | `DELETE` | `/rest/v1/targets/{targetId}` |
| Get Attributes | `GET` | `/rest/v1/targets/{targetId}/attributes` |
| Get Installed DS | `GET` | `/rest/v1/targets/{targetId}/installedDS` |
| Get Assigned DS | `GET` | `/rest/v1/targets/{targetId}/assignedDS` |
| Get Actions | `GET` | `/rest/v1/targets/{targetId}/actions` |
| Get Metadata | `GET` | `/rest/v1/targets/{targetId}/metadata` |
| Create Metadata | `POST` | `/rest/v1/targets/{targetId}/metadata` |
| Update Metadata | `PUT` | `/rest/v1/targets/{targetId}/metadata/{metadataKey}` |
| Delete Metadata | `DELETE` | `/rest/v1/targets/{targetId}/metadata/{metadataKey}` |
| Get Tags | `GET` | `/rest/v1/targets/{targetId}/tags` |
| Assign DS | `POST` | `/rest/v1/targets/{targetId}/assignedDS` |
| Get AutoConfirm | `GET` | `/rest/v1/targets/{targetId}/autoConfirm` |
| Activate AutoConfirm | `POST` | `/rest/v1/targets/{targetId}/autoConfirm/activate` |
| Deactivate AutoConfirm | `POST` | `/rest/v1/targets/{targetId}/autoConfirm/deactivate` |
| Assign Target Type | `POST` | `/rest/v1/targets/{targetId}/targettype` |
| Unassign Target Type | `DELETE` | `/rest/v1/targets/{targetId}/targettype` |

---

## 5. 구현 체크리스트

### Phase 1 (MVP)
- [ ] Target List 테이블 (Pagination, Sorting)
- [ ] Target Detail 탭 (Overview, Actions)
- [ ] Delete Target (Admin)
- [ ] Assign Distribution Set (Soft)

### Phase 2
- [ ] FIQL 고급 검색
- [ ] Create/Update Target
- [ ] Assign Distribution Set (Forced - Admin)
- [ ] Attributes/Metadata 탭
- [ ] Tags 탭
- [ ] Assigned DS 탭
- [ ] Metadata CRUD (Admin)

### Phase 3
- [ ] AutoConfirm 관리 (Admin)
- [ ] Target Type 할당/해제 (Admin)
