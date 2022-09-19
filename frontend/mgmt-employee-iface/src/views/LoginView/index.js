import React, { useState } from 'react';
import {
    Form,
    Input,
    Button,
    Checkbox,
    Card,
    Divider,
    Typography,
    Alert,
} from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Navigate, useNavigate } from 'react-router-dom';

import styles from './index.module.css';

import { useAuth } from '../../utils/useAuth';

const loginErrorAlert = (message) => {
    return (
        <Alert
            message={message}
            type="error"
            showIcon
            style={{
                borderBottomRightRadius: 0,
                borderBottomLeftRadius: 0,
                borderBottom: 0,
                animation: 'login-feedback-enter 0.5s ease-out',
            }}
        />
    );
};

export default function LoginView() {
    const [form] = Form.useForm();
    const auth = useAuth();
    const navigate = useNavigate();

    const [loginFeedback, setLoginFeedback] = useState(null);

    const onLoginSubmit = (vals) => {
        auth.signin(vals.username, vals.password)
            .then(() => {
                switch (auth.user.type) {  
                    case 0:
                        navigate('/management');
                        break;
                    case 1:
                        navigate('/pos/home');
                        break;
                    default:
                        console.log("no type")
                        break;
                }
            })
            .catch((err) => {
                console.log(err);
                if (err.response.status === 400 || err.response.status === 404)
                    return setLoginFeedback(
                        loginErrorAlert('Invalid credentials!')
                    );

                if (err.response.status === 401)
                    return setLoginFeedback(
                        loginErrorAlert('Password has been reset. Please contact a manager to make a new one.')
                    );

                return setLoginFeedback(
                    loginErrorAlert(
                        'Internal server error. Please try again in a moment'
                    )
                );
            });
    };

    return (
        <div className={styles.loginContainer}>
            <Card className={styles.loginCard}>
                <Typography.Title level={2} className={styles.centerText}>
                    Login
                </Typography.Title>
                <Typography.Text type="secondary" className={styles.centerText}>
                    Enter your credentials to access the staff portal
                </Typography.Text>
                <Divider />
                <Form form={form} onFinish={onLoginSubmit}>
                    <Form.Item
                        name="username"
                        rules={[
                            {
                                required: true,
                                message: 'Username is required',
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <UserOutlined className="site-form-item-icon" />
                            }
                            placeholder="Username"
                        />
                    </Form.Item>
                    <Form.Item
                        name="password"
                        rules={[
                            {
                                required: true,
                                message: 'Password is required',
                            },
                        ]}
                    >
                        <Input
                            prefix={
                                <LockOutlined className="site-form-item-icon" />
                            }
                            type="password"
                            placeholder="Password"
                        />
                    </Form.Item>
                    <Form.Item>
                        <Form.Item
                            name="remember"
                            valuePropName="checked"
                            noStyle
                        >
                            <Checkbox>Remember me</Checkbox>
                        </Form.Item>
                    </Form.Item>

                    {loginFeedback}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            className={styles.loginButton}
                            style={
                                loginFeedback
                                    ? {
                                          borderTopRightRadius: 0,
                                          borderTopLeftRadius: 0,
                                          borderTop: 0,
                                      }
                                    : null
                            }
                        >
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
