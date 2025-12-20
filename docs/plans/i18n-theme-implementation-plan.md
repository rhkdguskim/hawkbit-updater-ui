# i18n & Theme Implementation Plan

## 개요

본 문서는 updater-ui 애플리케이션에 다국어(한글/영어) 지원과 테마(Light/Dark/System) 설정 기능 구현을 위한 상세 계획을 정의한다.

---

## 1. 의존성 설치

### 필요 패키지

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### 타입 정의 (TypeScript)
- `i18next`와 `react-i18next`는 자체 타입 포함

---

## 2. 다국어(i18n) 구현 계획

### Phase 1: i18n 인프라 구축

#### 2.1 폴더 구조 생성

```
src/i18n/
├── locales/
│   ├── ko/
│   │   ├── common.json       # 공통 UI 텍스트
│   │   ├── auth.json         # 인증 관련
│   │   ├── targets.json      # Target 관리
│   │   ├── distributions.json
│   │   ├── rollouts.json
│   │   └── validation.json   # 유효성 검사 메시지
│   └── en/
│       ├── common.json
│       ├── auth.json
│       ├── targets.json
│       ├── distributions.json
│       ├── rollouts.json
│       └── validation.json
└── index.ts                  # i18n 설정
```

#### 2.2 i18n 설정 파일 (`src/i18n/index.ts`)

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 번역 파일 import
import koCommon from './locales/ko/common.json';
import koTargets from './locales/ko/targets.json';
import koAuth from './locales/ko/auth.json';
import enCommon from './locales/en/common.json';
import enTargets from './locales/en/targets.json';
import enAuth from './locales/en/auth.json';

const resources = {
  ko: {
    common: koCommon,
    targets: koTargets,
    auth: koAuth,
  },
  en: {
    common: enCommon,
    targets: enTargets,
    auth: enAuth,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'targets', 'auth'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

#### 2.3 언어 상태 관리 (`src/stores/useLanguageStore.ts`)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import i18n from '@/i18n';

type Language = 'ko' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: (i18n.language as Language) || 'ko',
      setLanguage: (lang) => {
        i18n.changeLanguage(lang);
        set({ language: lang });
      },
    }),
    {
      name: 'updater-language-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Phase 2: 번역 파일 작성

#### 2.4 한국어 번역 파일 예시 (`src/i18n/locales/ko/common.json`)

```json
{
  "appName": "hawkBit 업데이터",
  "nav": {
    "dashboard": "대시보드",
    "targets": "타겟 관리",
    "distributions": "배포 세트",
    "rollouts": "롤아웃",
    "system": "시스템 설정"
  },
  "actions": {
    "save": "저장",
    "cancel": "취소",
    "delete": "삭제",
    "edit": "편집",
    "create": "생성",
    "add": "추가",
    "refresh": "새로고침",
    "search": "검색",
    "confirm": "확인",
    "back": "뒤로"
  },
  "status": {
    "online": "온라인",
    "offline": "오프라인",
    "pending": "대기 중",
    "running": "실행 중",
    "finished": "완료",
    "error": "오류"
  },
  "messages": {
    "success": "성공적으로 처리되었습니다.",
    "error": "오류가 발생했습니다.",
    "loading": "로딩 중...",
    "noData": "데이터가 없습니다.",
    "confirmDelete": "정말 삭제하시겠습니까?"
  },
  "settings": {
    "language": "언어",
    "theme": "테마",
    "lightMode": "라이트 모드",
    "darkMode": "다크 모드",
    "systemMode": "시스템 설정"
  }
}
```

#### 2.5 영어 번역 파일 예시 (`src/i18n/locales/en/common.json`)

```json
{
  "appName": "hawkBit Updater",
  "nav": {
    "dashboard": "Dashboard",
    "targets": "Targets",
    "distributions": "Distribution Sets",
    "rollouts": "Rollouts",
    "system": "System Settings"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "add": "Add",
    "refresh": "Refresh",
    "search": "Search",
    "confirm": "Confirm",
    "back": "Back"
  },
  "status": {
    "online": "Online",
    "offline": "Offline",
    "pending": "Pending",
    "running": "Running",
    "finished": "Finished",
    "error": "Error"
  },
  "messages": {
    "success": "Operation completed successfully.",
    "error": "An error occurred.",
    "loading": "Loading...",
    "noData": "No data available.",
    "confirmDelete": "Are you sure you want to delete?"
  },
  "settings": {
    "language": "Language",
    "theme": "Theme",
    "lightMode": "Light Mode",
    "darkMode": "Dark Mode",
    "systemMode": "System"
  }
}
```

### Phase 3: UI 컴포넌트 적용

#### 2.6 언어 선택 컴포넌트 (`src/components/common/LanguageSwitcher.tsx`)

```typescript
import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useLanguageStore } from '@/stores/useLanguageStore';

const languageOptions = [
  { value: 'ko', label: '🇰🇷 한국어' },
  { value: 'en', label: '🇺🇸 English' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguageStore();

  return (
    <Select
      value={language}
      onChange={setLanguage}
      options={languageOptions}
      suffixIcon={<GlobalOutlined />}
      style={{ width: 120 }}
      bordered={false}
    />
  );
};

export default LanguageSwitcher;
```

---

## 3. 테마 설정 구현 계획

### Phase 1: 테마 인프라 구축

#### 3.1 폴더 구조

```
src/theme/
├── lightTheme.ts
├── darkTheme.ts
└── index.ts
```

#### 3.2 테마 정의 (`src/theme/lightTheme.ts`)

```typescript
import type { ThemeConfig } from 'antd';

export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f0f2f5',
    colorText: 'rgba(0, 0, 0, 0.88)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  components: {
    Layout: {
      siderBg: '#001529',
      headerBg: '#ffffff',
    },
    Menu: {
      darkItemBg: '#001529',
    },
  },
};
```

#### 3.3 다크 테마 정의 (`src/theme/darkTheme.ts`)

```typescript
import { theme } from 'antd';
import type { ThemeConfig } from 'antd';

export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#177ddc',
    colorBgContainer: '#1f1f1f',
    colorBgLayout: '#141414',
    colorText: 'rgba(255, 255, 255, 0.85)',
    colorTextSecondary: 'rgba(255, 255, 255, 0.65)',
    borderRadius: 8,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  algorithm: theme.darkAlgorithm,
  components: {
    Layout: {
      siderBg: '#1f1f1f',
      headerBg: '#141414',
    },
  },
};
```

#### 3.4 테마 상태 관리 (`src/stores/useThemeStore.ts`)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  getResolvedTheme: () => 'light' | 'dark';
}

