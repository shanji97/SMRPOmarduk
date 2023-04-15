import React, {useState, useMemo, useEffect} from "react";
import { Button, Form } from "react-bootstrap";
import { DateRange } from "react-date-range";
import {useParams} from 'react-router-dom';
import { SprintData, DateRangeSpecs, SprintBody } from "../classes/sprintData";
import Card from "../components/Card";

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css'; 
import {useAppDispatch, useAppSelector} from "../app/hooks";
import {createSprint, reset} from "../features/sprints/sprintSlice";
import {getCestDate} from "../helpers/helpers";
import {toast} from "react-toastify";

const AddSprint = () => {
    const params = useParams();
    const dispatch = useAppDispatch();
    const {message, isError, isSuccess, sprints} = useAppSelector(state => state.sprints);

    useEffect(() => {
        if (isError && !isSuccess && message !== '') {
            toast.error(message);
        } else if (isSuccess && !isError && message === '') {
            toast.success('Sprint created!');
        }
    }, [message, isError, isSuccess])

    const [sprintData, setSprintData] = useState<SprintData>({
        name: `Sprint ${sprints.length}`,
        velocity: 0
    });

    const [dateRange, setDateRange] = useState<DateRangeSpecs>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });
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
            projectId: params.projectID!,
            name,
            velocity,
            startDate: getCestDate(dateRange.startDate.toString()),
            endDate: getCestDate(dateRange.endDate.toString()),
        };
        dispatch(createSprint(sprintBody));
    }

    return  (
        <Card style={{ marginTop: '3rem' }}>
            <h2 className='text-primary'>Add a new sprint</h2>
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
