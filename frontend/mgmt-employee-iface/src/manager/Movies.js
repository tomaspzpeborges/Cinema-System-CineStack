import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Table,
    Button,
    Space,
    Modal,
    Typography,
    notification,
    Input
} from 'antd';
import Highlighter from 'react-highlight-words';
import { axiosError } from '../utils/mgmtHelpers';
import { SearchOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;


class Movies extends React.Component {
    doDelete = () => {
        axios.delete(
            "/api/v1/movie/" + this.deleteCandidate._id
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
        axios.get("/api/v1/movie/movies").then((response) => {
            this.setState({data: response.data.docs});
        }).catch(axiosError);
    }

    constructor(props) {
        super(props);
        this.columns = [
            {
                title: "Movie name",
                dataIndex: "title",
                sorter: (a, b) => a.title.localeCompare(b.title),
                sortDirections: ['ascend', 'descend'],
                ...this.getColumnSearchProps('title')
            }, {
                title: "",
                dataIndex: "edit",
                render: (text, record) => (
                    <Button
                        type="default"
                        onClick={(e) => {
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

        this.deleteCandidate = {};
        this.state = {
            data: [],
            deleteVisible: false,
            searchText: '',
            searchedColumn: '',
        };

        this.initData();
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            this.setState({
                            searchText: selectedKeys[0],
                            searchedColumn: dataIndex,
                            });
                        }}
                    >
                        Filter
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) =>
            record[dataIndex]
            ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
            : '',
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select(), 100);
            }
        },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    render () {
        return <>
            <Space direction={"vertical"} style={{display: 'block'}}>
                <Button
                    type={"primary"}
                    onClick={(e) => {
                        this.props.navigate("new");
                    }}
                >
                    Add a movie
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
                <Text>This will permanently delete the following movie:</Text>
                <br/>
                <Title level={2}><Text type={"danger"}>
                    {this.deleteCandidate.title}
                </Text></Title>
            </Modal>
        </>;
    }
}


const withNavigate = (c) => {
    return (props) => {
        const navigate = useNavigate();
        return <Movies navigate={navigate} {...props} />;
    };
};


export default withNavigate(Movies);