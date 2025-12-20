# OpenAPI Client Generation Guideline

## 1. 기준
- **Spec**: `docs/api-spec/management/openapi.json`
- **Base Path**: `/rest/v1` (Proxy 설정됨)
- **Target**: `src/api/generated`

## 2. 도구 (Toolchain)
- **Code Generator**: [Orval](https://orval.dev/)
- **HTTP Client**: Axios (Custom Instance)
- **State Management**: TanStack Query (React Query) v5

## 3. Orval 설정 규칙 (`orval.config.ts`)
| 설정 항목 | 값 | 설명 |
| :--- | :--- | :--- |
| **mode** | `tags-split` | Tag 단위로 파일을 분리하여 생성 (e.g., `targets.ts`, `actions.ts`) |
| **client** | `react-query` | React Query Hook 자동 생성 |
| **mutator** | `src/api/axios-instance.ts` | 커스텀 Axios Instance 사용 (Interceptor 적용) |
| **prettier** | `true` | 생성된 코드 포맷팅 적용 |

## 4. Axios 정책 (`src/api/axios-instance.ts`)
- **Base URL**: `/rest/v1`
- **Interceptors**:
  - **Request**: (추후) Auth Token 주입
  - **Response**:
    - `401 Unauthorized`: 로그인 페이지 리다이렉트 (or Login Modal)
    - `403 Forbidden`: 권한 부족 안내 (Toast)
    - `409 Conflict`: 낙관적 업데이트 실패 또는 중복 요청 처리
    - `429 Too Many Requests`: Retry Logic (Backoff)

## 5. 사용 가이드
### 코드 생성
```bash
npm run gen:api        # 1회 생성
npm run gen:api:watch  # 변경 감지 및 자동 생성
```

### Hook 사용 예시
```tsx
import { useGetTargets } from '@/api/generated/targets';

const { data, isLoading } = useGetTargets({
  q: 'name=="*test*"',
  offset: 0,
  limit: 10
});
```

## 6. 버전 업그레이드 절차
1. `openapi.json` 최신화
2. `npm run gen:api` 실행
3. 타입 에러(Breaking Changes) 수정
4. 주요 화면 테스트
