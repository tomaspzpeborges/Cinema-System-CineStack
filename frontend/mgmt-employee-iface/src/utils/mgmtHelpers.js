import axios from 'axios';

import { notification } from 'antd';

export function axiosError (error) {
    if (error.response != undefined) {
        if (error.response.status === 401) {
            notification["error"]({
                message: "Please log in!"
            });
        } else if (error.response.status === 403) {
            notification["warning"]({
                message: "You don't have permission to do this!"
            });
        } else {
            notification["error"]({
                message: "Sorry, server error :("
            });
            console.log(
                `server said: ${error.response.status}, reason: ${error.response.data.reason}`
            );
        }
    } else {
        notification["error"]({
            message: "Sorry, server error :("
        });
        console.log(error);
    }
}