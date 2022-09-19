import React, { useState, useEffect } from 'react';
import { Input, Spin, Typography, List, Card } from 'antd';
import BackButton from '../../../components/pos/BackButton';
import styles from './index.module.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function POSTicketSearch() {
    let navigate = useNavigate();

    const [ticketsList, setTicketsList] = useState([]);
    const [searchBoxText, setSearchBoxText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isError, setError] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios.get('/api/v1/tickets').then(
            (response) => {
                setTicketsList(response.data.data);
                setSearchResults(response.data.data);
                setLoading(false);
            },
            (error) => {
                window.alert(`Error retrieving tickets: ${error}`);
                setError(true);
                setLoading(false);
            }
        );
    }, []);

    // filter ticket list when searchbox input changes
    useEffect(() => {
        const results = ticketsList.filter(
            (ticket) =>
                ticket.screening.movie.title
                    .toLowerCase()
                    .includes(searchBoxText) ||
                ticket._id.includes(searchBoxText)
        );
        setSearchResults(results);
    }, [searchBoxText]);

    if (isLoading)
        return (
            <div className={styles.container}>
                <Spin size="large" />
            </div>
        );
    else if (isError)
        return (
            <div className={styles.container}>
                <Typography.Title>Error retrieving tickets</Typography.Title>
                <section className={styles.backButtonWrapper}>
                    <BackButton onClick={() => navigate('/pos/home')} />
                </section>
            </div>
        );
    else
        return (
            <div className={styles.container}>
                <section className={styles.searchBoxWrapper}>
                    <Input
                        className={styles.searchBox}
                        size="large"
                        placeholder="Search by movie name or ticket ID"
                        bordered={false}
                        onChange={(e) => setSearchBoxText(e.target.value)}
                    />
                </section>
                <section className={styles.gridWrapper}>
                    <List
                        grid={{
                            gutter: 16,
                            xs: 1,
                            sm: 2,
                            md: 4,
                            lg: 4,
                            xl: 6,
                            xxl: 3,
                        }}
                        dataSource={searchResults}
                        pagination={{
                            defaultPageSize: 9,
                            hideOnSinglePage: true,
                        }}
                        renderItem={(item) => (
                            <List.Item>
                                <Card
                                    title={item._id}
                                    onClick={() =>
                                        navigate(
                                            `/pos/tickets/detail/${item._id}`
                                        )
                                    }
                                >
                                    <Typography.Title>
                                        {item.screening.movie.title}
                                    </Typography.Title>
                                    <Typography.Text>
                                        {new Date(
                                            item.screening.datetime
                                        ).toLocaleString('en-GB')}{' '}
                                        - {item.seats.length} seat(s) booked
                                    </Typography.Text>
                                </Card>
                            </List.Item>
                        )}
                    />
                </section>
                <section className={styles.backButtonWrapper}>
                    <BackButton onClick={() => navigate('/pos/home')} />
                </section>
            </div>
        );
}
