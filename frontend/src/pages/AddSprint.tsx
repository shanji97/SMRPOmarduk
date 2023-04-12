import { useState, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { DateRange } from "react-date-range";
import { SprintData, DateRangeSpecs, SprintBody } from "../classes/sprintData";
import Card from "../components/Card";

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css'; 
import { useAppDispatch, useAppSelector } from "../app/hooks";

const AddSprint = () => {
    const dispatch = useAppDispatch();
    const {} = useAppSelector(state => state.sprints);
    const [sprintData, setSprintData] = useState<SprintData>({
        name: '',
        velocity: 0
    });

    const [dateRange, setDateRange] = useState<DateRangeSpecs>({
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    });

    const {name, velocity} = sprintData;

    const formIsValid = useMemo(() => {
        return (
            name !== '' && 
            velocity > 0 && 
            new Date(dateRange.startDate) > new Date() &&
            new Date(dateRange.startDate) < new Date(dateRange.endDate)
        ); 
    }, [name, velocity, dateRange.startDate]);

    const sprintDataChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSprintData(sprintData => ({
            ...sprintData,
            [e.target.name]: e.target.value
        }));
    }

    const handleSelect = (ranges: DateRangeSpecs) => {
        setDateRange(ranges.selection);
    };

    const submitNewSprint = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const sprintBody: SprintBody = {
            name,
            velocity,
            startDate: dateRange.startDate.toString(),
            endDate: dateRange.endDate.toString()
        };
        console.log(sprintBody);
        // dispatch()
    }

    return  (
        <Card style={{ marginTop: '3rem' }}>
            <h2>Add a new sprint</h2>
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

                <div>
                    <p>Select date range</p>
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
