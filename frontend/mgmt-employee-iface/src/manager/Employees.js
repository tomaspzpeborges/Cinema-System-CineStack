import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Table,
    Button,
    Space,
    Modal,
    Typography,
    notification
} from 'antd';

import { axiosError } from '../utils/mgmtHelpers';

const { Title, Text } = Typography;


class Employees extends React.Component {
    columns = [
        {
            title: "Employee name",
            dataIndex: "name",
            sorter: (a, b) => a.name.localeCompare(b.name),
            sortDirections: ['ascend', 'descend'],
        }, {
            title: "type",
            dataIndex: "type",
            sorter: (a, b) => (a.type - b.type),
            sortDirections: ['ascend', 'descend'],
            render: (text, record) => {
                if (record.type === 1) return "employee"; else return "manager";
            },
        }, {
            title: "",
            dataIndex: "edit",
            render: (text, record) => (
                <Button
                    type="default"
                    onClick={() => {
                        this.props.navigate(String(record._id));
                    }}
                >
                    edit
                </Button>
            )
        }, {
            title: "",
            dataIndex: "delete",
            render: (text, record) => (
                <Button
                    type="danger"
                    onClick={(e) => {
                        this.setState({deleteVisible: true})
                        this.deleteCandidate = record;
                    }}
                >
                    delete
                </Button>
            )
        },
    ];

    doDelete = () => {
        axios.delete(
            "/api/v1/staff/profile/" + this.deleteCandidate._id
        ).then((response) => {
            // close the modal and then reinit
            this.finishDelete();
            this.initData();
            notification["success"]({
                message: "Deletion successful!"
            });
        }).catch((e) => axiosError(e));
    }

    cancelDelete = () => {
        this.finishDelete();
    }

    finishDelete = () => {
        this.setState({deleteVisible: false});
        // for safety
        this.deleteCandidate = {};
    }

    initData = () => {
        axios.get("/api/v1/staff/staffs").then((response) => {
            this.setState({data: response.data.docs});
        }).catch(axiosError);
    }

    constructor(props) {
        super(props);

        this.deleteCandidate = {};
        this.state = {
            data: [],
            deleteVisible: false
        };

        this.initData();
    }

    render () {
        return <>
        <Space direction={"vertical"} style={{display: 'block'}}>
            <Button
                type={"primary"}
                onClick={(e) => {
                    this.props.navigate("new");
                }}
            >
                Add an employee
            </Button>
            <Table
                columns={this.columns}
                dataSource={this.state.data}
                // assume the id is unique
                rowKey={(record) => record._id}
            />
        </Space>
        <Modal
            title={<Title>Are you sure?</Title>}
            visible={this.state.deleteVisible}
            closable={true}
            maskClosable={true}
            footer={<>
                <Button type={"danger"} onClick={this.doDelete}>Delete</Button>
                <Button type={"default"} onClick={this.cancelDelete}>Keep</Button>
            </>}
            onCancel={this.cancelDelete}
            forceRender
        >
            <Text>This will permanently delete the following employee:</Text>
            <br/>
            <Title level={2}><Text type={"danger"}>
                {this.deleteCandidate.name}
            </Text></Title>
        </Modal>
        </>;
    }
}


const withNavigate = (c) => {
    return (props) => {
        const navigate = useNavigate();
        return <Employees navigate={navigate} {...props} />;
    };
};


export default withNavigate(Employees);