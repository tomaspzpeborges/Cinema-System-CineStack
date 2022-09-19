import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import axios from 'axios';
import {
    Input,
    Button,
    Row,
    Col,
    Divider,
    Space,
    Form,
    DatePicker,
    InputNumber,
    Image,
    notification
} from 'antd';
import { CloseOutlined, EditOutlined, PlusOutlined, LockOutlined } from '@ant-design/icons';
import moment from 'moment';
import Modal from 'antd/lib/modal/Modal';

import { axiosError } from '../utils/mgmtHelpers';
import "./Movie.css";

const { TextArea } = Input;


class Movie extends React.Component {
    constructor(props) {
        super(props);

        // persistent stuff
        this.dateFormat = "HH:mm DD/MM/YYYY";
        this.fallbackImage = "data:image/png;base64,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";
        this.dividerStyle = {
            orientation: "left",
            plain: true,
        };
        this.formRef = React.createRef();
        this.values = {};

        // are we showing an existing object or are we creating a new one
        this.creating = props.params.name === "new";

        // dynamic stuff
        this.state = {
            disabled: !this.creating,
            popupVisible: false,
            visible:  {
                landscape: false,
                portrait: false,
                trailer: false
            },
            src: {
                landscape: "",
                portrait: "",
                trailer: "",
            },
        };

        // NOTE: uncomment this if you want test data
        // this.values = {
        //     title: "Tenet",
        //     blurb: " Armed with only one word, Tenet, and fighting for the survival of the entire world, a Protagonist journeys through a twilight world of international espionage on a mission that will unfold in something beyond real time. ",
        //     certificate: 18,
        //     director: "Wes Anderson",
        //     leadActors: ["Jimmy Hendrix", "Anna Karenina"],
        //     screenings: ["22:00 01/03/2021", "08:11 17/06/2022"].map(
        //         (val) => moment(val, this.dateFormat)
        //     ),
        //     promoMaterial: {
        //         landscapeBanner: "https://i.redd.it/ttvbi0ngwa851.jpg",
        //         portraitBanner: "https://images-na.ssl-images-amazon.com/images/I/91oMmAPaaeL._AC_SL1500_.jpg",
        //         trailer: "https://www.youtube.com/watch?v=L3pk_TBkihU",
        //     },
        //     seatPricing: {
        //         basePrice: 8,
        //         vipPrice: 18,
        //         childDiscount: 50,
        //         seniorDiscount: 20,
        //     },
        // };

        if (!this.creating) {
            axios.get("/api/v1/movie/" + this.props.params.name).then((resp) => {
                let values = resp.data.movie;
                values.screenings = values.screenings.map(
                    // format is as: 2021-03-01T20:00:00.000Z
                    (val) => moment(val.datetime, "YYYY-MM-DDTHH:mm:ssZ")
                );

                this.setState({src: {
                    landscape: values.promoMaterial.landscapeBanner,
                    portrait: values.promoMaterial.portraitBanner,
                    trailer: values.promoMaterial.trailer
                }})

                this.formRef.current.setFieldsValue(values);
            });
        }
    }

    percentFormat(raw) {
        return `${raw}%`;
    }

    percentParse(fmt) {
        return fmt.replace('%', '');
    }

    currencyFormat(raw) {
        return `£ ${raw}`;
    }

    currencyParse(fmt) {
        return fmt.replace('£ ', '');
    }

    sendUpdatedInfo = (values) => {
        console.log("submitting")

        let resp = {movieData: values}
        let request;

        if (this.creating) {
            request = axios.post("/api/v1/movie",
                resp
            );
        } else {
            request = axios.put(
                "/api/v1/movie/" + this.props.params.name,
                resp
            );
        }

        request.then((response) => {
            this.setState({disabled: true});
            notification["success"]({
                message: ((this.creating) ? "Created" : "Updated") + " successfully!"
            });
            if (this.creating) {
                this.props.navigate("../" + response.data.result);
                this.creating = false;
            }
        }).catch((e) => axiosError(e));
    }

    renderCastItem = () => {
        return <Input
            disabled={this.state.disabled}
        />;
    }

    toggleDisabled = () => {
        this.setState({disabled: !this.state.disabled});
    }

    renderScreeningItem = () => {
        return <DatePicker
            // empty string means it hasn't been selected yet
            // passing it to value makes it a selector
            // value={(item === "") ? "" : moment(item, this.dateFormat)}
            disabled={this.state.disabled}
            format={this.dateFormat}
            showTime={true}
        />;
    }

