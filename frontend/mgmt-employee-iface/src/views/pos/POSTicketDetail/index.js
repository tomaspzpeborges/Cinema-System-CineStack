import React, { useState, useEffect } from 'react';
import BackButton from '../../../components/pos/BackButton';
import styles from './index.module.css';
import { Card, Typography, Button, Spin, Modal, Form, Input } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import { FilePdfOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';

export default function POSTicketDetail() {
    const { ticketId } = useParams();
    let navigate = useNavigate();

    const [ticket, setTicket] = useState([]);
    const [isLoading, setLoading] = useState(false);
    const [isError, setError] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false);
    const [ticketToEmail, setTicketToEmail] = useState('');
    const [confirmLoading, setConfirmLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        axios.get(`/api/v1/tickets/${ticketId}`).then(
            (response) => {
                console.log(response);
                setTicket(response.data.data);
                setLoading(false);
            },
            (error) => {
                window.alert(`Error retrieving ticket: ${error}`);
                setError(true);
                setLoading(false);
            }
        );
    }, []);

    const handleSendEmail = () => {
        console.log(ticketToEmail);
        setConfirmLoading(true);
        axios
            .post(`/api/v1/tickets/${ticketId}/email`, {
                email: ticketToEmail,
            })
            .then((response) => {
                setConfirmLoading(false);
                setEmailModalVisible(false);
            });
    };

    if (isLoading)
        return (
            <div className={styles.container}>
                <Spin size="large" />
            </div>
        );
    else if (isError)
        return (
            <div className={styles.container}>
                <Typography.Title>Error retrieving ticket</Typography.Title>
                <section className={styles.errorBackButtonWrapper}>
                    <BackButton
                        onClick={() => navigate('/pos/tickets/search')}
                    />
                </section>
            </div>
        );
    else
        return (
            <div className={styles.container}>
                <Modal
                    title="Email ticket"
                    visible={emailModalVisible}
                    onOk={handleSendEmail}
                    confirmLoading={confirmLoading}
                    onCancel={() => setEmailModalVisible(false)}
                >
                    <Input
                        placeholder="E-mail address"
                        type="email"
                        prefix={<MailOutlined />}
                        onChange={(e) => setTicketToEmail(e.target.value)}
                    />
                </Modal>
                {ticket.screening && (
                    <section className={`${styles.half}`}>
                        <Card title="Movie Name" style={{ margin: '1em 0' }}>
                            <Typography.Title>
                                {ticket.screening.movie.title}
                            </Typography.Title>
                        </Card>
                        <Card title="When" style={{ margin: '1em 0' }}>
                            <Typography.Title>
                                {new Date(
                                    ticket.screening.datetime
                                ).toLocaleDateString('en-GB')}{' '}
                                -{' '}
                                {new Date(
                                    ticket.screening.datetime
                                ).toLocaleTimeString('en-GB')}
                            </Typography.Title>
                        </Card>
                        <Card title="Seats" style={{ margin: '1em 0' }}>
                            <Typography.Title>
                                {ticket.seats.join(', ')}
                            </Typography.Title>
                        </Card>
                    </section>
                )}
                <section className={styles.half}>
                    <section>
                        <Button
                            className={styles.actionButton}
                            size="large"
                            icon={<FilePdfOutlined />}
                            onClick={() =>
                                navigate(`/pos/tickets/view/${ticketId}`)
                            }
                        >
                            View PDF
                        </Button>
                    </section>
                    <section>
                        <Button
                            className={styles.actionButton}
                            size="large"
                            icon={<MailOutlined />}
                            onClick={() => setEmailModalVisible(true)}
                        >
                            Email ticket
                        </Button>
                    </section>
                    <section className={styles.backButtonWrapper}>
                        <BackButton
                            onClick={() => navigate('/pos/tickets/search')}
                        />
                    </section>
                </section>
            </div>
        );
}
