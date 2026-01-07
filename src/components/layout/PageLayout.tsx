import styled from 'styled-components';
import { Card } from 'antd';

export const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--ant-margin, 16px);
    flex: 1;
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    padding: var(--ant-margin-lg, 24px);
`;


export const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--ant-margin-sm, 12px);
    padding: var(--ant-padding-xs, 8px) 0;
`;

export const SectionCard = styled(Card)`
    border-radius: var(--ant-border-radius-lg, 12px);
    width: 100%;
    
    .ant-card-head {
        padding: var(--ant-padding, 16px) var(--ant-padding-lg, 24px);
        min-height: auto;
        border-bottom: 1px solid var(--ant-color-split);
    }
    
    .ant-card-head-title {
        font-size: var(--ant-font-size-lg, 16px);
        font-weight: 600;
    }
    
    .ant-card-body {
        padding: var(--ant-padding-lg, 24px);
    }
`;