    renderList(name, header, renderItem, msg) {
        return <div>
            <Divider {...this.dividerStyle} >{header}</Divider>
            <Form.List
                name={name}
                rules={[{
                    validator: (_, names) => {
                        if (!names || names.length < 1) {
                            return Promise.reject(new Error('Enter at least 1 ' + msg + "!"));
                        }
                        return Promise.resolve();
                },},]}
            >
                {(fields, { add, remove }, { errors }) => (
                    <>
                        {fields.map((field, index) => (
                            <Form.Item
                                key={field.key}
                            >
                                {/* for the love of whatever is holy, this space
                                is garbage. Would be amazing to make it as wide
                                as the col, but IKD how */}
                                <Space>
                                    <Form.Item
                                        {...field}
                                        rules={[{
                                            required: true,
                                            message: 'Please enter a value or delete the field!'
                                        }]}
                                        noStyle
                                    >
                                        {renderItem()}
                                    </Form.Item>
                                    <Button
                                        onClick={() => {
                                            if (!this.state.disabled)
                                            remove(field.name)
                                        }}
                                        disabled={this.state.disabled}
                                        icon={<CloseOutlined/>}
                                    >
                                    </Button>
                                </Space>
                            </Form.Item>
                        ))}

                        <Form.Item>
                            <Button
                                onClick={() => {
                                    if (!this.state.disabled)
                                        add();
                                }}
                                type="dashed"
                                // width={"60%"}
                                disabled={this.state.disabled}
                                icon={<PlusOutlined />}
                            >
                                Add another
                            </Button>
                        </Form.Item>
                        <Form.ErrorList errors={errors} />
                    </>
                )}
            </Form.List>
        </div>;
    }

    renderNumberEdit(type) {
        let format = {
            currency: [this.currencyFormat, this.currencyParse, 0, undefined],
            percent: [this.percentFormat, this.percentParse, 0 , 100],
            number: [(val) => val, (val) => val, undefined, undefined],
        };

        return <InputNumber
                min={format[type][2]} max={format[type][3]}
                formatter={format[type][0]}
                parser={format[type][1]}
                disabled={this.state.disabled}
            />;
    }

    renderPrices() {
        let itemStyle = {
            labelCol: {span: 4}
        };

        let rule = [{
            required: true,
            message: 'Please enter a value!'
        }];

        return <div>
            <Divider {...this.dividerStyle} >Prices</Divider>
            <Form.Item>
                <Form.Item
                    label={"base"} name={["seatPricing", "basePrice"]}
                    {...itemStyle}
                    rules={rule}
                >
                    {this.renderNumberEdit("currency")}
                </Form.Item>
                <Form.Item
                    label={"vip"} name={["seatPricing", "vipPrice"]}
                    {...itemStyle} rules={rule}
                >
                    {this.renderNumberEdit("currency")}
                </Form.Item>
                <Form.Item
                    label={"child discount"} name={["seatPricing", "childDiscount"]}
                    {...itemStyle}
                    rules={rule}
                >
                    {this.renderNumberEdit("percent")}
                </Form.Item>
                <Form.Item
                    label={"senior discount"} name={["seatPricing", "seniorDiscount"]}
                    {...itemStyle} rules={rule}
                >
                    {this.renderNumberEdit("percent")}
                </Form.Item>
            </Form.Item>
        </div>;
    }

    renderDescription() {
        return <Form.Item
            name={"blurb"} rules={[{
                required: true,
                message: 'Please enter a blurb/description!'
            }]}
        >
            <TextArea
                disabled={this.state.disabled}
                rows={5} allowClear
            />
        </Form.Item>;
    }

    renderDirector = () => {
        return <div>
            <Divider {...this.dividerStyle} >Director</Divider>

            <Form.Item
                name={"director"} rules={[{
                    required: true,
                    message: 'Please enter a director!'
                }]}
            >
                {this.renderCastItem()}
            </Form.Item>
        </div>;
    }

    popupOk = () => {
        let urls = this.formRef.current.getFieldsValue([
            ["promoMaterial", "landscapeBanner"],
            ["promoMaterial", "portraitBanner"],
            ["promoMaterial", "trailer"]]
        );

        this.setState({
            popupVisible: false,
            visible: {
                landscape: false,
                portrait: false,
                trailer: false,
            },
            src: {
                landscape: urls.promoMaterial.landscapeBanner || "",
                portrait: urls.promoMaterial.portraitBanner || "",
                trailer: urls.promoMaterial.trailer || "",
            },
        });
    }

    popupShow(item) {
        let visible = [false, false, false];
        visible[item] = true;

        if (!this.state.disabled) {
            this.setState({
                popupVisible: true,
                visible: visible,
            });
        }
    }

    // TODO: consider restoring the previous state
    popupCancel = () => {
        this.setState({popupVisible: false});
    }

    renderEditButton(item) {
        return <Button
                onClick={() => this.popupShow(item)}
                style={{
                    position: "absolute",
                    top: "0px",
                    left: "0px",
                }}
                type={"default"}
                disabled={this.state.disabled}
                icon={<EditOutlined />}
            />;
    }

