import React from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import { getToken } from './browserStorage';
import {
    Notifications,
    App,
    Login,
    RestorePassword,
    Overview,
    Profile,
    FAQ,
    About,
    Team,
    MyProducer,
    Producer,
    BuyEnergy,
    SellEnergy,
    ShowTransactions,
    Trading
} from '../containers';
import { Breadcrumbs as messages } from '../services/translations/messages';

export const PATHS = {
    overview: {
        id: '',
        path: '/',
        icon: 'faHome',
        label: messages.overview
    },
    documents: {
        id: 'documents',
        path: '/documents'
    },
    submit_meter: {
        id: 'submit_meter',
        path: '/submit_meter'
    },
    trading: {
        id: 'trading',
        path: '/trading',
        icon: 'faChartBar',
        label: messages.trading
    },
    profile: {
        id: 'profile',
        path: '/profile'
    },
    team: {
        id: 'team',
        path: '/team'
    },
    about: {
        id: 'about',
        path: '/about'
    },
    faq: {
        id: 'faq',
        path: '/faq'
    },
    myProducer: {
        id: 'my_producer',
        path: '/my_producer',
        label: messages.myProducer
    },
    producer: {
        id: 'producer',
        path: '/buy_energy/producer/:producerId',
        label: messages.producer
    },
    buyEnergy: {
        id: 'buy_energy',
        path: '/buy_energy',
        label: messages.buyEnergy
    },
    sellEnergy: {
        id: 'sell_energy',
        label: messages.sellEnergy,
        path: '/sell_energy'
    },
    showTransactions: {
        id: 'show_transactions',
        label: messages.showTransactions,
        path: '/show_transactions'
    }
};

const BuyEnergyRoute = () => (
    <React.Fragment>
        <Route exact path={PATHS.buyEnergy.path} component={BuyEnergy} />
        <Route path={PATHS.producer.path} component={Producer} />
    </React.Fragment>
);

const OverviewRoute = () => (
    <React.Fragment>
        <Route exact path={PATHS.overview.path} component={Overview} />
        <Route path={PATHS.myProducer.path} component={MyProducer} />
        <Route path={PATHS.sellEnergy.path} component={SellEnergy} />
        <Route path={PATHS.showTransactions.path} component={ShowTransactions} />
        <BuyEnergyRoute />
    </React.Fragment>
);

const PublicRoute = ({ component: Component, ...otherProps }) => (
    <Route
        {...otherProps}
        render={props => {
            if (getToken()) {
                return <Redirect to="/" />;
            }
            return <Component {...props} />;
        }}
    />
);

const AppMainLayout = () => {
    if (getToken()) {
        return (
            <div id="app-layout">
                <App>
                    <OverviewRoute />
                    <Route exact path={PATHS.trading.path} component={Trading} />
                    {/*<Route path={PATHS.documents.path} component={Documents} />*/}
                    {/*<Route path={PATHS.submit_meter.path} component={SubmitMeter} />*/}
                    <Route path={PATHS.profile.path} component={Profile} />
                    <Route path={PATHS.team.path} component={Team} />
                    <Route path={PATHS.about.path} component={About} />
                    <Route path={PATHS.faq.path} component={FAQ} />
                </App>
            </div>
        );
    }

    return <Redirect to={`/login?next=${encodeURIComponent(window.location.pathname)}`} />;
};

export const Routes = () => (
    <div id="routes">
        <Notifications />
        <Switch>
            <PublicRoute path="/login" component={Login} />
            <PublicRoute path="/restore-password" component={RestorePassword} />
            <Route path="/" component={AppMainLayout} />
        </Switch>
    </div>
);
