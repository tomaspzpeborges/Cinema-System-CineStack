import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import axios from 'axios';

import { useAuth } from '../../../utils/useAuth';
import { CircularProgress } from '@material-ui/core';

export default function DetailsView() {
    const auth = useAuth();
    const { ticketId } = useParams();
    const [pdf, setPDF] = useState(null);

    useEffect(() => {
        axios
            .get(`/api/v1/tickets/${ticketId}/pdf`, {
                headers: {
                    Authorization: `Bearer ${auth.jwtToken}`,
                },
                responseType: 'blob',
            })
            .then((res) => {
                setPDF(window.URL.createObjectURL(res.data));
            });
    }, []);

    return pdf ? (
        <object
            data={pdf}
            type="application/pdf"
            width="100%"
            height="100%"
            style={{ height: '80vh' }}
        />
    ) : (
        <CircularProgress />
    );
}
