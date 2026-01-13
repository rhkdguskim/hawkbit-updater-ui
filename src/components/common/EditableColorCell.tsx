import React, { useState } from 'react';
import { Popover, message, Spin } from 'antd';
import { ColorSwatch } from './ColorSwatch';
import { PresetColorPicker } from './PresetColorPicker';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { Color } from 'antd/es/color-picker';

const CellWrapper = styled.div<{ $editable: boolean }>`
    display: flex;
    align-items: center;
    cursor: ${props => (props.$editable ? 'pointer' : 'default')};
    
    &:hover {
        opacity: ${props => (props.$editable ? 0.8 : 1)};
    }
`;

export interface EditableColorCellProps {
    value: string;
    onSave?: (newValue: string) => Promise<void>;
    editable?: boolean;
}

export const EditableColorCell: React.FC<EditableColorCellProps> = ({
    value,
    onSave,
    editable = true,
}) => {
    const { t } = useTranslation('common');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleColorChange = async (_: Color, hex: string) => {
        if (!onSave || hex === value) return;

        setLoading(true);
        try {
            await onSave(hex);
            setOpen(false);
        } catch (error) {
            message.error((error as Error).message || t('messages.error'));
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <div style={{ padding: 8 }}>
            <PresetColorPicker
                value={value}
                onChange={handleColorChange}
            />
        </div>
    );

    if (loading) {
        return <Spin size="small" />;
    }

    if (!editable || !onSave) {
        return <ColorSwatch color={value} />;
    }

    return (
        <Popover
            content={content}
            trigger="click"
            open={open}
            onOpenChange={setOpen}
            placement="bottomLeft"
            overlayInnerStyle={{ padding: 0 }}
        >
            <CellWrapper $editable={true}>
                <ColorSwatch color={value} />
            </CellWrapper>
        </Popover>
    );
};
