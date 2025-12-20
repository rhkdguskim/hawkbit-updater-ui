import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title } = Typography;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
`;

const FormContainer = styled(Card)`
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const StyledTitle = styled(Title)`
  text-align: center;
  margin-bottom: 2rem !important;
`;

const LoginPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const onFinish = async (values: any) => {
        setLoading(true);
        const { username, password } = values;

        // 1. Internal Authentication Rule (UI Policy)
        // Check credentials against our internal hardcoded policy
        let isValid = false;

        if (username === 'mirero' && password === 'mirero-0203') {
            isValid = true;
        } else if (username === 'admin' && password === 'admin') {
            isValid = true;
        }

        if (!isValid) {
            message.error('아이디 또는 비밀번호가 올바르지 않습니다.');
            setLoading(false);
            return;
        }

        // 2. Fixed API Token Strategy
        // If internal auth passes, we ALWAYS use the 'admin:admin' token for actual API calls
        // because hawkBit server only knows 'admin'.
        const apiToken = btoa('admin:admin');

        try {
            // Verify connectivity with the fixed Admin token
            await axios.get('/rest/v1/userinfo', {
                headers: {
                    Authorization: `Basic ${apiToken}`,
                },
            });

            // Login successful: Store original username (for Role) and the fixed API token
            login(username, apiToken);
            message.success('Login successful');
            navigate('/');
        } catch (error: any) {
            message.error('Server connection failed. Please check the backend.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container>
            <FormContainer>
                <StyledTitle level={3}>Mirero Product Manager</StyledTitle>
                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Please input your Username!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Username" />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Please input your Password!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" style={{ width: '100%' }} loading={loading}>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </FormContainer>
        </Container>
    );
};

export default LoginPage;
