import React from 'react';
import { Space, theme } from 'antd';
import styled from 'styled-components';

const { useToken } = theme;

const BarContainer = styled.div<{ $gap: string }>`
  display: flex;
  flex-direction: column;
  gap: ${props => props.$gap};
  width: 100%;
`;

const BarRow = styled(Space)`
    && {
        width: 100%;
        justify-content: space-between;
    }
`;

export interface FilterBarProps {
    children: React.ReactNode;
    extra?: React.ReactNode;
}

/**
 * FilterBar Pattern
 * - Standardized spacing between filter elements
 * - Ensures vertical alignment and consistent height
 */
export const FilterBar: React.FC<FilterBarProps> = ({ children, extra }) => {
    const { token } = useToken();

    return (
        <BarContainer $gap={`${token.marginXS}px`}>
            <BarRow wrap size="middle">
                <Space wrap size="middle">
                    {children}
                </Space>
                {extra && (
                    <Space wrap size="middle">
                        {extra}
                    </Space>
                )}
            </BarRow>
        </BarContainer>
    );
};
