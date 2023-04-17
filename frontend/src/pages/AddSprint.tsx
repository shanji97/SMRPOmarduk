import React, {useState, useMemo, useEffect} from "react";
import { Button, Form } from "react-bootstrap";
import { DateRange } from "react-date-range";
import {useParams} from 'react-router-dom';
import { SprintData, DateRangeSpecs, SprintBody } from "../classes/sprintData";
import Card from "../components/Card";

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css'; 
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {createSprint, reset, setActiveSprint, updateSprint} from "../features/sprints/sprintSlice";
import {getCestDate} from "../helpers/helpers";
import {toast} from "react-toastify";

interface AddSprintProps {
    isEdit: boolean,
    sprintId: string,
    nameInit: string,
    velocityInit: number,
    dateRangeInit: {
        startDate: Date,
        endDate: Date,
        key: string
    }
}

const AddSprint: React.FC<AddSprintProps> = ({isEdit, sprintId, nameInit, velocityInit, dateRangeInit}) => {
    const params = useParams();
    const dispatch = useAppDispatch();
    const {message, isError, isUpdated, isSuccess, sprints} = useAppSelector(state => state.sprints);

    useEffect(() => {
        if (isUpdated) {
            toast.success('Sprint updated!');
        }
        else if (isError && !isSuccess && message !== '') {
            toast.error(message);
        } else if (isSuccess && !isError && message === '') {
            toast.success('Sprint created!');
        }
        
        return () => {
            dispatch(reset())
        }
    }, [message, isError, isSuccess, dispatch, isUpdated]);

    useEffect(() => {
        if (isEdit) {
            setSprintData({
                name: nameInit,
                velocity: velocityInit,
            })
        } else {
            setSprintData({
                name: `Sprint ${sprints.length + 1}`,
                velocity: velocityInit,
            })
        }

    }, [sprints.length])

    const [sprintData, setSprintData] = useState<SprintData>({
        name: `Sprint ${sprints.length}`,
        velocity: velocityInit
    });

    const [dateRange, setDateRange] = useState<DateRangeSpecs>(dateRangeInit);
    const {name, velocity} = sprintData;

    const formIsValid = useMemo(() => {
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        const today = new Date();
        const todayWithoutTime = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate()
        );

        return (
          name !== '' &&
          velocity > 0 &&
          startDate >= todayWithoutTime &&
          startDate < endDate
        );
    }, [name, velocity, dateRange.startDate, dateRange.endDate]);

    const sprintDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSprintData(sprintData => ({
            ...sprintData,
            [e.target.name]: e.target.value
        }));
    }

    const handleSelect = (ranges: DateRangeSpecs) => {
        setDateRange(ranges.selection);
    };

    const submitNewSprint = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const sprintBody: SprintBody = {
            id: sprintId,
            projectId: params.projectID!,
            name,
            velocity,
            startDate: getCestDate(dateRange.startDate.toString()),
            endDate: getCestDate(dateRange.endDate.toString()),
        };
        const today = new Date();
        if (dateRange.startDate.getFullYear() === today.getFullYear() &&
              dateRange.startDate.getMonth() === today.getMonth() &&
              dateRange.startDate.getDate() === today.getDate()) {

            // dispatch(setActiveSprint(sprintBody))
        }

        if (isEdit) {
            dispatch(updateSprint(sprintBody));
        } else {
            dispatch(createSprint(sprintBody));
        }
    }

    return  (
        <Card style={{ marginTop: '2rem', width: '90%' }}>
            <h2 className='text-primary'>{isEdit ? 'Edit sprint' : 'Add a new sprint'}</h2>
            <Form onSubmit={submitNewSprint}>
                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Name</Form.Label>
                    <Form.Control 
                        type='text'
                        name='name'
                        value={name}
                        onChange={sprintDataChanged}
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formBasicName">
                    <Form.Label>Velocity</Form.Label>
                    <Form.Control 
                        type='number'
                        placeholder="velocity in hours"
                        min={1}
                        name='velocity'
                        value={velocity}
                        onChange={sprintDataChanged}
                    />
                </Form.Group>

                <div style={{ textAlign: 'center' }}>
                    <p>Select date range:</p>
                    <DateRange
                        ranges={[dateRange]}
                        onChange={handleSelect}
                    />
                </div>
                <Button type='submit' disabled={!formIsValid}>+ Add</Button>
            </Form>
        </Card>
    );
}

export default AddSprint;
