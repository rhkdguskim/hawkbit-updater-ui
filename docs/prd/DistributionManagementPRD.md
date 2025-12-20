# FR-03 Distribution & Artifacts Management Functional Specification

## 1. 개요 (Overview)
**Distribution Management**는 hawkBit의 소프트웨어 업데이트 패키지 단위를 관리하는 핵심 기능이다.
크게 **Software Module (개별 패키지)**과 **Distribution Set (배포 단위)**의 관리 기능을 제공한다.
artifact(파일) 업로드 및 메타데이터 관리도 포함된다.

---

## 2. 기능 상세 (Features)

### 2.1 FR-03-1: Software Module Management

#### 2.1.1 Software Module List
- **UI Route**: `/software-modules`
- **기능**:
  - Software Module 목록 조회 (Pagination, Sorting)
  - 검색 (Name, Version, Type)
  - 생성/수정/삭제 (CRUD)
- **컬럼**:
  - Name, Version, Type, Vendor, Description, # Artifacts
- **API**: `GET /rest/v1/softwaremodules`

#### 2.1.2 Software Module Detail
- **UI Route**: `/software-modules/:id`
- **탭 구성**:
  - **Overview**: 기본 정보 (Name, Version, Type, Vendor)
  - **Artifacts**: 업로드된 파일 목록 및 다운로드/삭제
  - **Metadata**: 메타데이터 Key-Value 관리
- **API**: `GET /rest/v1/softwaremodules/{id}`

#### 2.1.3 Artifact Upload
- **기능**:
  - Software Module에 Artifact 파일 업로드
  - Drag & Drop 지원
  - 여러 파일 동시 업로드 불가 (API 제약 사항 확인 필요, 통상 단일 파일)
- **API**: `POST /rest/v1/softwaremodules/{id}/artifacts`

---

### 2.2 FR-03-2: Distribution Set Management

#### 2.2.1 Distribution Set List
- **UI Route**: `/distribution-sets`
- **기능**:
  - Distribution Set 목록 조회
  - 검색 (Name, Version, Type)
  - 생성/수정/삭제 (CRUD)
- **컬럼**:
  - Name, Version, Type, Description, Required Migration Step
- **API**: `GET /rest/v1/distributionsets`

#### 2.2.2 Distribution Set Detail
- **UI Route**: `/distribution-sets/:id`
- **탭 구성**:
  - **Overview**: 기본 정보
  - **Assigned Modules**: 포함된 Software Module 목록 및 할당/해제
  - **Metadata**: 메타데이터 관리
  - **Tags**: 태그 관리
- **API**: `GET /rest/v1/distributionsets/{id}`

#### 2.2.3 Module Assignment
- **기능**:
  - Distribution Set에 Software Module 할당 (Link)
  - **제약**: 동일 Type의 Module은 하나만 할당 가능 (hawkBit 제약)
- **API**: 
  - 조회: `GET /rest/v1/distributionsets/{id}/assignedSM`
  - 할당: `POST /rest/v1/distributionsets/{id}/assignedSM`

---

### 2.3 FR-03-3: Distribution Metadata Management

#### 2.3.1 Distribution Set Type Management (Admin Only)
- **UI Route**: `/distributions/types` (설정/관리 메뉴)
- **개요**: Distribution Set의 구조와 필수 모듈 조합을 정의한다.
- **기능**:
  - 목록 조회, 생성, 상세, 수정, 삭제
  - 생성 시 `key`, `name` 필수 입력
- **API**: `/rest/v1/distributionsettypes`

#### 2.3.2 Distribution Set Tag Management
- **UI Route**: `/distributions/tags` (설정/관리 메뉴)
- **개요**: Distribution Set의 릴리즈 상태나 용도를 라벨링한다.
- **기능**:
  - 목록 조회, 생성, 수정(색상 등), 삭제
  - Distribution Set 상세에서 할당/해제 가능
- **API**: `/rest/v1/distributionsettags`

### 2.4 Distribution Set Type & Tag Reference (OpenAPI 기반)

| 항목 | 핵심 API | 설명 |
| --- | --- | --- |
| Distribution Set Type 목록/생성 | `GET/POST /rest/v1/distributionsettypes` | 업데이트 패키지 구조 정의. 생성 시 `name`, `description`, `link` 등 입력. |
| Distribution Set Type 상세/수정/삭제 | `GET/PUT/DELETE /rest/v1/distributionsettypes/{distributionSetTypeId}` | Admin 전용, 해당 타입을 사용하는 Distribution Set 존재 시 삭제 제한. |
| Mandatory Module Types 관리 | `GET /rest/v1/distributionsettypes/{distributionSetTypeId}/mandatorymoduletypes`<br>`POST/DELETE /rest/v1/distributionsettypes/{distributionSetTypeId}/mandatorymoduletypes/{softwareModuleTypeId}` | 필수 Software Module Type 구성. UI에서 체크리스트 제공. |
| Optional Module Types 관리 | `GET /rest/v1/distributionsettypes/{distributionSetTypeId}/optionalmoduletypes`<br>`POST/DELETE /rest/v1/distributionsettypes/{distributionSetTypeId}/optionalmoduletypes/{softwareModuleTypeId}` | 선택 모듈 정의. |
| Target Type 호환성 | `GET /rest/v1/targettypes/{targetTypeId}/compatibledistributionsettypes` | Target Management PRD와 연동, Distribution Set Type 생성 시 목표 Target Type 리스트 제공. |
| Distribution Set Tag 목록/생성 | `GET/POST /rest/v1/distributionsettags` | 안정성/배포 상태 라벨 정의. |
| Distribution Set Tag 수정/삭제 | `PUT/DELETE /rest/v1/distributionsettags/{distributionsetTagId}` | 메타데이터 변경 및 제거. |
| Tag 할당/해제 | `GET /rest/v1/distributionsettags/{distributionsetTagId}/assigned`<br>`POST/DELETE /rest/v1/distributionsettags/{distributionsettagId}/assigned/{distributionsetId}` | 특정 Tag가 부착된 Distribution Set 목록 조회 및 편집. |

