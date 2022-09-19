import React from 'react';
import styles from './index.module.css';
import { Button } from 'antd';
import { LeftOutlined } from '@ant-design/icons';


export default function BackButton(props) {
    return (
        <Button
            size="large"
            className={styles.backButton}
            icon={<LeftOutlined />}
            {...props}
        >
            Go Back
        </Button>
    );
}
