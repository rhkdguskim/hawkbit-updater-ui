import styled from 'styled-components';
import { Card } from 'antd';

export const PageContainer = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    flex: 1;
    min-height: 0;
    height: 100%;
    overflow-y: auto;
    padding: 24px;
`;


export const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
    padding: 8px 0;
`;

export const SectionCard = styled(Card)`
    border-radius: 14px;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    
    .ant-card-head {
        padding: 16px 24px;
        min-height: auto;
    }
    
    .ant-card-head-title {
        font-size: var(--ant-font-size-lg, 16px);
        font-weight: 600;
    }
    
    .ant-card-body {
        flex: 1;
        min-height: 0;
        overflow-y: auto;
        padding: 24px;
    }
`;
