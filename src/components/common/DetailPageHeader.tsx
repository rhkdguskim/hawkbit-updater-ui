import React from 'react';
import { PageHeader } from '@/components/patterns';
import { Skeleton, Space } from 'antd';
import styled from 'styled-components';
import { StatusTag } from './StatusTag';

const TitleSkeleton = styled(Skeleton.Input)`
    width: clamp(12rem, 26vw, 18rem);
`;

const ExtraGroup = styled(Space)`
    && {
        align-items: center;
    }
`;

export interface DetailPageHeaderProps {
    /** Title of the page */
    title?: string;
    /** Optional description shown below title */
    description?: string;
    /** Status string for StatusTag component */
    status?: string;
    /** Back button label */
    backLabel: string;
    /** Callback when back button is clicked */
    onBack: () => void;
    /** Show loading skeleton for title */
    loading?: boolean;
    /** Action buttons to show on the right side */
    actions?: React.ReactNode;
    /** Additional content to show after status tag */
    extra?: React.ReactNode;
}

/**
 * Standardized header component for all detail pages.
 * Re-implemented using the PageHeader pattern to ensure application-wide consistency.
 */
export const DetailPageHeader: React.FC<DetailPageHeaderProps> = ({
    title,
    description,
    status,
    backLabel,
    onBack,
    loading = false,
    actions,
    extra,
}) => {
    return (
        <PageHeader
            onBack={onBack}
            backLabel={backLabel}
            title={loading ? <TitleSkeleton active size="large" /> : title}
            description={description}
            extra={(status || extra) && (
                <ExtraGroup size="small">
                    {status && <StatusTag status={status} />}
                    {extra}
                </ExtraGroup>
            )}
            actions={actions}
        />
    );
};

export default DetailPageHeader;
