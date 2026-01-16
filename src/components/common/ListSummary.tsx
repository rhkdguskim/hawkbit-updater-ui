import React from 'react';
import { Space, Tag } from 'antd';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';

interface ListSummaryProps {
    loaded: number;
    total?: number;
    filtersCount?: number;
    updatedAt?: number;
    isFetching?: boolean;
}

export const ListSummary: React.FC<ListSummaryProps> = ({
    loaded,
    total,
    filtersCount = 0,
    updatedAt,
    isFetching = false,
}) => {
    const { t } = useTranslation('common');
    const totalCount = total ?? loaded;
    const updatedLabel = updatedAt ? dayjs(updatedAt).format('HH:mm:ss') : '--';

    return (
        <Space size="small" wrap>
            <Tag color="blue">
                {t('list.summary.loaded', { loaded, total: totalCount })}
            </Tag>
            {filtersCount > 0 && (
                <Tag color="cyan">
                    {t('list.summary.filters', { count: filtersCount })}
                </Tag>
            )}
            <Tag color={isFetching ? 'gold' : 'default'}>
                {t('list.summary.updated', { time: updatedLabel })}
            </Tag>
        </Space>
    );
};

export default ListSummary;
