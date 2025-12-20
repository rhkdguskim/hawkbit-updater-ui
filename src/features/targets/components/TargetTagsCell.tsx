import React from 'react';
import { Tag, Space, Spin, Typography } from 'antd';
import { useGetTags } from '@/api/generated/targets/targets';

const { Text } = Typography;

interface TargetTagsCellProps {
    controllerId: string;
}

export const TargetTagsCell: React.FC<TargetTagsCellProps> = ({ controllerId }) => {
    const { data: tags, isLoading } = useGetTags(controllerId);

    if (isLoading) {
        return <Spin size="small" />;
    }

    if (!tags || tags.length === 0) {
        return <Text type="secondary">-</Text>;
    }

    return (
        <Space size={[0, 8]} wrap>
            {tags.map((tag) => (
                <Tag key={tag.id} color={tag.colour || 'default'}>
                    {tag.name}
                </Tag>
            ))}
        </Space>
    );
};