> **UI 가이드**: Distribution Set Type 편집 화면에서 Mandatory/Optional Module Types를 시각적으로 편집하고, Tag는 Distribution Set 상세에서 Badges + AutoComplete로 관리한다. Rollout/Assignment 플로우에서는 Type/Tag 조합으로 빠르게 필터링할 수 있도록 한다.

---

## 3. 권한 매트릭스 (Permission Matrix)

| Action | Admin | Operator |
| :--- | :---: | :---: |
| View List/Detail | ✅ | ✅ |
| Create/Update/Delete Module | ✅ | ❌ |
| Upload Artifact | ✅ | ❌ |
| Create/Update/Delete DS | ✅ | ❌ |
| Assign Module to DS | ✅ | ❌ |
| Manage Metadata/Tags | ✅ | ❌ |

---

## 4. 라우팅 및 API 매핑

### 4.1 UI Routes
| UI Route | Component | Description |
| :--- | :--- | :--- |
| `/distributions` | `DistributionLayout` | 메인 레이아웃 (Tabs: DS / Modules) |
| `/distributions/sets` | `DistributionSetList` | DS 목록 |
| `/distributions/sets/:id` | `DistributionSetDetail` | DS 상세 |
| `/distributions/modules` | `SoftwareModuleList` | Module 목록 |
| `/distributions/modules/:id` | `SoftwareModuleDetail` | Module 상세 |

### 4.2 API Endpoints
| Action | Method | API Endpoint |
| :--- | :--- | :--- |
| List DS | `GET` | `/rest/v1/distributionsets` |
| Create DS | `POST` | `/rest/v1/distributionsets` |
| List Modules | `GET` | `/rest/v1/softwaremodules` |
| Create Module | `POST` | `/rest/v1/softwaremodules` |
| Upload Artifact | `POST` | `/rest/v1/softwaremodules/{id}/artifacts` |
| Assign SM to DS | `POST` | `/rest/v1/distributionsets/{id}/assignedSM` |
| Get DS Types | `GET` | `/rest/v1/distributionsettypes` |
| Manage DS Types | `POST/PUT/DELETE` | `/rest/v1/distributionsettypes` (Admin) |
| Get DS Tags | `GET` | `/rest/v1/distributionsettags` |
| Manage DS Tags | `POST/PUT/DELETE` | `/rest/v1/distributionsettags` |

---

## 5. 구현 체크리스트

### Phase 1 (MVP)
- [x] Distribution Management 레이아웃 (Tabs)
- [x] Software Module List (Pagination, Search)
- [x] Distribution Set List (Pagination, Search)
- [x] Software Module Create/Delete
- [x] Artifact Upload (Basic)

### Phase 2 (Detail & Assign)
- [x] Software Module Detail (Artifacts List, Metadata)
- [x] Distribution Set Detail (Assigned Modules, Metadata)
- [x] Assign Module to Distribution Set
- [x] Distribution Set Create/Delete

### Phase 3 (Advanced)
- [x] Drag & Drop Upload UI 개선
- [x] Metadata CRUD
- [x] Tag Management

### Phase 4 (Type Management)
- [x] Distribution Set Type Management
  - [x] DS Type List (CRUD)
  - [x] DS Type Dialog (Create/Edit)
  - [x] Route: `/distributions/ds-types`
- [x] Software Module Type Management
  - [x] SM Type List (CRUD)
  - [x] SM Type Dialog (Create/Edit)
  - [x] Route: `/distributions/sm-types`
- [x] i18n 번역 추가
- [x] 사이드바 네비게이션 추가
### Phase 5 (Tags & Bulk Operations)
- [x] Distribution Set Tags Management
  - [x] Tag List (CRUD)
  - [x] Route: `/distributions/ds-tags`
  - [x] Sidebar: Distributions -> Distribution Sets -> Tags
- [x] Distribution Set Bulk Assignment
  - [x] Bulk Assignment Page (Select Sets, Assign/Unassign Tags)
  - [x] Route: `/distributions/sets/bulk-assign`
  - [x] Sidebar: Distributions -> Distribution Sets -> Bulk Assign
- [ ] Update Distribution Set List
  - [ ] Add "Tags" column
  - [ ] Link to Bulk Assignment
