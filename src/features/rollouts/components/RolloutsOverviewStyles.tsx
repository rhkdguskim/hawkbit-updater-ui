import styled from 'styled-components';
import { Typography, Flex, Progress, Tag } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const ROLLOUT_COLORS = {
    running: 'var(--ant-color-info)',
    ready: 'var(--ant-color-success)',
    paused: 'var(--ant-color-warning)',
    finished: 'var(--ant-color-success)',
    error: 'var(--ant-color-error)',
    scheduled: 'var(--ant-color-primary)',
};

export const ACTION_COLORS = {
    finished: 'var(--ant-color-success)',
    running: 'var(--ant-color-info)',
    pending: 'var(--ant-color-warning)',
    error: 'var(--ant-color-error)',
    canceled: 'var(--ant-color-text-quaternary)',
};

export const statusColorMap: Record<string, string> = {
    running: 'blue',
    ready: 'cyan',
    paused: 'orange',
    finished: 'green',
    error: 'red',
    scheduled: 'purple',
    creating: 'default',
    starting: 'processing',
    stopped: 'default',
    waiting_for_approval: 'gold',
    pending: 'orange',
    canceled: 'default',
};

export const LegendStack = styled(Flex)`
    margin-top: var(--ant-margin-xxs, 4px);
`;

export const LegendSwatch = styled.div<{ $color: string }>`
    width: 10px;
    height: 10px;
    border-radius: 3px;
    background: ${props => props.$color};
    box-shadow: 0 1px 3px ${props => `${props.$color}40`};
`;

export const LegendLabel = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        color: var(--ant-color-text-secondary);
    }
`;

export const LegendValue = styled(Text)<{ $color: string }>`
    && {
        font-size: var(--ant-font-size-sm);
        color: ${props => props.$color};
    }
`;

export const SubtitleText = styled(Text)`
    && {
        font-size: var(--ant-font-size);
    }
`;

export const UpdatedText = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

export const StatCaption = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
        text-align: center;
    }
`;

export const ProgressThin = styled(Progress)`
    && {
        width: 60px;
    }
`;

export const ChartTitle = styled.span`
    font-size: var(--ant-font-size);
    font-weight: 600;
`;

export const ChartSubtitle = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

export const FlexFill = styled(Flex)`
    flex: 1;
`;

export const CenteredFlex = styled(Flex)`
    flex: 1;
`;

export const ActiveListContainer = styled.div`
    flex: 1;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
`;

export const ActivityRow = styled(Flex)`
    flex: 1;
    min-width: 0;
`;

export const ActivityMeta = styled(Flex)`
    flex: 1;
    min-width: 0;
`;

export const ActivityName = styled(Text)`
    && {
        font-size: var(--ant-font-size);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const ActivityTag = styled(Tag)`
    && {
        margin: 0;
        font-size: var(--ant-font-size-sm);
        border-radius: 999px;
    }
`;

export const ActivityCaption = styled(Text)`
    && {
        font-size: var(--ant-font-size-sm);
    }
`;

export const EmptyState = styled(Flex)`
    flex: 1;
`;

export const EmptyIcon = styled(RocketOutlined)`
    font-size: 40px;
    color: var(--ant-color-text-quaternary);
`;

export const StatusIconWrap = styled.div<{ $status?: string }>`
    width: var(--ant-control-height-lg, 40px);
    height: var(--ant-control-height-lg, 40px);
    border-radius: var(--ant-border-radius, 8px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    background: ${props => {
        switch (props.$status) {
            case 'running':
                return 'linear-gradient(135deg, rgba(var(--ant-color-info-rgb), 0.15) 0%, rgba(var(--ant-color-info-rgb), 0.1) 100%)';
            case 'paused':
                return 'linear-gradient(135deg, rgba(var(--ant-color-warning-rgb), 0.15) 0%, rgba(var(--ant-color-warning-rgb), 0.1) 100%)';
            default:
                return 'linear-gradient(135deg, rgba(var(--ant-color-primary-rgb), 0.15) 0%, rgba(var(--ant-color-primary-rgb), 0.1) 100%)';
        }
    }};
`;

export const StatusIcon = styled.span<{ $color: string }>`
    display: inline-flex;
    font-size: 18px;
    color: ${props => props.$color};
`;
