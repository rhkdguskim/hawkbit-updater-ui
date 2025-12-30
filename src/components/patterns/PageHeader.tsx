import { Typography, Space, theme, Button, Flex } from 'antd';
import styled from 'styled-components';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { useToken } = theme;

const HeaderContainer = styled.div<{ $paddingBottom: string }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: ${props => props.$paddingBottom};
  flex-wrap: wrap;
  gap: 16px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const BackButton = styled(Button)`
    && {
        padding: 4px 12px;
        height: 32px;
        font-size: var(--ant-font-size-sm);
    }
`;

const Description = styled(Text)`
    && {
        margin-left: 0;
        font-size: var(--ant-font-size);
        max-width: 800px;
    }
`;

export interface PageHeaderProps {
    title: React.ReactNode;
    subtitle?: React.ReactNode;
    subtitleExtra?: React.ReactNode;
    actions?: React.ReactNode;
    /** Optional description shown below title */
    description?: React.ReactNode;
    /** Back button label */
    backLabel?: string;
    /** Callback when back button is clicked */
    onBack?: () => void;
    /** Additional content to show after the title (e.g. Status Tag) */
    extra?: React.ReactNode;
}

/**
 * PageHeader Pattern
 * - Standardized Title
 * - Optional Back button navigation
 * - Optional Description/Subtitle
 * - Actions area on the right
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    subtitle,
    subtitleExtra,
    actions,
    description,
    backLabel,
    onBack,
    extra
}) => {
    const { token } = useToken();

    return (
        <HeaderContainer $paddingBottom={`${token.marginXS}px`}>
            <TitleSection>
                <TitleRow>
                    {onBack && (
                        <BackButton icon={<ArrowLeftOutlined />} onClick={onBack}>
                            {backLabel}
                        </BackButton>
                    )}
                    {typeof title === 'string' ? (
                        <Title level={2} style={{ margin: 0, fontSize: 'var(--ant-font-size-heading-2)' }}>
                            {title}
                        </Title>
                    ) : (
                        title
                    )}
                    {extra}
                </TitleRow>

                {(subtitle || subtitleExtra || description) && (
                    <Flex vertical gap={4}>
                        {(subtitle || subtitleExtra) && (
                            <Space size={8} align="center">
                                {subtitle && (
                                    <Text type="secondary" style={{ fontSize: token.fontSize }}>
                                        {subtitle}
                                    </Text>
                                )}
                                {subtitleExtra}
                            </Space>
                        )}
                        {description && (
                            <Description type="secondary">
                                {description}
                            </Description>
                        )}
                    </Flex>
                )}
            </TitleSection>
            {actions && (
                <Space size="middle" align="center" style={{ height: 32 }}>
                    {actions}
                </Space>
            )}
        </HeaderContainer>
    );
};
