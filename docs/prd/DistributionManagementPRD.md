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
