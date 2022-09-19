import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router';
import axios from 'axios';
import {
    Form,
    Input,
    Select,
    Button,
    notification,
} from 'antd';
import { LockOutlined, CopyOutlined } from '@ant-design/icons';
import { axiosError } from '../utils/mgmtHelpers';


class Employee extends React.Component {
    constructor(props) {
        super(props);

        this.formRef = React.createRef();
        this.values = {};

        this.creating = props.params.name === "new";
        this.state = {
            disabled: !this.creating,
            resetToken: ""
        };

        // NOTE: uncomment this for test data
        // this.values = {
        //     name: "Minecraft Steve",
        //     type: 1,
        //     username: "mcsteve",
        //     password: "this_is_a_hash_i_hope (or i don't receive it PLEASE)",
        // }

        if (!this.creating) {
            axios.get(
                "/api/v1/staff/profile/" + this.props.params.name,
            ).then((resp) => {
                this.values = resp.data.staff;
                this.formRef.current.setFieldsValue(this.values);
                this.setState({resetToken: this.values.passResetToken})
            }).catch((e) => axiosError(e));
        }
    }

    sendUpdatedInfo = (values) => {
        console.log("submitting")

        let resp = {staffData: values}
        let request;

        if (this.creating) {
            request = axios.post("/api/v1/staff/profile/",
                resp
            );
        } else {
            request = axios.put(
                "/api/v1/staff/profile/" + this.props.params.name,
                resp
            );
        }

        request.then((response) => {
            this.setState({disabled: true, resetToken: response.data.passResetToken});
            notification["success"]({
                message: ((this.creating) ? "Created" : "Updated") + " successfully!"
            });
            if (this.creating) {
                this.props.navigate("../" + response.data.result);
                this.creating = false;
            }
            this.setState({resetToken: response.data.passResetToken});
        }).catch((e) => axiosError(e));
    }

    requestPasswordReset = () => {
        axios.post("/api/v1/staff/passreset/" + this.props.params.name)
        .then((response) => {
            notification["success"]({
                message: "Password reset successful!"
            });
            this.setState({resetToken: response.data.passResetToken})
        }).catch((e) => axiosError(e));
    }

    copyToClipboard = (e) => {
        // this is the copying code
        const el = document.createElement('textarea');
        el.value = e.target.textContent;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        notification["success"]({
            message: "Copied to clipboard successfully"
        });
    }

    toggleDisabled = () => {
        this.setState({disabled: !this.state.disabled});
    }

    renderInput(name) {
        return <Form.Item
            name={name} label={name}
            rules={[{
                required: true,
                message: `Please enter the employee's ${name}`
            }]}
        >
            <Input disabled={this.state.disabled} />
        </Form.Item>;
    }

    renderTypeSelect() {
        let options = [["employee" , 1], ["manager", 0]];

        return <Form.Item
            name={"type"}
            label={"employee type"}
            rules={[{
                required: true,
                message: "Please select the employee type!"
            }]}
        >
            <Select disabled={this.state.disabled}>
                {options.map((val) => <Select.Option
                    // key is just to shut up the compiler
                    key={val[0]}
                    value={val[1]}
                >{val[0]}</Select.Option>)}
            </Select>
        </Form.Item>
    }

    renderResetPasswordButton() {
        if (this.creating)
            return;

        if (this.state.resetToken) {
            return <Button
                    type={"link"}
                    icon={<CopyOutlined />}
                    onClick={this.copyToClipboard}
                >
                    {axios.defaults.baseURL + "/passwordReset/" + this.state.resetToken}
                </Button>;
        } else {
            return <Button
                onClick={this.requestPasswordReset}
                type="default"
                width={"60%"}
                disabled={this.state.disabled}
            >
                Reset password
            </Button>;
        }
    }

    render() {
        return <Form
            ref={this.formRef}
            name="movie-display-form"
            onFinish={this.sendUpdatedInfo}
            onFinishFailed={
                (err) => {console.log("error tho"); console.log(err)}}
            initialValues={this.values}
            labelCol={{span: 2}}
            wrapperCol={{span: 5}}
        >
            <Button
                onClick={this.toggleDisabled}
                type="default"
                icon={<LockOutlined />}
            />
                {this.renderInput("name")}
                {this.renderInput("username")}
                {this.renderTypeSelect()}

                <Form.Item
                    label={(!this.state.resetToken) ? "" : "password reset link"}
                >
                    {this.renderResetPasswordButton()}
                </Form.Item>

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
        return <Employee params={params} navigate={navigate} {...props} />;
    };
};

export default withHooks(Employee);