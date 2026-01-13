/**
 * Column Customizer Component
 * Allows users to show/hide and reorder table columns
 */
import React, { useState, useEffect } from 'react';
import { Popover, Checkbox, Button, Space, Divider, Typography } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { COLUMN_CONFIG, type ColumnConfig } from '../config/targetListConfig';

const { Text } = Typography;

const ColumnListWrapper = styled.div`
    max-height: 400px;
    overflow-y: auto;
    min-width: 200px;
`;

const ColumnItem = styled.div`
    padding: 6px 0;
    display: flex;
    align-items: center;
    
    &:hover {
        background-color: var(--ant-color-fill-quaternary);
    }
    
    .ant-checkbox-wrapper {
        flex: 1;
    }
`;

const FooterWrapper = styled.div`
    padding-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
`;

interface ColumnCustomizerProps {
    t: (key: string, options?: Record<string, unknown>) => string;
    visibleColumns: string[];
    onVisibilityChange: (columns: string[]) => void;
    columnLabels?: Record<string, string>;
}

export const ColumnCustomizer: React.FC<ColumnCustomizerProps> = ({
    t,
    visibleColumns,
    onVisibilityChange,
    columnLabels = {},
}) => {
    const [open, setOpen] = useState(false);
    const [localVisible, setLocalVisible] = useState<string[]>(visibleColumns);

    useEffect(() => {
        setLocalVisible(visibleColumns);
    }, [visibleColumns]);

    const handleToggle = (key: string, checked: boolean) => {
        const newVisible = checked
            ? [...localVisible, key]
            : localVisible.filter(k => k !== key);
        setLocalVisible(newVisible);
    };

    const handleApply = () => {
        onVisibilityChange(localVisible);
        setOpen(false);
    };

    const handleReset = () => {
        const defaultColumns = COLUMN_CONFIG
            .filter(c => c.defaultVisible)
            .map(c => c.key);
        setLocalVisible(defaultColumns);
        onVisibilityChange(defaultColumns);
    };

    const getColumnLabel = (config: ColumnConfig): string => {
        if (columnLabels[config.key]) {
            return columnLabels[config.key];
        }
        // Fallback to translation or key name
        return t(`table.${config.key}`, { defaultValue: config.key });
    };

    const content = (
        <ColumnListWrapper>
            <Text type="secondary" style={{ fontSize: 12 }}>
                {t('columnCustomizer.description', {
                    defaultValue: 'Select columns to display'
                })}
            </Text>
            <Divider style={{ margin: '8px 0' }} />

            {COLUMN_CONFIG.filter(c => c.key !== 'actions').map(config => (
                <ColumnItem key={config.key}>
                    <Checkbox
                        checked={localVisible.includes(config.key)}
                        onChange={e => handleToggle(config.key, e.target.checked)}
                    >
                        {getColumnLabel(config)}
                    </Checkbox>
                </ColumnItem>
            ))}

            <Divider style={{ margin: '8px 0' }} />

            <FooterWrapper>
                <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                >
                    {t('common:actions.reset', { defaultValue: 'Reset' })}
                </Button>
                <Space>
                    <Button size="small" onClick={() => setOpen(false)}>
                        {t('common:actions.cancel', { defaultValue: 'Cancel' })}
                    </Button>
                    <Button
                        type="primary"
                        size="small"
                        onClick={handleApply}
                    >
                        {t('common:actions.apply', { defaultValue: 'Apply' })}
                    </Button>
                </Space>
            </FooterWrapper>
        </ColumnListWrapper>
    );

    return (
        <Popover
            content={content}
            title={t('columnCustomizer.title', { defaultValue: 'Customize Columns' })}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomRight"
        >
            <Button icon={<SettingOutlined />} size="small">
                {t('columnCustomizer.button', { defaultValue: 'Columns' })}
            </Button>
        </Popover>
    );
};

export default ColumnCustomizer;
