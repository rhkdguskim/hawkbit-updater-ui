import React from 'react';
import styled from 'styled-components';
import { PageLayout } from '@/components/patterns';
import { DashboardScrollContent, DashboardSurface } from '@/components/patterns/DashboardStyles';
import { TYPOGRAPHY, SPACING, MEDIA_QUERIES, TRANSITIONS } from '@/theme/dashboard-design-system';

/* ============================================================================
   SECTION COMPONENTS - 기능별 영역 구분
   ============================================================================ */

const SectionTitle = styled.h3`
    font-size: ${TYPOGRAPHY.components.h3.fontSize};
    font-weight: ${TYPOGRAPHY.components.h3.fontWeight};
    text-transform: ${TYPOGRAPHY.components.h3.textTransform};
    letter-spacing: ${TYPOGRAPHY.components.h3.letterSpacing};
    color: var(--ant-color-text-tertiary);
    margin: 0 0 ${SPACING[3]} ${SPACING[1]};
    display: flex;
    align-items: center;
    gap: ${SPACING[2]};

    &::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(to right, var(--ant-color-border), transparent);
    }
`;

const KPIRow = styled.section`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${SPACING[4]};
    align-items: stretch;
    flex-shrink: 0;

    ${MEDIA_QUERIES.maxXl} {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    ${MEDIA_QUERIES.maxLg} {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    ${MEDIA_QUERIES.maxMd} {
        grid-template-columns: 1fr;
        gap: ${SPACING[3]};
    }
`;

const OpsRow = styled.section`
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: ${SPACING[4]};
    align-items: stretch;
    min-height: 400px;
    flex-shrink: 0;
    transition: ${TRANSITIONS.default};

    ${MEDIA_QUERIES.maxLg} {
        grid-template-columns: 1fr;
        min-height: auto;
        gap: ${SPACING[3]};
    }
`;

const OpsStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: ${SPACING[4]};
    min-width: 0;
    min-height: 100%;

    ${MEDIA_QUERIES.maxLg} {
        gap: ${SPACING[3]};
    }
`;

const StackItem = styled.div<{ $flex?: number }>`
    flex: ${props => props.$flex ?? 1} 1 auto;
    min-height: 180px;
    display: flex;
    flex-direction: column;
    transition: ${TRANSITIONS.default};
    
    & > * {
        flex: 1;
        min-height: 0;
    }

    ${MEDIA_QUERIES.maxMd} {
        min-height: 160px;
    }
`;

const SignalsRow = styled.section`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: ${SPACING[4]};
    align-items: stretch;
    grid-auto-rows: minmax(240px, auto);
    flex-shrink: 0;

    ${MEDIA_QUERIES.maxXl} {
        grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    ${MEDIA_QUERIES.maxLg} {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-auto-rows: minmax(220px, auto);
    }

    ${MEDIA_QUERIES.maxMd} {
        grid-template-columns: 1fr;
        gap: ${SPACING[3]};
        grid-auto-rows: minmax(200px, auto);
    }
`;

const TrendRow = styled.section`
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: ${SPACING[4]};
    align-items: stretch;
    min-height: 380px;
    flex-shrink: 0;

    ${MEDIA_QUERIES.maxLg} {
        grid-template-columns: 1fr;
        min-height: auto;
        gap: ${SPACING[3]};
    }
`;

const Section = styled.div<{ $withTitle?: boolean }>`
    display: flex;
    flex-direction: column;
    gap: 0;
`;

/* ============================================================================
   INTERFACES
   ============================================================================ */

interface DashboardItem {
    node: React.ReactNode;
    flex?: number;
}

interface MinimalOpsDashboardProps {
    header?: React.ReactNode;
    /** KPI 카드들 (시스템 상태 요약) */
    topRow?: DashboardItem[];
    topRowTitle?: string;
    /** 운영 현황 왼쪽 (롤아웃, 진행중 액션) */
    opsLeft?: DashboardItem[];
    /** 운영 현황 오른쪽 (최근 완료, 에러) */
    opsRight?: DashboardItem[];
    opsTitle?: string;
    /** 신호/차트 위젯들 */
    signals?: DashboardItem[];
    signalsTitle?: string;
    /** 트렌드 차트 왼쪽 */
    trendLeft?: React.ReactNode;
    /** 트렌드 위젯 오른쪽 */
    trendRight?: DashboardItem[];
    trendTitle?: string;
}

/* ============================================================================
   MAIN COMPONENT
   ============================================================================ */

export const MinimalOpsDashboard: React.FC<MinimalOpsDashboardProps> = ({
    header,
    topRow = [],
    topRowTitle,
    opsLeft = [],
    opsRight = [],
    opsTitle,
    signals = [],
    signalsTitle,
    trendLeft,
    trendRight = [],
    trendTitle,
}) => {
    return (
        <PageLayout fullWidth fullHeight padding="0" gap="8px">
            <DashboardSurface>
                {header}
                <DashboardScrollContent>
                    {/* KPI Section - 핵심 지표 */}
                    {topRow.length > 0 && (
                        <Section $withTitle={!!topRowTitle}>
                            {topRowTitle && <SectionTitle>{topRowTitle}</SectionTitle>}
                            <KPIRow>
                                {topRow.map((item, index) => (
                                    <StackItem key={`top-${index}`} $flex={item.flex}>
                                        {item.node}
                                    </StackItem>
                                ))}
                            </KPIRow>
                        </Section>
                    )}

                    {/* Operations Section - 운영 현황 */}
                    {(opsLeft.length > 0 || opsRight.length > 0) && (
                        <Section $withTitle={!!opsTitle}>
                            {opsTitle && <SectionTitle>{opsTitle}</SectionTitle>}
                            <OpsRow>
                                <OpsStack>
                                    {opsLeft.map((item, index) => (
                                        <StackItem key={`ops-left-${index}`} $flex={item.flex}>
                                            {item.node}
                                        </StackItem>
                                    ))}
                                </OpsStack>
                                <OpsStack>
                                    {opsRight.map((item, index) => (
                                        <StackItem key={`ops-right-${index}`} $flex={item.flex}>
                                            {item.node}
                                        </StackItem>
                                    ))}
                                </OpsStack>
                            </OpsRow>
                        </Section>
                    )}

                    {/* Signals Section - 모니터링 신호 */}
                    {signals.length > 0 && (
                        <Section $withTitle={!!signalsTitle}>
                            {signalsTitle && <SectionTitle>{signalsTitle}</SectionTitle>}
                            <SignalsRow>
                                {signals.map((item, index) => (
                                    <StackItem key={`signal-${index}`} $flex={item.flex}>
                                        {item.node}
                                    </StackItem>
                                ))}
                            </SignalsRow>
                        </Section>
                    )}

                    {/* Trend Section - 트렌드 분석 */}
                    {(trendLeft || trendRight.length > 0) && (
                        <Section $withTitle={!!trendTitle}>
                            {trendTitle && <SectionTitle>{trendTitle}</SectionTitle>}
                            <TrendRow>
                                {trendLeft && <StackItem>{trendLeft}</StackItem>}
                                <OpsStack>
                                    {trendRight.map((item, index) => (
                                        <StackItem key={`trend-right-${index}`} $flex={item.flex}>
                                            {item.node}
                                        </StackItem>
                                    ))}
                                </OpsStack>
                            </TrendRow>
                        </Section>
                    )}
                </DashboardScrollContent>
            </DashboardSurface>
        </PageLayout>
    );
};

export default MinimalOpsDashboard;