    renderImages() {
        let title = "Edit ";

        if (this.state.visible.landscape) {
            title += "landscape banner URL";
        } else if (this.state.visible.portrait) {
            title += "portrait banner URL";
        } else if (this.state.visible.trailer) {
            title += "trailer ULR";
        }

        return <div>
            <Modal
                title={title}
                visible={this.state.popupVisible}
                closable={false}
                maskClosable={true}
                onOk={this.popupOk}
                footer={<Button type={"primary"} onClick={this.popupOk}>Ok</Button>}
                onCancel={this.popupCancel}
                forceRender
            >
                <Form.Item
                    name={["promoMaterial", "landscapeBanner"]}
                    rules={[{
                        required: true,
                        message: 'Please enter a URL for landscape banner!'
                    }]}
                >
                    <Input style={{display: (this.state.visible.landscape) ? "" : "none"}} />
                </Form.Item>
                <Form.Item
                    name={["promoMaterial", "portraitBanner"]} rules={[{
                        required: true,
                        message: 'Please enter a URL for portrait banner!'
                    }]}
                >
                    <Input style={{display: (this.state.visible.portrait) ? "" : "none"}} />
                </Form.Item>
                <Form.Item name={["promoMaterial", "trailer"]} rules={[{
                        required: true,
                        message: 'Please enter a URL for trailer!'
                    }]}
                >
                    <Input style={{display: (this.state.visible.trailer) ? "" : "none"}} />
                </Form.Item>
            </Modal>

            <Image.PreviewGroup>
                <Row>
                    <Col span={9}>
                        <div className={"editable-img"} >
                            <iframe
                                src={this.state.src.trailer.replace("watch?v=", "embed/")}
                                frameBorder="0"
                                allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                title="Trailer"
                                width={300}
                                height={150}
                            />
                            {this.renderEditButton("trailer")}
                        </div>
                        <div className={"editable-img"} >
                            <Image
                                src={this.state.src.landscape}
                                placeholder={true}
                                style={{objectFit: "cover"}}
                                width={300}
                                height={150}
                            />
                            {this.renderEditButton("landscape")}
                        </div>
                    </Col>
                    <Col span={8}>
                        <div className={"editable-img"} >
                            <Image
                                src={this.state.src.portrait}
                                placeholder={true}
                                style={{objectFit: "cover"}}
                                height={306}
                                width={200}
                            />
                            {this.renderEditButton("portrait")}
                        </div>
                    </Col>
                </Row>
            </Image.PreviewGroup>
        </div>;
    }

    renderTitleRow() {
        return <Form.Item>

            <Space align={"center"}>
                {/* "edit lock" button */}
                <Button
                    onClick={this.toggleDisabled}
                    type="default"
                    icon={<LockOutlined />}
                    />
                <Form.Item
                    name={"title"} rules={[{
                        required: true,
                        message: 'Please enter a movie title!'
                    }]} noStyle
                >
                    <Input
                        size={"large"}
                        disabled={this.state.disabled}
                        />
                </Form.Item>
                <Form.Item
                    name={"certificate"} rules={[{
                        required: true,
                        message: 'Please enter a certificate/age rating!'
                    }]} noStyle
                >
                    {this.renderNumberEdit("number")}
                </Form.Item>
            </Space>
        </Form.Item>;
    }

    render() {
        return <Form
            ref={this.formRef}
            name="movie-display-form"
            onFinish={this.sendUpdatedInfo}
            onFinishFailed={
                (err) => {console.log("error tho"); console.log(err)}}
            initialValues={this.values}
        >
            <Row>
                <Col span={12} >
                    <Divider {...this.dividerStyle}>
                        {this.renderTitleRow()}
                    </Divider>
                    {this.renderImages()}
                    {this.renderDescription()}
                    {/* this space is a hack to make the director less wide */}
                    <Space>
                        {this.renderDirector()}
                    </Space>
                    {this.renderList("leadActors", "Cast", this.renderCastItem, "cast", "cast member")}
                </Col>
                {/* a bit of blank space */}
                <Col span={2} />
                <Col span={10}>
                    {this.renderPrices()}
                    {this.renderList("screenings", "Screenings", this.renderScreeningItem, "screening")}
                </Col>
            </Row>
            <Form.Item>
                <Button
                    type={"primary"}
                    htmlType={"submit"}
                    disabled={this.state.disabled}
                >
                    Submit
                </Button>
            </Form.Item>
        </Form>
    }
}

const withHooks = (c) => {
    return (props) => {
        const navigate = useNavigate();
        const params = useParams();
        return <Movie params={params} navigate={navigate} {...props} />;
    };
};

export default withHooks(Movie);