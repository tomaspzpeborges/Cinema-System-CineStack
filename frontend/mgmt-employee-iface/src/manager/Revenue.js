import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Dropdown,
    Menu,
    Button,
    Row,
    Col,
    Typography
} from 'antd';
import {
    Pie,
    Area,
} from '@ant-design/charts';
import moment from 'moment';
import { axiosError } from '../utils/mgmtHelpers';


const { Text, Title} = Typography;


class Revenue extends React.Component {
    constructor(props) {
        super(props);

        this.timeOptions = ["all time", "today", "this week", "this month"];

        this.state = {
            selected: this.timeOptions[0],
            data: [],
            pieData: [],
            lineData: [],
        }
        this.tickets = [];
        this.compact = false;
        if (props.compact) {
            this.compact = true;
        }

        this.updateStats(this.timeOptions[0]);
    }

    pieClicked(clickArr) {
        // i.e we clicked outside
        if (clickArr.length == 0) {
            return false;
        }

        // we clicked on a movies, go to it
        if (this.compact) {
            this.props.navigate("movies/" + clickArr[0].data.id);
        } else {
            this.props.navigate("../movies/" + clickArr[0].data.id);
        }
    }

    dropdownClicked = (key) => {
        this.setState({selected: key.key});
        this.updateStats(key.key);
    }

    updateStats = (selected) => {
        let date = new Date();
        let day;

        switch (selected) {
            case "today":
                day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                break;
            case "this week":
                let first = date.getDate() - date.getDay() + 1;
                day = new Date(date.setDate(first));
                break;
            case "this month":
                day = new Date(date.getFullYear(), date.getMonth(), 1);
                break;
            case "all time":
                day = null;
                break;

        }

        axios.get(
            "/api/v1/billing/stats", {params: {start_date: day}}
        ).then((resp) => {
            this.tickets = resp.data.stats;
            this.crunchStats(this.tickets);
        }).catch((e) => axiosError(e));

    }

    crunchStats = (tickets) => {
        let aggr = {};
        let pieData = [];
        let lineData = [];

        for (let tick of tickets) {
            // aggregate sales for each movie for the pie chart
            aggr[tick.movie_id] = aggr[tick.movie_id] || (() => {
                let val = tick;
                tick.price_sum = 0;
                return val;
            })();

            aggr[tick.movie_id]["price_sum"] += tick.price_sum;
        }

        // convert the aggregate to something ant charts understands
        for (let [key, val] of Object.entries(aggr)) {
            val.id = key;
            pieData.push(val)
        }

        this.setState({
            pieData: pieData,
            lineData: lineData,
            data: tickets
        });
    }

    render() {
        let items = [];
        for (let option of this.timeOptions) {
            items.push(<Menu.Item key={option}>{option}</Menu.Item>);
        }

        let dropdownOpts = <Menu onClick={this.dropdownClicked}>
            {items}
        </Menu>;

        let thePie = <Pie
            data={this.state.pieData}
            angleField={"price_sum"}
            colorField={"movie_title"}
            autoFit={true}
            // magic that matched onClicks to a label
            onReady={(plot) => {
                plot.chart.on('plot:click', (evt) => {
                    const { x, y } = evt;
                    this.pieClicked(plot.chart.getTooltipItems({ x, y }));
                });
            }}
            label = {{
                type: 'inner',
                offset: '-30%',
                content: function content(_ref) {
                    return ''.concat('£', _ref.price_sum);
                },
                style: {
                    fontSize: 14,
                    textAlign: 'center',
                },
              }}
        />;

        if (this.compact) {
            return thePie;
        }

        return <div>
            <Dropdown overlay={dropdownOpts} >
                <Button>{this.state.selected}</Button>
            </Dropdown>

            <Row>
                <Col span={9}>
                    <Title level={3}>Revenue:</Title>
                    {thePie}
                </Col>
                <Col span={15}>
                <Title level={3}>Number of tickets:</Title>
                    <Area
                        data={this.state.data}
                        xField={"datestring"}
                        yField={"ticket_count"}
                        yLabel={"this_labels"}
                        seriesField={"movie_title"}
                    />
                </Col>
            </Row>
        </div>;
    }
}


const withNavigate = (c) => {
    return (props) => {
        const navigate = useNavigate();
        return <Revenue navigate={navigate} {...props} />;
    };
};

export default withNavigate(Revenue);
