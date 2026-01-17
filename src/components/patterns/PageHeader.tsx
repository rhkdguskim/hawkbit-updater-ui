import { Typography, Space, Button, Flex } from 'antd';
import styled from 'styled-components';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 8px 4px 16px;
  flex-wrap: wrap;
  gap: 20px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--ant-margin-xs, 8px);
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: var(--ant-margin-sm, 12px);
  flex-wrap: wrap;
`;

const HeaderTitle = styled(Title)`
    && {
        margin: 0;
        font-size: 28px !important;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: var(--ant-color-text);
    }
`;

const BackButton = styled(Button)`
    && {
        padding: 0 var(--ant-padding-xs, 8px);
        height: var(--ant-control-height-sm, 24px);
        font-size: var(--ant-font-size-sm);
    }
`;

const SubtitleText = styled(Text)`
    && {
        font-size: 14px;
        font-weight: 500;
        color: var(--ant-color-text-secondary);
    }
`;

const Description = styled(Text)`
    && {
        margin-left: 0;
        font-size: var(--ant-font-size);
        max-width: 800px;
    }
`;

const Actions = styled(Space)`
    && {
        align-items: center;
        min-height: var(--ant-control-height, 32px);
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
    return (
        <HeaderContainer>
            <TitleSection>
                <TitleRow>
                    {onBack && (
                        <BackButton icon={<ArrowLeftOutlined />} onClick={onBack}>
                            {backLabel}
                        </BackButton>
                    )}
                    {typeof title === 'string' ? (
                        <HeaderTitle level={2}>
                            {title}
                        </HeaderTitle>
                    ) : (
                        title
                    )}
                    {extra}
                </TitleRow>

                {(subtitle || subtitleExtra || description) && (
                    <Flex vertical gap={4}>
                        {(subtitle || subtitleExtra) && (
                            <Space size="small" align="center">
                                {subtitle && (
                                    <SubtitleText type="secondary">
                                        {subtitle}
                                    </SubtitleText>
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
                <Actions size="middle" align="center">
                    {actions}
                </Actions>
            )}
        </HeaderContainer>
    );
};
