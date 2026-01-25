import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { Button, Result, Space, Typography } from 'antd';
import { 
    ReloadOutlined, 
    BugOutlined, 
    HomeOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import { DASHBOARD_COLORS, TYPOGRAPHY, SPACING, SHADOWS, BORDER_RADIUS } from '@/theme/dashboard-design-system';

const { Text, Paragraph } = Typography;

interface Props {
    children: ReactNode;
    fallbackUI?: (error: Error, reset: () => void) => ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
    widgetName?: string;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div`
    background: var(--ant-color-bg-container);
    border-radius: ${BORDER_RADIUS.lg};
    padding: ${SPACING[8]};
    border: 2px solid ${DASHBOARD_COLORS.status.critical};
    box-shadow: ${SHADOWS.lg};
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

const ErrorContent = styled.div`
    text-align: center;
    max-width: 600px;
`;

const ErrorIcon = styled.div`
    font-size: 64px;
    color: ${DASHBOARD_COLORS.status.critical};
    margin-bottom: ${SPACING[4]};
`;

const ErrorTitle = styled.h3`
    font-size: ${TYPOGRAPHY.fontSize['2xl']};
    font-weight: ${TYPOGRAPHY.fontWeight.bold};
    color: var(--ant-color-text);
    margin-bottom: ${SPACING[3]};
`;

const ErrorMessage = styled(Paragraph)`
    font-size: ${TYPOGRAPHY.fontSize.base};
    color: var(--ant-color-text-secondary);
    margin-bottom: ${SPACING[5]};
`;

const ErrorDetailsToggle = styled.details`
    margin-top: ${SPACING[4]};
    text-align: left;
    background: var(--ant-color-bg-layout);
    padding: ${SPACING[3]};
    border-radius: ${BORDER_RADIUS.base};
    border: 1px solid var(--ant-color-border);

    summary {
        cursor: pointer;
        font-weight: ${TYPOGRAPHY.fontWeight.semibold};
        color: var(--ant-color-text-secondary);
        user-select: none;
        padding: ${SPACING[2]};

        &:hover {
            color: var(--ant-color-text);
        }
    }
`;

const ErrorStack = styled.pre`
    margin-top: ${SPACING[3]};
    padding: ${SPACING[3]};
    background: var(--ant-color-bg-elevated);
    border-radius: ${BORDER_RADIUS.sm};
    overflow-x: auto;
    font-family: ${TYPOGRAPHY.fontFamily.mono};
    font-size: ${TYPOGRAPHY.fontSize.xs};
    color: ${DASHBOARD_COLORS.status.critical};
    border: 1px solid var(--ant-color-border-secondary);
    max-height: 300px;
    overflow-y: auto;
`;

export class DashboardErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({
            errorInfo,
        });

        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }

        console.error('Dashboard Error Boundary caught an error:', error, errorInfo);
    }

    handleReset = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = (): void => {
        window.location.href = '/';
    };

    handleReportIssue = (): void => {
        const { error, errorInfo } = this.state;
        const issueBody = `
**Error Message:**
${error?.message || 'Unknown error'}

**Stack Trace:**
\`\`\`
${error?.stack || 'No stack trace available'}
\`\`\`

**Component Stack:**
\`\`\`
${errorInfo?.componentStack || 'No component stack available'}
\`\`\`

**Browser:** ${navigator.userAgent}
**Timestamp:** ${new Date().toISOString()}
        `.trim();

        console.log('Report Issue:', issueBody);
    };

    getErrorMessage(error: Error | null): string {
        if (!error) return 'An unknown error occurred';

        if (error.message.includes('NETWORK')) {
            return 'Network connection error. Please check your internet connection and try again.';
        }

        if (error.message.includes('TIMEOUT')) {
            return 'The request timed out. The server might be slow or unavailable.';
        }

        if (error.message.includes('UNAUTHORIZED') || error.message.includes('401')) {
            return 'Your session has expired. Please log in again.';
        }

        if (error.message.includes('FORBIDDEN') || error.message.includes('403')) {
            return 'You do not have permission to access this resource.';
        }

        return error.message || 'An unexpected error occurred';
    }

    render(): ReactNode {
        const { hasError, error, errorInfo } = this.state;
        const { children, fallbackUI, widgetName } = this.props;

        if (hasError && error) {
            if (fallbackUI) {
                return fallbackUI(error, this.handleReset);
            }

            return (
                <ErrorContainer role="alert" aria-live="assertive">
                    <ErrorContent>
                        <ErrorIcon>
                            <WarningOutlined />
                        </ErrorIcon>
                        
                        <ErrorTitle>
                            {widgetName ? `${widgetName} Error` : 'Something went wrong'}
                        </ErrorTitle>

                        <ErrorMessage>
                            {this.getErrorMessage(error)}
                        </ErrorMessage>

                        <Space size="middle">
                            <Button
                                type="primary"
                                icon={<ReloadOutlined />}
                                onClick={this.handleReset}
                                size="large"
                            >
                                Try Again
                            </Button>

                            <Button
                                icon={<HomeOutlined />}
                                onClick={this.handleGoHome}
                                size="large"
                            >
                                Go Home
                            </Button>

                            <Button
                                icon={<BugOutlined />}
                                onClick={this.handleReportIssue}
                                size="large"
                            >
                                Report Issue
                            </Button>
                        </Space>

                        {process.env.NODE_ENV === 'development' && (
                            <ErrorDetailsToggle>
                                <summary>Error Details (Development Only)</summary>
                                <div>
                                    <Text strong>Error Message:</Text>
                                    <ErrorStack>{error.message}</ErrorStack>

                                    {error.stack && (
                                        <>
                                            <Text strong style={{ marginTop: SPACING[3], display: 'block' }}>
                                                Stack Trace:
                                            </Text>
                                            <ErrorStack>{error.stack}</ErrorStack>
                                        </>
                                    )}

                                    {errorInfo?.componentStack && (
                                        <>
                                            <Text strong style={{ marginTop: SPACING[3], display: 'block' }}>
                                                Component Stack:
                                            </Text>
                                            <ErrorStack>{errorInfo.componentStack}</ErrorStack>
                                        </>
                                    )}
                                </div>
                            </ErrorDetailsToggle>
                        )}
                    </ErrorContent>
                </ErrorContainer>
            );
        }

        return children;
    }
}

export default DashboardErrorBoundary;
