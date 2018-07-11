import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AbstractContainer from '../AbstractContainer/AbstractContainer';
import { MeterReadingForm } from '../../components';

import './SubmitMeter.css';
import {
    performGetMeterReadingsHistory,
    performGetMeterNumber,
    performSubmitMeterReading
} from '../../action_performers/consumption';
import { performSetupLoaderVisibility } from '../../action_performers/app';
import { performPushNotification } from '../../action_performers/notifications';
import { SubmitMeterReadings as messages } from '../../services/translations/messages';
import Validator from 'async-validator';

export class SubmitMeter extends AbstractContainer {
    constructor(props, context) {
        super(props, context);

        this.state = {
            errors: {}
        };
    }

    static mapStateToProps(state) {
        return {
            meterReadingsHistory: state.Consumption.meterReadingsHistory.data,
            // TODO: Change it after integrate real endpoint
            meterNumber: state.Consumption.meterNumber.data.meterNumber,
            // TODO: Change it after integrate real endpoint
            submittedMeterReading: state.Consumption.submittedMeterReading,
            loading:
                state.Consumption.meterReadingsHistory.loading ||
                state.Consumption.submittedMeterReading.loading ||
                state.Consumption.meterNumber.loading,
            error:
                state.Consumption.meterReadingsHistory.error ||
                state.Consumption.meterNumber.error ||
                state.Consumption.submittedMeterReading.error
        };
    }

    componentDidMount() {
        performGetMeterReadingsHistory();
        performGetMeterNumber();
    }

    componentDidUpdate(prevProps) {
        const { loading, error } = this.props;

        if (!loading && error && error !== prevProps.error) {
            performPushNotification({ message: error.message, type: 'error' });
        }

        performSetupLoaderVisibility(loading);
    }

    prepareValidator() {
        const validationSchema = {
            meterReadings: {
                type: 'number',
                required: true,
                transform(value) {
                    return (value && Number(value)) || value;
                },
                message: 'Meter readings is not a number'
            },
            date: {
                required: true,
                message: 'Date is required'
            },
            comment: {
                type: 'string',
                required: true,
                message: 'Comment is not a string'
            }
        };

        return new Validator(validationSchema);
    }

    submitMeterReading(meterReading) {
        const validator = this.prepareValidator();

        validator.validate(meterReading, errors => {
            if (errors) {
                return this.setState({
                    errors: errors.reduce(
                        (errorsState, { field, message }) => ({
                            ...errorsState,
                            [field]: message
                        }),
                        {}
                    )
                });
            }
            performSubmitMeterReading(meterReading);
            this.setState({ errors: {} });
        });
    }

    render() {
        const { formatMessage, locale } = this.context.intl;
        const labels = this.prepareLabels(messages);
        const { loading, meterNumber, submittedMeterReading } = this.props;
        const { errors } = this.state;
        const isMeterReadingSuccessfullySubmit = !submittedMeterReading.loading && !submittedMeterReading.error;

        return (
            <section className="submit-meter-readings-page" aria-busy={loading}>
                <section>
                    <h1>{formatMessage(messages.header)}</h1>
                    <MeterReadingForm
                        isSuccessfullySubmitted={isMeterReadingSuccessfullySubmit}
                        errors={errors}
                        labels={labels}
                        locale={locale}
                        numberOfMeter={meterNumber}
                        onSubmit={meterReading => this.submitMeterReading(meterReading)}
                    />
                </section>
                <aside>history</aside>
            </section>
        );
    }
}

SubmitMeter.contextTypes = {
    intl: PropTypes.shape({
        formatMessage: PropTypes.func.isRequired
    }).isRequired
};

SubmitMeter.propTypes = {
    meterReadingsHistory: PropTypes.shape({
        consumptionUnitLabel: PropTypes.string,
        consumptions: PropTypes.arrayOf(PropTypes.object),
        isSeriesBasedOnLiveData: PropTypes.bool
    }).isRequired,
    loading: PropTypes.bool,
    meterNumber: PropTypes.number,
    submittedMeterReading: PropTypes.shape({
        data: PropTypes.object,
        loading: PropTypes.bool,
        error: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
    }).isRequired
};

export default connect(SubmitMeter.mapStateToProps)(SubmitMeter);
