import React from 'react';
import { Outlet, Link, Redirect } from 'react-router-dom';
import {
    Layout,
    Menu
} from 'antd';


const { Header, Footer, Sider, Content } = Layout;
const { SubMenu } = Menu;


class Navigation extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <Layout>
            {/* BUG: (minor) navigating straight to a path doesn't highlight
            the appropriate menu */}
            <Sider
                theme="light"
                style={{height: "100vh"}}
            >
                <Menu
                    mode="inline"
                    theme="light"
                >
                    <Menu.ItemGroup
                        key="the-menu"
                        title="Manager"
                    >
                        <Menu.Item key="home">
                            <Link to="">Home</Link>
                        </Menu.Item>
                        <Menu.Item key="movies">
                            <Link to="movies">Movies</Link>
                        </Menu.Item>

                        {/* <SubMenu title="Movies">
                        </SubMenu> */}

                        <Menu.Item key="employees">
                            <Link to="employees">Employees</Link>
                        </Menu.Item>

                        <Menu.Item key="stats">
                            <Link to="statistics">Statistics</Link>
                        </Menu.Item>
                    </Menu.ItemGroup>
                </Menu>
            </Sider>

            {/* ATTENTION FELLOW CODE MONKEYS:
            this is the catch-all incantation that renders the children
            from the big js object where we put ALL routes in */}
            <Content style={{padding: "1em"}}>
                <Outlet />
            </Content>
        </Layout>;
    }
}

export default Navigation;