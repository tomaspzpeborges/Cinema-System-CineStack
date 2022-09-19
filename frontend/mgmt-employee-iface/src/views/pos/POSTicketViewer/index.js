import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import styles from './index.module.css';
import axios from 'axios';
import { Spin } from 'antd';
import { Document, Page, pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function POSTicketViewer() {
    const { ticketId } = useParams();

    const [pdf, setPdf] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);

    const documentWrapperRef = useRef(null);
    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

    useEffect(() => {
        axios
            .get(`/api/v1/tickets/${ticketId}/pdf`, { responseType: 'blob' })
            .then((response) => {
                const fileURL = URL.createObjectURL(response.data);
                setPdf(fileURL);
                console.log(fileURL);
            });
    }, []);

    const getPDFWidth = (ref) => {
        const width = ref.current?.getBoundingClientRect().width;
        if (width > 600) return 600;
        else return width;
    };

    return (
        <div className={styles.container} ref={documentWrapperRef}>
            <p>
                Page {pageNumber} of {numPages}
            </p>
            <Document
                file={pdf}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={<Spin size="large" />}
            >
                <Page
                    pageNumber={pageNumber}
                    width={getPDFWidth(documentWrapperRef)}
                />
            </Document>
        </div>
    );
}
