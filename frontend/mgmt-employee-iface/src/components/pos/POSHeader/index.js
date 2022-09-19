import React from 'react';
import { Typography } from 'antd';
import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';

export default function POSHeader({ title }) {
    let navigate = useNavigate();

    return (
        <div className={styles.posHeader}>
            <div className={styles.posHeaderIcon} onClick={() => navigate('/pos/home')}>
                <img src="/cinestack.png" />
            </div>
            <div className={styles.posHeaderTitle}>
                <Typography.Title>
                    {title ? title : 'CineStack POS'}
                </Typography.Title>
            </div>
        </div>
    );
}
