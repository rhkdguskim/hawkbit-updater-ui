import React, { useMemo } from 'react';
import { ColorPicker, type ColorPickerProps, theme, Tooltip } from 'antd';
import type { Color } from 'antd/es/color-picker';
import { generateColor } from 'antd/es/color-picker/util';

export interface PresetColorPickerProps extends Omit<ColorPickerProps, 'presets'> {
    value?: string | Color;
    onChange?: (value: Color, hex: string) => void;
}

const RECOMMENDED_COLORS = [
    '#1677ff', // Blue (Primary)
    'var(--ant-color-success)', // Green (Success)
    'var(--ant-color-warning)', // Gold (Warning)
    '#f5222d', // Red (Error)
    '#722ed1', // Purple
    '#eb2f96', // Magenta
    '#13c2c2', // Cyan
    '#fa8c16', // Orange
];

export const PresetColorPicker: React.FC<PresetColorPickerProps> = ({ value, onChange, ...props }) => {
    const { token } = theme.useToken();

    // Normalize current value to hex string for comparison
    const currentValue = useMemo(() => {
        if (!value) return undefined;
        return typeof value === 'string' ? value : value.toHexString();
    }, [value]);

    const handlePresetClick = (colorHex: string) => {
        if (onChange) {
            // Create a Color object similar to what ColorPicker returns
            // Note: generateColor is internal but helpful, or we can assume consumer handles objects.
            // However, ColorPicker's onChange expects (Color, string).
            // We'll mimic it by constructing the object using the available prop or just passing specific structure if strict types aren't an issue.
            // But safely, we can let ColorPicker do the heavy lifting or use generateColor if available.
            // Since generateColor might not be part of public API in all versions, let's try to leverage ColorPicker's internal logic 
            // OR just trigger the change with the hex.

            // To match Ant Design's onChange signature: (value: Color, hex: string)
            // We'll trust generateColor from antd or use a workaround.
            // Actually, for simplicity and safety, let's rely on the fact that most consumers probably just use the hex string.
            const colorObj = generateColor(colorHex);
            onChange(colorObj, colorHex);
        }
    };

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            {RECOMMENDED_COLORS.map((color) => {
                const isSelected = currentValue?.toLowerCase() === color.toLowerCase();
                return (
                    <Tooltip title={color} key={color}>
                        <div
                            onClick={() => handlePresetClick(color)}
                            style={{
                                width: 24,
                                height: 24,
                                borderRadius: 4,
                                backgroundColor: color,
                                cursor: 'pointer',
                                border: isSelected
                                    ? `2px solid ${token.colorPrimary}`
                                    : `1px solid ${token.colorSplit}`,
                                boxShadow: isSelected
                                    ? `0 0 0 2px ${token.colorBgContainer}`
                                    : undefined,
                                transition: 'all 0.2s',
                                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                            }}
                        />
                    </Tooltip>
                );
            })}
            <div style={{ paddingLeft: 8, borderLeft: `1px solid ${token.colorSplit}` }}>
                <ColorPicker
                    value={value}
                    onChange={onChange}
                    format="hex"
                    {...props}
                />
            </div>
        </div>
    );
};
