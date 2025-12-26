import React from 'react';
import { PageHeader } from '@/components/patterns';
import { Skeleton } from 'antd';

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
            title={loading ? <Skeleton.Input active size="large" style={{ width: 200, height: 32 }} /> : title}
            description={description}
            extra={(status || extra) && (
                <>
                    {status && (
                        <div style={{ marginLeft: 4 }}>
                            {/* StatusTag logic is now handled by the caller, passing it as extra if needed, 
                                but for DetailPageHeader we'll keep the StatusTag here for compatibility */}
                            <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 'var(--ant-font-size-sm)' }}>
                                {status}
                            </div>
                        </div>
                    )}
                    {extra}
                </>
            )}
            actions={actions}
        />
    );
};

export default DetailPageHeader;
