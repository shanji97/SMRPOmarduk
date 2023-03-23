import { useState, useMemo } from "react";
import { Button, Form } from "react-bootstrap";
import { DateRange } from "react-date-range";
import Card from "../components/Card";

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css'; 

interface SprintData {
    name: string,
    velocity: number,
}

interface DateRange {
    startDate: Date,
    endDate: Date,
    key: string,
    selection?: any
}

const AddSprint = () => {
    const [sprintData, setSprintData] = useState<SprintData>({
        name: '',
        velocity: 0
    });

    const [dateRange, setDateRange] = useState<DateRange>({
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

    const handleSelect = (ranges: DateRange) => {
        setDateRange(ranges.selection);
    };

    const submitNewSprint = (e: React.FormEvent<HTMLFormElement>) => {
        console.log(name, velocity);
        console.log(dateRange.startDate, dateRange.endDate);
        // dispatch()
        e.preventDefault();
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
