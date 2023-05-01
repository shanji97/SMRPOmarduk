import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  Tooltip,
} from "recharts";

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
  let idealRemaining = arr[0].remaining;
  let step = idealRemaining / (arr.length - 1);

  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    result.push({
      ...current,
      ideal: idealRemaining,
    });
    idealRemaining -= step;
  }

  return result;
};

// const updateArrayWithSprintEndData = (arr: SprintData[]) => {
//   // iterate through array from end
//   for (let i = arr.length - 1; i >= 0; i--) {
//     const currentData = arr[i];
//     const nextData = arr[i + 1];
//     // debugger;

//     if (currentData.date === currentData.sprintEnd && nextData) {
//       const remainingToAdd = nextData.remainingOriginal;

//       for (let j = 0; j <= i; j++) {
//         arr[j].remaining += remainingToAdd;
//       }
//     }
//   }

//   return arr;
// };

const dataRaw4 = {
  remaining: 156,
  days: [
    {
      date: "2023-04-11",
      remaining: 156,
      spent: 0,
    },
    {
      date: "2023-04-12",
      remaining: 144,
      spent: 13,
    },
    {
      date: "2023-04-13",
      remaining: 137,
      spent: 4,
    },
    {
      date: "2023-04-14",
      remaining: 130,
      spent: 8,
    },
    {
      date: "2023-04-15",
      remaining: 120,
      spent: 12,
    },
    {
      date: "2023-04-16",
      remaining: 111,
      spent: 11,
    },
    {
      date: "2023-04-17",
      remaining: 104,
      spent: 7,
    },
    {
      date: "2023-04-18",
      remaining: 104,
      spent: 0,
    },
    {
      date: "2023-04-19",
      remaining: 98,
      spent: 7,
    },
    {
      date: "2023-04-20",
      remaining: 91,
      spent: 7,
    },
    {
      date: "2023-04-21",
      remaining: 90,
      spent: 1,
    },
    {
      date: "2023-04-22",
      remaining: 67,
      spent: 25,
    },
    {
      date: "2023-04-23",
      remaining: 57,
      spent: 14,
    },
    {
      date: "2023-04-24",
      remaining: 52,
      spent: 5,
    },
    {
      date: "2023-04-25",
      remaining: 52,
      spent: 0,
    },
    {
      date: "2023-04-26",
      remaining: 46,
      spent: 7,
    },
    {
      date: "2023-04-27",
      remaining: 43,
      spent: 5,
    },
    {
      date: "2023-04-28",
      remaining: 31,
      spent: 10,
    },
    {
      date: "2023-04-29",
      remaining: 24,
      spent: 7,
    },
    {
      date: "2023-04-30",
      remaining: 1,
      spent: 17,
    },
    {
      date: "2023-05-01",
      remaining: 0,
      spent: 6,
    },
  ],
};

const Burndown = () => {
  const newData = dataRaw4.days;
  const newDataCumulative = calculateCumulativeSpent(newData);
  const newDataIdeal = calculateIdeal(newDataCumulative);

  const data = newDataCumulative;
  return (
    <Container className="mb-3 mt-4">
      <Row className="mb-4">
        <Col className="d-flex flex-column align-items-center">
          <h1 className="mb-4 text-primary">Burndown Chart</h1>
          <LineChart width={800} height={400} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line dataKey="spent" stroke="#f44336" />
            <Line dataKey="remaining" stroke="#82ca9d" />
            <Line dataKey="ideal" stroke="#000" />
          </LineChart>
        </Col>
      </Row>
      <Row className="mt-5">
        <Col className="d-flex flex-column align-items-center">
          <h1 className="mb-4 text-primary">Burndown Table</h1>
          <table className="table w-75" style={{ tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th>Day</th>
                <th>Actual Effort</th>
                <th>Estimated Remaining Effort</th>
              </tr>
            </thead>
            <tbody>
              {data.map((point, index) => (
                <tr key={index}>
                  {/* <td>{point.date}</td>
                  <td>{point.actualRemaining}</td>
                  <td>{point.estimatedRemaining}</td> */}
                </tr>
              ))}
            </tbody>
          </table>
        </Col>
      </Row>
    </Container>
  );
};

export default Burndown;
