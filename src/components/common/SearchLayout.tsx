import React from 'react';
import type { ReactNode } from 'react';
import styled from 'styled-components';
import { Space } from 'antd';

const Container = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-wrap: wrap;
    gap: 12px;
`;

const SearchGroup = styled(Space)`
    flex: 1;
    min-width: 300px;
    flex-wrap: wrap;
`;

const ActionGroup = styled(Space)`
    flex-shrink: 0;
`;

interface SearchLayoutProps {
    children?: ReactNode;
    // We can also accept designated slots if we want to enforce structure
    searchContent?: ReactNode;
    actionContent?: ReactNode;
}

export const SearchLayout: React.FC<SearchLayoutProps> & {
    SearchGroup: typeof SearchGroup;
    ActionGroup: typeof ActionGroup;
} = ({ children, searchContent, actionContent }) => {
    // If strict props are used
    if (searchContent || actionContent) {
        return (
            <Container>
                <SearchGroup>
                    {searchContent}
                </SearchGroup>
                <ActionGroup>
                    {actionContent}
                </ActionGroup>
            </Container>
        );
    }

    // Default flexible children usage
    return <Container>{children}</Container>;
};

// Attach sub-components for flexible usage
SearchLayout.SearchGroup = SearchGroup;
SearchLayout.ActionGroup = ActionGroup;

export default SearchLayout;