const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'system',
      setMode: (mode) => set({ mode }),
      getResolvedTheme: () => {
        const { mode } = get();
        if (mode === 'system') {
          return getSystemTheme();
        }
        return mode;
      },
    }),
    {
      name: 'updater-theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### Phase 2: UI 컴포넌트 적용

#### 3.5 테마 전환 컴포넌트 (`src/components/common/ThemeSwitcher.tsx`)

```typescript
import React from 'react';
import { Dropdown, Button } from 'antd';
import { SunOutlined, MoonOutlined, DesktopOutlined } from '@ant-design/icons';
import { useThemeStore } from '@/stores/useThemeStore';
import type { MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher: React.FC = () => {
  const { t } = useTranslation();
  const { mode, setMode, getResolvedTheme } = useThemeStore();
  const resolvedTheme = getResolvedTheme();

  const items: MenuProps['items'] = [
    {
      key: 'light',
      icon: <SunOutlined />,
      label: t('settings.lightMode'),
    },
    {
      key: 'dark',
      icon: <MoonOutlined />,
      label: t('settings.darkMode'),
    },
    {
      key: 'system',
      icon: <DesktopOutlined />,
      label: t('settings.systemMode'),
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        selectedKeys: [mode],
        onClick: ({ key }) => setMode(key as ThemeMode),
      }}
      trigger={['click']}
    >
      <Button
        type="text"
        icon={resolvedTheme === 'dark' ? <MoonOutlined /> : <SunOutlined />}
      />
    </Dropdown>
  );
};

export default ThemeSwitcher;
```

### Phase 3: App 레벨 통합

#### 3.6 App.tsx 또는 main.tsx 수정

```typescript
import { ConfigProvider } from 'antd';
import { useThemeStore } from '@/stores/useThemeStore';
import { lightTheme } from '@/theme/lightTheme';
import { darkTheme } from '@/theme/darkTheme';
import '@/i18n'; // i18n 초기화

const ThemedApp: React.FC = () => {
  const { getResolvedTheme } = useThemeStore();
  const resolvedTheme = getResolvedTheme();

  return (
    <ConfigProvider theme={resolvedTheme === 'dark' ? darkTheme : lightTheme}>
      <App />
    </ConfigProvider>
  );
};
```

---

## 4. 구현 일정

| 단계 | 작업 내용 | 예상 소요 시간 |
|:---:|:---|:---:|
| 1 | 패키지 설치 및 폴더 구조 생성 | 30분 |
| 2 | i18n 설정 파일 작성 | 1시간 |
| 3 | 한국어/영어 번역 파일 작성 (common) | 2시간 |
| 4 | 언어 Store 및 Switcher 컴포넌트 구현 | 1시간 |
| 5 | 테마 정의 파일 작성 | 1시간 |
| 6 | 테마 Store 및 Switcher 컴포넌트 구현 | 1시간 |
| 7 | App 레벨 통합 (ConfigProvider, i18n) | 1시간 |
| 8 | Header에 Language/Theme Switcher 통합 | 1시간 |
| 9 | 기존 컴포넌트들 i18n 적용 (Targets) | 3시간 |
| 10 | 테스트 및 검증 | 1시간 |
| **총계** | | **약 12시간** |

---

## 5. 체크리스트

### i18n 구현

- [x] i18next 및 react-i18next 설치
- [x] i18n 설정 파일 생성
- [x] 한국어 번역 파일 작성 (common, auth, targets)
- [x] 영어 번역 파일 작성 (common, auth, targets)
- [x] useLanguageStore 구현
- [x] LanguageSwitcher 컴포넌트 구현
- [x] Header에 LanguageSwitcher 통합
- [x] Sidebar에 useTranslation 적용
- [ ] Target 컴포넌트들에 useTranslation 적용 (Phase 2)

### 테마 구현

- [x] lightTheme.ts 작성
- [x] darkTheme.ts 작성
- [x] useThemeStore 구현
- [x] ThemeSwitcher 컴포넌트 구현
- [x] Header에 ThemeSwitcher 통합
- [x] ConfigProvider에 동적 테마 적용 (ThemeProvider)
- [x] 시스템 다크모드 감지 기능 구현

### 검증

- [ ] 언어 전환 시 모든 텍스트 변경 확인
- [ ] 테마 전환 시 모든 컴포넌트 스타일 변경 확인
- [ ] 새로고침 후에도 설정 유지 확인
- [ ] 시스템 테마 변경 시 자동 반영 확인 (system 모드)

---

## 6. 구현 완료 파일 목록

### 새로 생성된 파일

| 파일 경로 | 설명 |
|:---|:---|
| `src/i18n/index.ts` | i18n 초기화 및 설정 |
| `src/i18n/locales/ko/common.json` | 한국어 공통 번역 |
| `src/i18n/locales/ko/targets.json` | 한국어 타겟 관리 번역 |
| `src/i18n/locales/ko/auth.json` | 한국어 인증 번역 |
| `src/i18n/locales/en/common.json` | 영어 공통 번역 |
| `src/i18n/locales/en/targets.json` | 영어 타겟 관리 번역 |
| `src/i18n/locales/en/auth.json` | 영어 인증 번역 |
| `src/theme/lightTheme.ts` | 라이트 테마 설정 |
| `src/theme/darkTheme.ts` | 다크 테마 설정 |
| `src/theme/index.ts` | 테마 exports |
| `src/stores/useThemeStore.ts` | 테마 상태 관리 |
| `src/stores/useLanguageStore.ts` | 언어 상태 관리 |
| `src/components/common/LanguageSwitcher.tsx` | 언어 전환 컴포넌트 |
| `src/components/common/ThemeSwitcher.tsx` | 테마 전환 컴포넌트 |
| `src/components/common/index.ts` | 공통 컴포넌트 exports |
| `src/providers/ThemeProvider.tsx` | 테마 Provider |
| `src/providers/index.ts` | Provider exports |

### 수정된 파일

| 파일 경로 | 변경 내용 |
|:---|:---|
| `src/main.tsx` | i18n 초기화 및 ThemeProvider 통합 |
| `src/components/layout/AppHeader.tsx` | LanguageSwitcher, ThemeSwitcher 통합 및 i18n 적용 |
| `src/components/layout/Sidebar.tsx` | 메뉴 항목 i18n 적용 |

