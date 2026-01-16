import React from 'react';
import styled from 'styled-components';
import { PageLayout } from '@/components/patterns';
import { DashboardScrollContent, DashboardSurface } from '../DashboardStyles';

const TopRow = styled.section`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    align-items: stretch;
    grid-auto-rows: minmax(0, 1fr);

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const OpsRow = styled.section`
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 8px;
    min-height: 340px;
    align-items: stretch;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

const OpsStack = styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 0;
    min-height: 0;
`;

const StackItem = styled.div<{ $flex?: number }>`
    flex: ${props => props.$flex ?? 1} 1 0;
    min-height: 0;
    display: flex;
    flex-direction: column;
`;

const SignalsRow = styled.section`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
    align-items: stretch;
    grid-auto-rows: minmax(200px, 1fr);

    @media (max-width: 1400px) {
        grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

const TrendRow = styled.section`
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 8px;
    min-height: 240px;
    align-items: stretch;

    @media (max-width: 1200px) {
        grid-template-columns: 1fr;
    }
`;

interface DashboardItem {
    node: React.ReactNode;
    flex?: number;
}

interface MinimalOpsDashboardProps {
    header: React.ReactNode;
    topRow: DashboardItem[];
    opsLeft: DashboardItem[];
    opsRight: DashboardItem[];
    signals: DashboardItem[];
    trendLeft: React.ReactNode;
    trendRight: DashboardItem[];
}

export const MinimalOpsDashboard: React.FC<MinimalOpsDashboardProps> = ({
    header,
    topRow,
    opsLeft,
    opsRight,
    signals,
    trendLeft,
    trendRight,
}) => {
    return (
        <PageLayout fullWidth fullHeight padding="8px 12px 10px" gap="8px">
            <DashboardSurface>
                {header}
                <DashboardScrollContent>
                    <TopRow>
                        {topRow.map((item, index) => (
                            <StackItem key={`top-${index}`} $flex={item.flex}>
                                {item.node}
                            </StackItem>
                        ))}
                    </TopRow>
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
                    <SignalsRow>
                        {signals.map((item, index) => (
                            <StackItem key={`signal-${index}`} $flex={item.flex}>
                                {item.node}
                            </StackItem>
                        ))}
                    </SignalsRow>
                    <TrendRow>
                        <StackItem>{trendLeft}</StackItem>
                        <OpsStack>
                            {trendRight.map((item, index) => (
                                <StackItem key={`trend-right-${index}`} $flex={item.flex}>
                                    {item.node}
                                </StackItem>
                            ))}
                        </OpsStack>
                    </TrendRow>
                </DashboardScrollContent>
            </DashboardSurface>
        </PageLayout>
    );
};

export default MinimalOpsDashboard;
