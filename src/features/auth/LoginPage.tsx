import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

const { Title } = Typography;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: var(--bg-page);
`;

const FormContainer = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
  background: var(--bg-container);
  
  [data-theme='dark'] & {
      border: 1px solid var(--border-color);
  }
`;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 2rem !important;
`;

const FullWidthButton = styled(Button)`
  && {
      width: 100%;
  }
`;

interface UserInfoResponse {
    tenant?: string;
    username?: string;
}

const LoginPage: React.FC = () => {
    const { t } = useTranslation('auth');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const onFinish = async (values: { username: string; password: string }) => {
        setLoading(true);
        const { username, password } = values;

        // Generate Basic Auth token from user input
        const apiToken = btoa(`${username}:${password}`);

        try {
            // Verify credentials with HawkBit server
            const response = await axios.get<UserInfoResponse>('/rest/v1/userinfo', {
                headers: {
                    Authorization: `Basic ${apiToken}`,
                },
            });

            // Login successful: Store API username (for role determination) and the token
            const apiUsername = response.data.username || username;
            login(apiUsername, apiToken);
            message.success(t('messages.loginSuccess'));
            navigate('/');
        } catch (error: unknown) {
            // Check if it's an axios error with response
            if (axios.isAxiosError(error) && error.response?.status === 401) {
                message.error(t('messages.loginFailed'));
            } else {
                message.error(t('messages.serverError'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <FormContainer>
                <StyledTitle level={3}>{import.meta.env.VITE_LOGIN_TITLE || t('login.mireroProductManager')}</StyledTitle>
                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: t('login.usernameRequired') }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder={t('login.username')} />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: t('login.passwordRequired') }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder={t('login.password')} />
                    </Form.Item>
                    <Form.Item>
                        <FullWidthButton type="primary" htmlType="submit" loading={loading}>
                            {t('login.submit')}
                        </FullWidthButton>
                    </Form.Item>
                </Form>
            </FormContainer>
        </Container>
    );
};

export default LoginPage;
