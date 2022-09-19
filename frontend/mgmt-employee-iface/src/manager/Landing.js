import React from 'react';
import axios from 'axios';
import {
    Divider,
    Row, Col
} from 'antd';
import { axiosError } from '../utils/mgmtHelpers';
import Revenue from './Revenue';

class Landing extends React.Component {
    constructor(props) {
        super(props);

        this.state = {user: {}}
        let userId = localStorage.getItem('user-id');

        axios.get(
            "/api/v1/staff/profile/" + userId,
        ).then((resp) => {
            this.setState({user: resp.data.staff})
        }).catch((e) => axiosError(e));
    }

    render() {
        return <div>
            <Divider>Hello, {this.state.user.name}!</Divider>
            {/* <Divider>Today's upcoming screenings</Divider> */}
            <Divider>Today's sales so far</Divider>
            {/* this is kind of a hack to make it not take up whole width */}
            <Row>
                <Col span={8} />
                <Col span={10}>
                    <Revenue compact={true} />
                </Col>
            </Row>
        </div>;
    }
}

export default Landing;