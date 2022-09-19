import React from 'react';
import { Outlet } from 'react-router-dom';
import styles from './container.module.css';

import POSHeader from '../../components/pos/POSHeader';

export default function POSContainer() {
    return (
        <div className={styles.posWrapper}>
            <POSHeader />
            <Outlet />
        </div>
    );
}
