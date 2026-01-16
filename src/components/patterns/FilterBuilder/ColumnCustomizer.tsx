import React, { useState, useEffect } from 'react';
import { Popover, Checkbox, Button, Space, Divider, Typography } from 'antd';
import { SettingOutlined, ReloadOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text } = Typography;

const ColumnListWrapper = styled.div`
    max-height: 400px;
    overflow-y: auto;
    min-width: 200px;
`;

const ColumnItem = styled.div`
    padding: 6px 12px;
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
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--ant-color-border-secondary);
`;

export interface ColumnOption {
    key: string;
    label: string;
    defaultVisible?: boolean;
}

interface ColumnCustomizerProps {
    t: (key: string, options?: Record<string, unknown>) => string;
    columns: ColumnOption[];
    visibleColumns: string[];
    onVisibilityChange: (columns: string[]) => void;
}

export const ColumnCustomizer: React.FC<ColumnCustomizerProps> = ({
    t,
    columns,
    visibleColumns,
    onVisibilityChange,
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
        const defaultColumns = columns
            .filter(c => c.defaultVisible !== false)
            .map(c => c.key);
        setLocalVisible(defaultColumns);
        onVisibilityChange(defaultColumns);
    };

    const content = (
        <ColumnListWrapper>
            <div style={{ padding: '8px 12px 0' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {t('columnCustomizer.description', {
                        defaultValue: 'Select columns to display'
                    })}
                </Text>
            </div>
            <Divider style={{ margin: '8px 0' }} />

            {columns.map(col => {
                const translatedLabel = t(`columnCustomizer.columns.${col.key}`, { defaultValue: col.label });
                return (
                    <ColumnItem key={col.key}>
                        <Checkbox
                            checked={localVisible.includes(col.key)}
                            onChange={e => handleToggle(col.key, e.target.checked)}
                        >
                            {translatedLabel}
                        </Checkbox>
                    </ColumnItem>
                );
            })}

            <FooterWrapper>
                <Button
                    size="small"
                    type="text"
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    style={{ fontSize: 12 }}
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
