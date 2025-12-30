import React, { useState, useRef, useEffect } from 'react';
import { Input, Typography, Spin, message, type InputRef } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import type { TextAreaRef } from 'antd/es/input/TextArea';

const { Text } = Typography;

const CellWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 24px;

    .edit-icon {
        opacity: 0;
        transition: opacity 0.15s ease;
        cursor: pointer;
        color: var(--ant-color-primary);
    }

    &:hover .edit-icon {
        opacity: 1;
    }
`;

const EditWrapper = styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
    width: 100%;

    .ant-input {
        font-size: var(--ant-font-size-sm);
    }

    .action-icon {
        cursor: pointer;
        font-size: var(--ant-font-size);
        padding: 2px;
        border-radius: 4px;
        transition: all 0.15s ease;

        &:hover {
            background: var(--ant-color-fill-quaternary);
        }

        &.save-icon {
            color: var(--ant-color-success);
        }

        &.cancel-icon {
            color: var(--ant-color-text-secondary);
        }
    }
`;

const EditInput = styled(Input)`
    flex: 1;
`;

const EditTextArea = styled(Input.TextArea)`
    flex: 1;
`;

const CellText = styled(Text)<{ $editable: boolean }>`
    font-size: var(--ant-font-size-sm);
    cursor: ${props => (props.$editable ? 'pointer' : 'default')};
`;

export interface EditableCellProps {
    /** Current value */
    value: string;
    /** Callback when saving - returns promise for loading state */
    onSave: (newValue: string) => Promise<void>;
    /** Whether the cell is editable */
    editable?: boolean;
    /** Display as secondary text */
    secondary?: boolean;
    /** Placeholder text */
    placeholder?: string;
    /** Input type */
    type?: 'text' | 'textarea';
    /** Max length for input */
    maxLength?: number;
}

export const EditableCell: React.FC<EditableCellProps> = ({
    value,
    onSave,
    editable = true,
    secondary = false,
    placeholder = '-',
    type = 'text',
    maxLength,
}) => {
    const { t } = useTranslation('common');
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const inputRef = useRef<InputRef | TextAreaRef>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [editing]);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    const handleStartEdit = () => {
        if (!editable) return;
        setEditValue(value);
        setEditing(true);
    };

    const handleSave = async () => {
        if (editValue === value) {
            setEditing(false);
            return;
        }

        setLoading(true);
        try {
            await onSave(editValue);
            setEditing(false);
        } catch (error) {
            message.error((error as Error).message || t('messages.error'));
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type === 'text') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    };

    if (loading) {
        return <Spin size="small" />;
    }

    if (editing) {
        const InputComponent = type === 'textarea' ? EditTextArea : EditInput;
        return (
            <EditWrapper>
                <InputComponent
                    ref={inputRef as never}
                    size="small"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={handleSave}
                    maxLength={maxLength}
                    {...(type === 'textarea' ? { rows: 2, autoSize: { minRows: 1, maxRows: 3 } } : {})}
                />
                <CheckOutlined className="action-icon save-icon" onClick={handleSave} />
                <CloseOutlined className="action-icon cancel-icon" onClick={handleCancel} />
            </EditWrapper>
        );
    }

    return (
        <CellWrapper onClick={handleStartEdit}>
            <CellText
                type={secondary ? 'secondary' : undefined}
                $editable={editable}
                ellipsis={{ tooltip: value }}
            >
                {value || placeholder}
            </CellText>
            {editable && <EditOutlined className="edit-icon" />}
        </CellWrapper>
    );
};

export default EditableCell;
