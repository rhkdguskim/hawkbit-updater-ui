import { Typography } from 'antd';
import styled from 'styled-components';

const { Text, Title, Paragraph } = Typography;

/**
 * Small text component with consistent font size
 */
export const SmallText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

/**
 * Small secondary text component
 */
export const SecondarySmallText = styled(Text).attrs({ type: 'secondary' })`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

/**
 * Small strong text component
 */
export const StrongSmallText = styled(Text).attrs({ strong: true })`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

/**
 * ID text component - typically used for displaying IDs in tables
 */
export const IdText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        color: var(--ant-color-text-secondary);
    }
`;

/**
 * Ellipsis text with max width
 */
export const EllipsisText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        max-width: 100%;
        display: inline-block;
    }
`;

/**
 * Link-style small text
 */
export const LinkSmallText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        color: var(--ant-color-primary);
        cursor: pointer;
        
        &:hover {
            color: var(--ant-color-primary-hover);
        }
    }
`;

/**
 * Page section title
 */
export const SectionTitle = styled(Title).attrs({ level: 4 })`
    && {
        margin-bottom: var(--ant-margin-md);
    }
`;

/**
 * Card title text
 */
export const CardTitle = styled(Title).attrs({ level: 5 })`
    && {
        margin: 0;
    }
`;

/**
 * Description paragraph
 */
export const DescriptionText = styled(Paragraph).attrs({ type: 'secondary' })`
    && {
        margin-bottom: 0;
        font-size: var(--ant-font-size-sm);
    }
`;

export {
    Text,
    Title,
    Paragraph,
};
