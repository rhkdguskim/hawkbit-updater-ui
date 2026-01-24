import React from 'react';
import { Spin, Empty, Alert, Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

const Container = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const CenterContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SkeletonContainer = styled.div`
  padding: 16px;
`;

export interface DataViewProps {
    loading?: boolean;
    error?: Error | null;
    isEmpty?: boolean;
    emptyText?: string;
    children: React.ReactNode;
    /** Use skeleton loading instead of spinner */
    useSkeleton?: boolean;
    /** Number of skeleton rows to show */
    skeletonRows?: number;
}

/**
 * DataView Pattern
 * - Handles Loading, Error, and Empty states consistently
 * - Ensures the content area takes up remaining space
 * - Supports both spinner and skeleton loading states
 */
export const DataView: React.FC<DataViewProps> = ({
    loading,
    error,
    isEmpty,
    emptyText,
    children,
    useSkeleton = false,
    skeletonRows = 5,
}) => {
    const { t } = useTranslation('common');

    if (loading) {
        if (useSkeleton) {
            return (
                <Container>
                    <SkeletonContainer>
                        <Skeleton active paragraph={{ rows: skeletonRows }} />
                    </SkeletonContainer>
                </Container>
            );
        }
        return (
            <Container>
                <CenterContent
                    role="status"
                    aria-live="polite"
                    aria-label={t('accessibility.loading')}
                >
                    <Spin size="large" />
                </CenterContent>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert
                    type="error"
                    message={t('errors.loadFailed')}
                    description={error.message}
                    showIcon
                    role="alert"
                />
            </Container>
        );
    }

    if (isEmpty) {
        return (
            <Container>
                <CenterContent>
                    <Empty description={emptyText || t('messages.noData')} />
                </CenterContent>
            </Container>
        );
    }

    return <Container>{children}</Container>;
};
