import React, { useEffect } from "react";
import { Container, Row, Col, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getActiveProject } from "../features/projects/projectSlice";
import {
  getBurndownData,
  getProjectStatistics,
} from "../features/tasks/taskSlice";

interface SprintData {
  date: string;
  spent: number;
  remaining: number;
  ideal?: number;
}

const calculateCumulativeSpent = (arr: SprintData[]) => {
  let totalSpend = arr.reduce((acc, item) => acc + item.spent, 0);
  let spentCumulative = 0;

  return arr.map((item) => {
    spentCumulative += item.spent;
    return {
      ...item,
      remaining: item.remaining,
      spent: totalSpend - spentCumulative,
    };
  });
};

const calculateIdeal = (arr: SprintData[]) => {
  const result: SprintData[] = [];
  let idealRemaining = arr[0].spent;
  let step = idealRemaining / (arr.length - 1);

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    if (i === arr.length - 1) {
      // if this is the last point
      result.push({
        ...current,
        ideal: 0, // set ideal value to 0
      });
    } else {
      result.push({
        ...current,
        ideal: Number(idealRemaining.toFixed(1)), // round to 1 decimal spot
      });
      idealRemaining -= step;
    }
  }

  return result;
};

const Burndown = () => {
  const params = useParams();
  const dispatch = useAppDispatch();
  const { burndownData, stats } = useAppSelector((state) => state.tasks);

  const burndownDataFetched = Object.keys(burndownData).length !== 0;
  const statsFetched = Object.keys(stats).length !== 0;

  useEffect(() => {
    if (params.projectId) {
      dispatch(getBurndownData(params.projectId));
      dispatch(getProjectStatistics(params.projectId));
    }
  }, [params]);

  const renderDiagram = () => {
    const newData = burndownData.days;
    const newDataCumulative = calculateCumulativeSpent(newData);
    const newDataIdeal = calculateIdeal(newDataCumulative);
    const data = newDataIdeal;
    // debugger;
    return (
      <Row className="mb-4">
        <Col className="d-flex flex-column align-items-center">
          <h2 className="mb-4">Burndown Chart</h2>
          <LineChart width={800} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              label={{
                value: `Hours`,
                style: {
                  textAnchor: "middle",
                  fontWeight: "bold",
                  fontFamily: "Arial",
                },
                angle: -90,
                position: "left",
                offset: -10,
              }}
            />
            <Tooltip />
            <Legend wrapperStyle={{ fontFamily: "Arial" }} />
            <Line
              dataKey="spent"
              name="Workload"
              stroke="#E91E63"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="remaining"
              name="Remaining work"
              stroke="#00E676"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="ideal"
              name="Ideal progress"
              stroke="#03A9F4"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </Col>
      </Row>
    );
  };

  return (
    <Container className="mb-3 mt-4">
      {burndownDataFetched && renderDiagram()}
      <Row className="mt-4">
        <Col className="d-flex flex-column align-items-center">
          <h2 className="mb-4 mt-3">Developer work statistics</h2>
          <Table striped bordered hover className="w-75 mt-2">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Number of tasks</th>
                <th>Hours</th>
              </tr>
            </thead>
            <tbody>
              {statsFetched &&
                stats.map((userStat: any, index: number) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{`${userStat.firstName} ${userStat.lastName}`}</td>
                    <td>{userStat.taskCount}</td>
                    <td>{userStat.spent}</td>
                  </tr>
                ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </Container>
  );
};

export default Burndown;
