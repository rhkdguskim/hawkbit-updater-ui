import React from 'react';
import { Space, Spin, Typography } from 'antd';
import { useGetAssignedSoftwareModules } from '@/api/generated/distribution-sets/distribution-sets';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const { Text } = Typography;

const ModuleTag = styled.div`
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    background: var(--ant-color-fill-alter);
    border: 1px solid var(--ant-color-border-secondary);
    border-radius: var(--ant-border-radius-sm);
    font-size: 11px;
    margin-right: 4px;
    margin-bottom: 4px;
    transition: all 0.2s;

    &:hover {
        border-color: var(--ant-color-primary);
        background: var(--ant-color-primary-bg);
    }
`;

interface InstalledModulesCellProps {
    distributionSetId: number;
}

export const InstalledModulesCell: React.FC<InstalledModulesCellProps> = ({ distributionSetId }) => {
    // Validate distributionSetId - must be a valid positive number
    const isValidId = typeof distributionSetId === 'number' && !isNaN(distributionSetId) && distributionSetId > 0;

    const { data: modules, isLoading } = useGetAssignedSoftwareModules(
        isValidId ? distributionSetId : 0, // Use 0 as fallback (query will be disabled anyway)
        undefined,
        {
            query: {
                staleTime: 60000, // 1 minute
                enabled: isValidId, // Only fetch when ID is valid
            }
        }
    );

    // Early return for invalid ID
    if (!isValidId) {
        return <Text type="secondary" style={{ fontSize: 11 }}>-</Text>;
    }

    if (isLoading) {
        return <Spin size="small" />;
    }

    if (!modules?.content || modules.content.length === 0) {
        return <Text type="secondary" style={{ fontSize: 11 }}>-</Text>;
    }

    return (
        <Space size={[0, 0]} wrap style={{ maxWidth: '100%' }}>
            {modules.content.map((module) => (
                <Link key={module.id} to={`/distributions/modules/${module.id}`}>
                    <ModuleTag>
                        <Text strong style={{ fontSize: 11, marginRight: 4 }}>
                            {module.typeName}:
                        </Text>
                        <Text style={{ fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                            {module.name} ({module.version})
                        </Text>
                    </ModuleTag>
                </Link>
            ))}
        </Space>
    );
};
