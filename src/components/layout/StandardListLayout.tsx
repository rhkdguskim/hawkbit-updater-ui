import { PageLayout, PageHeader, FullHeightSectionCard } from '@/components/patterns';
import styled from 'styled-components';

const TableWrapper = styled.div`
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;

    .ant-table-wrapper {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
    }

    .ant-table-thead > tr > th {
        position: sticky;
        top: 0;
        z-index: 2;
        background: var(--ant-table-header-bg) !important;
    }

    /* Prevent tbody rows from stretching */
    .ant-table-tbody > tr {
        height: auto !important;
    }

    .ant-table-tbody > tr > td {
        height: auto !important;
    }
`;


interface StandardListLayoutProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    /** Optional description shown below title */
    description?: React.ReactNode;
    headerSubtitleExtra?: React.ReactNode;
    headerExtra?: React.ReactNode;
    searchBar?: React.ReactNode;
    bulkActionBar?: React.ReactNode;
    children: React.ReactNode;
    noCardPadding?: boolean;
    /** Whether to render as a standalone page (default: true) */
    standalone?: boolean;
}

export const StandardListLayout: React.FC<StandardListLayoutProps> = ({
    title,
    subtitle,
    description,
    headerSubtitleExtra,
    headerExtra,
    searchBar,
    bulkActionBar,
    children,
    noCardPadding = true,
    standalone = true,
}) => {
    const content = (
        <>
            {searchBar}
            {bulkActionBar}

            <FullHeightSectionCard style={{ padding: noCardPadding ? 0 : undefined }}>
                <TableWrapper>
                    {children}
                </TableWrapper>
            </FullHeightSectionCard>
        </>
    );

    if (!standalone) {
        return content;
    }

    return (
        <PageLayout fullHeight>
            <PageHeader
                title={title}
                subtitle={subtitle}
                description={description}
                subtitleExtra={headerSubtitleExtra}
                actions={headerExtra}
            />
            {content}
        </PageLayout>
    );
};

export default StandardListLayout;
