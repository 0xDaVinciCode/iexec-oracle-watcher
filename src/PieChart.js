import Debug from 'debug';
import { useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { PieChart } from 'react-minimal-pie-chart';

const debug = Debug('PieChart');

const dataMock = [
  { tooltip: 'Truc', value: 39, color: '#FFD15A' },
  { tooltip: 'Failed', value: 1, color: '#EF5454' },
  { tooltip: 'Active', value: 3, color: '#6DC7FF' },
];

const Pie = (props) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div data-tip="" data-for="chart" className={props.className}>
      <PieChart
        data={dataMock}
        lineWidth={20}
        paddingAngle={18}
        animate
        rounded
        label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
        labelStyle={(index) => ({
          fill: props.data[index].color,
          fontSize: '0.8em',
        })}
        labelPosition={65}
        onMouseOver={(_, index) => {
          debug('index', index);
          setHovered(index);
        }}
        onMouseOut={() => {
          setHovered(null);
        }}
        {...props}
      />
      <ReactTooltip
        id="chart"
        getContent={() =>
          hovered === null ? null : props.data[hovered].tooltip
        }
      />
    </div>
  );
};

export default Pie;
